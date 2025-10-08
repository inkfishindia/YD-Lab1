
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_KEY } from '../api-keys';
import { auth } from '../config';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

interface IAuthContext {
  isSignedIn: boolean;
  isLoading: boolean;
  currentUser: GoogleUser | null;
  initError: string | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.metadata.readonly';
const DISCOVERY_DOCS = [
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // This effect handles the GAPI client initialization for Workspace APIs
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    
    gapiScript.onload = () => {
      (window as any).gapi.load('client', () => {
        (window as any).gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        }).catch((e: any) => {
          console.error("GAPI client init error:", e);
          const detailedError = e?.result?.error?.message || e?.message || JSON.stringify(e);
          let userFriendlyMessage = `Failed to initialize Google API client. This might be due to a configuration issue in your Google Cloud project.`;
          if (detailedError.includes('API not enabled')) {
            userFriendlyMessage = `Configuration Error: An API required by this application (e.g., Sheets, Calendar, Gmail, Drive) is not enabled for your API key. Please enable it in the Google Cloud Console.`;
          }
          setInitError(`${userFriendlyMessage}\n\nTechnical Details:\n${detailedError}`);
        });
      });
    };
    
    document.body.appendChild(gapiScript);

    // This effect handles Firebase authentication state
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName || 'No Name',
          email: user.email || 'No Email',
          imageUrl: user.photoURL || '',
        });
        setIsSignedIn(true);
      } else {
        setCurrentUser(null);
        setIsSignedIn(false);
        (window as any).gapi?.client?.setToken(null);
      }
      setIsLoading(false);
    });

    return () => {
      document.body.removeChild(gapiScript);
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    SCOPES.split(' ').forEach(scope => provider.addScope(scope));
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        (window as any).gapi.client.setToken({ access_token: credential.accessToken });
      } else {
        throw new Error("No access token found after sign-in.");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      // You can add more user-friendly error handling here
      alert(`Sign-in failed: ${error.message}`);
    }
  };

  const signOut = () => {
    firebaseSignOut(auth).catch(error => console.error("Sign out error:", error));
  };

  const authContextValue: IAuthContext = {
    isSignedIn,
    isLoading,
    currentUser,
    initError,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

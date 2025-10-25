import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

import { getAuthAccessToken, setAuthAccessToken, initTC } from '../services/googleAuth';

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

// Added for strict type checking
interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
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

const LOCAL_STORAGE_KEY = 'google_auth_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const signOut = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const token = getAuthAccessToken(); // Get token from our service
    if (token && (window as any).google?.accounts?.oauth2) {
      (window as any).google.accounts.oauth2.revoke(
        token,
        () => {}, // Callback for revocation
      );
    }
    setAuthAccessToken(null); // Clear local token
    setCurrentUser(null);
    setIsSignedIn(false);
  }, []);

  const handleTokenResponse = useCallback(
    async (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        setAuthAccessToken(tokenResponse.access_token); // Store token in our service
        try {
          const profileResponse = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            },
          );
          if (!profileResponse.ok) {
            throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
          }
          const profile: GoogleProfile = await profileResponse.json();
          const user = {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            imageUrl: profile.picture,
          };
          setCurrentUser(user);
          setIsSignedIn(true);

          // Persist session to localStorage
          const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
          const session = {
            accessToken: tokenResponse.access_token,
            expiresAt,
            user,
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
        } catch (error) {
          console.error('Error fetching user profile:', error);
          signOut();
        }
      }
    },
    [signOut],
  );

  useEffect(() => {
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;

    gisScript.onload = () => {
      try {
        // FIX: Access VITE_GOOGLE_CLIENT_ID from process.env instead of import.meta.env
        if (!process.env.VITE_GOOGLE_CLIENT_ID) {
          throw new Error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables.');
        }
        const client = initTC(handleTokenResponse); // Use our initTC function
        setTokenClient(client);
        
        // Check for a stored session and attempt to restore
        const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session && session.accessToken && session.expiresAt > Date.now()) {
            setAuthAccessToken(session.accessToken);
            setCurrentUser(session.user);
            setIsSignedIn(true);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
        setIsLoading(false); // Finished loading GIS and checking session
      } catch (e: any) {
          console.error("Error initializing Google Identity Services:", e);
          let errorMessage = `Failed to initialize Google Sign-In services.`;
          if (e.message) {
            errorMessage += ` Error: ${e.message}`;
          } else if (typeof e === 'object' && e !== null) {
            errorMessage += ` Details: ${JSON.stringify(e)}`;
          }
          setInitError(errorMessage);
          setIsLoading(false);
      }
    };
    
    document.body.appendChild(gisScript);

    return () => {
      document.body.removeChild(gisScript);
    };
  }, [handleTokenResponse]);

  const signIn = useCallback(() => {
    if (tokenClient) {
      // Prompt the user to select an account.
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } else {
      console.error('Token client not initialized.');
      setInitError('Sign-in service is not ready. Please try again in a moment.');
    }
  }, [tokenClient]);

  const value = {
    isSignedIn,
    isLoading,
    currentUser,
    initError,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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
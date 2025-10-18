import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

// FIX: Import API keys from api-keys.ts to resolve TypeScript error with import.meta.env.
import { API_KEY, GOOGLE_CLIENT_ID } from '../api-keys';

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

const SCOPES =
  'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
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
    const token = (window as any).gapi?.client?.getToken();
    if (token && (window as any).google?.accounts?.oauth2) {
      (window as any).google.accounts.oauth2.revoke(
        token.access_token,
        () => {},
      );
    }
    (window as any).gapi?.client?.setToken(null);
    setCurrentUser(null);
    setIsSignedIn(false);
  }, []);

  const handleTokenResponse = useCallback(
    async (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        (window as any).gapi.client.setToken(tokenResponse);
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
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;

    let gapiReady = false;
    let gisReady = false;

    const checkAndFinalizeLoading = () => {
      if (gapiReady && gisReady) {
        setIsLoading(false);
      }
    };

    gapiScript.onload = () => {
      (window as any).gapi.load('client', () => {
        (window as any).gapi.client
          .init({
            // FIX: Use imported API_KEY instead of import.meta.env.
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          })
          .then(() => {
            // GAPI client is ready. Check for a stored session.
            /* Temporarily disabled for testing logged-out state
          try {
            const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedSession) {
              const session = JSON.parse(storedSession);
              // Check if session is expired
              if (session && session.accessToken && session.expiresAt > Date.now()) {
                // Restore session
                (window as any).gapi.client.setToken({ access_token: session.accessToken });
                setCurrentUser(session.user);
                setIsSignedIn(true);
              } else {
                // Clear expired session
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              }
            }
          } catch (e) {
            console.error("Could not restore session:", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
          */

            gapiReady = true;
            checkAndFinalizeLoading();
          })
          .catch((e: any) => {
            console.error('Original GAPI client init error:', e);

            let detailedError = 'Could not extract detailed error message.';
            try {
              // Attempt to access the most common error locations first
              if (e?.result?.error?.message) {
                detailedError = e.result.error.message;
              } else if (e?.message) {
                detailedError = e.message;
              } else {
                // Fallback to stringifying the entire object safely.
                // This handles cases where the error is not a standard Error object.
                detailedError = JSON.stringify(e, null, 2);
              }
            } catch (stringifyError) {
              detailedError =
                'Failed to stringify the error object. Check the console for the raw object.';
            }

            let userFriendlyMessage = `Failed to initialize the Google API client. This is usually due to a configuration issue in your Google Cloud project.`;

            if (
              detailedError.includes('API not enabled') ||
              detailedError.includes('PERMISSION_DENIED') ||
              detailedError.includes('API_KEY_SERVICE_BLOCKED')
            ) {
              userFriendlyMessage =
                'Configuration Error: An API required by this application (e.g., Sheets, Calendar, Gmail, Drive) is not enabled for your API key.\n\n' +
                'To fix this, please visit the Google Cloud Console, find "APIs & Services > Library", ' +
                'search for the required APIs, and click ENABLE for each one.';
            } else if (detailedError.includes('API key not valid')) {
              userFriendlyMessage =
                'Configuration Error: The provided API Key is not valid.\n\n' +
                'Please double-check the `VITE_API_KEY` in your environment file and ensure it has no restrictions in the Google Cloud Console.';
            }

            setInitError(
              `${userFriendlyMessage}\n\nTechnical Details:\n${detailedError}`,
            );

            gapiReady = true;
            checkAndFinalizeLoading();
          });
      });
    };

    gisScript.onload = () => {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          // FIX: Use imported GOOGLE_CLIENT_ID instead of import.meta.env.
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: handleTokenResponse,
        });
        setTokenClient(() => client);
        gisReady = true;
        checkAndFinalizeLoading();
      } catch (e: any) {
        const errorDetails = e.message || JSON.stringify(e);
        console.error('Error initializing Google Identity Services:', errorDetails);
        setInitError(
          `Failed to initialize Google Identity Services: ${errorDetails}`,
        );
        gisReady = true;
        checkAndFinalizeLoading();
      }
    };

    document.body.appendChild(gapiScript);
    document.body.appendChild(gisScript);

    return () => {
      document.body.removeChild(gapiScript);
      document.body.removeChild(gisScript);
    };
  }, [handleTokenResponse]);

  const signIn = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      console.error('Google Identity Services client not ready.');
      setInitError(
        'Google Sign-In client is not available. Please try refreshing the page.',
      );
    }
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

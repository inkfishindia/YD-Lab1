// services/googleAuth.ts

let accessToken: string | null = null;

export const setAuthAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAuthAccessToken = (): string | null => {
  return accessToken;
};

export const initTC = (callback: (tokenResponse: any) => void) => {
  if (!(window as any).google?.accounts?.oauth2) {
    throw new Error('Google Identity Services script not loaded.');
  }
  return (window as any).google.accounts.oauth2.initTokenClient({
    client_id: process.env.VITE_GOOGLE_CLIENT_ID, // Use VITE_GOOGLE_CLIENT_ID
    scope:
      'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly',
    callback: callback,
    error_callback: (error: any) => {
      console.error('Google token client error (from initTC):', error);
    },
  });
};

export const signIn = (tokenClient: any) => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } else {
    console.error('Token client not initialized in googleAuth.ts signIn.');
  }
};
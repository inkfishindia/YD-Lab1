// services/googleAuth.ts

let accessToken: string | null = null;

export const setAuthAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAuthAccessToken = (): string | null => {
  return accessToken;
};

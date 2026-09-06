const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY;

if (!API_URL) {
  throw new Error("VITE_API_URL no está definida");
}

if (!ACCESS_TOKEN_KEY) {
  throw new Error("VITE_ACCESS_TOKEN_KEY no está definida");
}

if (!REFRESH_TOKEN_KEY) {
  throw new Error("VITE_REFRESH_TOKEN_KEY no está definida");
}

export const env = {
  apiUrl: API_URL,
  accessTokenKey: ACCESS_TOKEN_KEY,
  refreshTokenKey: REFRESH_TOKEN_KEY,
} as const;

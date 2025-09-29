const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://marden-taupe.vercel.app';
  }
  return 'http://localhost:5173';
};

export const BASE_URL = getBaseUrl();

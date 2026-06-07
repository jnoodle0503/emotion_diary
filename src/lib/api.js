const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-emotion-diary.jnoodle-nas.synology.me/api';
const API_ORIGIN = new URL(API_BASE_URL).origin;

export function getApiAssetUrl(path) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const apiUrl = new URL(API_BASE_URL, window.location.origin);
  return new URL(path, apiUrl.origin).toString();
}

export function getStickerAssetUrl(pathOrFileName) {
  if (!pathOrFileName) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrFileName)) {
    const url = new URL(pathOrFileName);

    if (url.pathname.startsWith('/api/stickers/files/')) {
      return new URL(url.pathname, API_ORIGIN).toString();
    }

    return pathOrFileName;
  }

  if (pathOrFileName.startsWith('/api/stickers/files/')) {
    return new URL(pathOrFileName, API_ORIGIN).toString();
  }

  return `${API_BASE_URL}/stickers/files/${encodeURIComponent(pathOrFileName)}`;
}

export function getStickerAssetCandidates(pathOrFileName) {
  const fileName = String(pathOrFileName ?? '').split('/').pop();

  if (!fileName) {
    return [];
  }

  return [
    getStickerAssetUrl(pathOrFileName),
    `${API_BASE_URL}/stickers/files/${encodeURIComponent(fileName)}`,
  ].filter((url, index, urls) => url && urls.indexOf(url) === index);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === 'object' && data?.message
      ? data.message
      : 'API request failed.';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}

export const api = {
  getMe: () => apiRequest('/auth/me'),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  getProfile: () => apiRequest('/profiles/me'),
  updateProfile: (payload) => apiRequest('/profiles/me', { method: 'PATCH', body: payload }),
  deleteAccount: () => apiRequest('/users/me', { method: 'DELETE' }),

  getDiaries: ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/diaries${query ? `?${query}` : ''}`);
  },
  getMonthlyDiaries: ({ year, month }) => (
    apiRequest(`/diaries/month?year=${year}&month=${month}`)
  ),
  getNegativeDiaries: ({ offset = 0, limit = 10 }) => (
    apiRequest(`/diaries/negative?offset=${offset}&limit=${limit}`)
  ),
  getDiary: (id) => apiRequest(`/diaries/${id}`),
  createDiary: (payload) => apiRequest('/diaries', { method: 'POST', body: payload }),
  updateDiary: (id, payload) => apiRequest(`/diaries/${id}`, { method: 'PATCH', body: payload }),
  deleteDiary: (id) => apiRequest(`/diaries/${id}`, { method: 'DELETE' }),
  requestComfortNote: (id, payload) => (
    apiRequest(`/diaries/${id}/comfort-note`, {
      method: 'POST',
      body: payload,
    })
  ),
  updateAiFeedbackReaction: (id, reaction) => (
    apiRequest(`/diaries/${id}`, {
      method: 'PATCH',
      body: { ai_feedback_reaction: reaction },
    })
  ),

  getEmotionStats: ({ year, month }) => (
    apiRequest(`/stats/emotions?year=${year}&month=${month}`)
  ),

  getStickers: async () => {
    const response = await fetch(`${API_BASE_URL}/stickers`);
    if (!response.ok) {
      throw new Error('Sticker API request failed.');
    }

    const stickers = await response.json();
    return Array.isArray(stickers)
      ? stickers.map((sticker) => ({
          ...sticker,
          url: getStickerAssetUrl(sticker.url || sticker.file_name || sticker.sticker_file_name),
        }))
      : [];
  },

  getVapidPublicKey: () => apiRequest('/notifications/vapid-public-key'),
  savePushSubscription: (subscription) => (
    apiRequest('/notifications/push-subscriptions', {
      method: 'POST',
      body: subscription,
    })
  ),

  generateAIContent: (prompt) => (
    apiRequest('/ai/generate', { method: 'POST', body: { prompt } })
  ),
};

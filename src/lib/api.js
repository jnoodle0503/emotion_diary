const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

  getEmotionStats: ({ year, month }) => (
    apiRequest(`/stats/emotions?year=${year}&month=${month}`)
  ),

  generateAIContent: (prompt) => (
    apiRequest('/ai/generate', { method: 'POST', body: { prompt } })
  ),
};

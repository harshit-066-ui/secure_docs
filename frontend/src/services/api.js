const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const { token, body, headers = {}, ...rest } = options;

  const config = {
    ...rest,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  signUp: (email, password) =>
    request('/auth/signup', { method: 'POST', body: { email, password } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  logout: (token) =>
    request('/auth/logout', { method: 'POST', token }),

  getDocuments: (token) =>
    request('/documents', { token }),

  uploadDocument: (token, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/documents', {
      method: 'POST',
      token,
      body: formData,
    });
  },

  deleteDocument: (token, id) =>
    request(`/documents/${id}`, { method: 'DELETE', token }),
};

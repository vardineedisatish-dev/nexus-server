const API_URL = import.meta.env.VITE_API_URL;

let token = null;

export function setToken(value) {
  token = value;
  if (value) {
    localStorage.setItem('nexus_token', value);
  } else {
    localStorage.removeItem('nexus_token');
  }
}

export function getStoredToken() {
  if (token) return token;
  const stored = localStorage.getItem('nexus_token');
  token = stored;
  return stored;
}

export function clearToken() {
  token = null;
  localStorage.removeItem('nexus_token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const stored = getStoredToken();
  if (stored) {
    headers['Authorization'] = `Bearer ${stored}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

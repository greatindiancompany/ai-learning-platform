import axios from 'axios';

function defaultApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // The chat cookie is SameSite=Lax, so the API host must match the page host.
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }
  return 'http://localhost:3000/api';
}

const API_URL = defaultApiUrl();

export function chatAuthHeaders(extra = {}) {
  const headers = { ...extra };
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('inspir_student_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export const chatClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

chatClient.interceptors.request.use((config) => {
  const headers = chatAuthHeaders();
  Object.assign(config.headers, headers);
  return config;
});

export const authAPI = {
  async studentLogin(username, password) {
    const response = await fetch(`${API_URL}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },
};

export default API_URL;

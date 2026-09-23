import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

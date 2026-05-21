import axios from 'axios';
import { markBackendOffline, markBackendOnline } from '../stores/backendStatus';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function isBackendUnavailable(error) {
  const status = error.response?.status;
  const code = error.code;
  const message = error.message || '';

  if (status === 401) {
    return false;
  }

  if (status === 500 || status === 503) {
    return true;
  }

  return (
    !error.response ||
    code === 'ERR_NETWORK' ||
    code === 'ERR_CONNECTION_REFUSED' ||
    code === 'ERR_CONNECTION_RESET' ||
    message.includes('Network Error')
  );
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    markBackendOnline();
    return response;
  },
  (error) => {
    if (isBackendUnavailable(error)) {
      markBackendOffline();
    }

    return Promise.reject(error);
  },
);

export async function checkBackendConnection() {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(`${API_BASE_URL}/huesped/dashboard`, {
      timeout: 5000,
      validateStatus: () => true,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 500 || response.status === 503) {
      markBackendOffline();
      return false;
    }

    markBackendOnline();
    return true;
  } catch (error) {
    if (isBackendUnavailable(error)) {
      markBackendOffline();
    }

    return false;
  }
}

export default api;

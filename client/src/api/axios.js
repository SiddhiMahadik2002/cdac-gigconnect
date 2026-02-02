import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants.js';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    // Allow sending cookies (for backend session cookies) and enable
    // XSRF protection headers if the backend sets a matching cookie.
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // SAFETY: STORAGE_KEYS.AUTH_TOKEN may be undefined in some environments;
        // fall back to the legacy 'auth_token' key so we don't call
        // localStorage.getItem(undefined).
        const tokenKey = STORAGE_KEYS.AUTH_TOKEN || 'auth_token';
        const token = localStorage.getItem(tokenKey);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 unauthorized errors: clear stored tokens but do not
        // perform a global navigation here. Let route-level guards (or
        // callers) decide how to handle unauthenticated users.
        if (error.response?.status === 401) {
            const tokenKey = STORAGE_KEYS.AUTH_TOKEN || 'auth_token';
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
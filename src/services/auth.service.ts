import axios from 'axios';

const API_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:3000/api/v1';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Register new user
 */
export const register = async (data: {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data.accessToken;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await apiClient.post('/auth/logout', { refreshToken });
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

/**
 * Get stored tokens
 */
export const getStoredTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  return null;
};

/**
 * Clear stored tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

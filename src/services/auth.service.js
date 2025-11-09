import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
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
apiClient.interceptors.response.use((response) => response, async (error) => {
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
        }
        catch (refreshError) {
            // Refresh failed, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
/**
 * Register new user
 */
export const register = async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
};
/**
 * Login user
 */
export const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', {
        email,
        password,
    });
    return response.data;
};
/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.accessToken;
};
/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};
/**
 * Logout user
 */
export const logout = async (refreshToken) => {
    try {
        await apiClient.post('/auth/logout', { refreshToken });
    }
    finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};
/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
};
/**
 * Get stored tokens
 */
export const getStoredTokens = () => {
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
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
};
//# sourceMappingURL=auth.service.js.map
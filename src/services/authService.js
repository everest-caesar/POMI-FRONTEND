import axios from 'axios';
import { API_BASE_URL } from '../config/api';
class AuthService {
    constructor() {
        Object.defineProperty(this, "api", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Add token to requests if it exists
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }
    async register(data) {
        try {
            const response = await this.api.post('/auth/register', {
                email: data.email,
                password: data.password,
                username: data.username,
                age: data.age,
                area: data.area,
                workOrSchool: data.workOrSchool,
                adminInviteCode: data.adminInviteCode,
            });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.error || 'Registration failed';
            throw new Error(message);
        }
    }
    async login(data) {
        try {
            const response = await this.api.post('/auth/login', {
                email: data.email,
                password: data.password,
            });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            throw new Error(message);
        }
    }
    async getCurrentUser() {
        try {
            const response = await this.api.get('/auth/me');
            // Store user data including new fields if available
            if (response.data.user) {
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            }
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.error || 'Failed to fetch user';
            throw new Error(message);
        }
    }
    setToken(token) {
        localStorage.setItem('authToken', token);
    }
    getToken() {
        return localStorage.getItem('authToken');
    }
    removeToken() {
        localStorage.removeItem('authToken');
    }
    isAuthenticated() {
        return !!this.getToken();
    }
    getUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            }
            catch {
                return null;
            }
        }
        return null;
    }
    clearUserData() {
        localStorage.removeItem('userData');
    }
}
export default new AuthService();
//# sourceMappingURL=authService.js.map
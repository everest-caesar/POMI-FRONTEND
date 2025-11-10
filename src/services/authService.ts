import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  age: number;
  area: string;
  workOrSchool: string;
  adminInviteCode?: string;
}

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    username: string;
    age?: number;
    area?: string;
    workOrSchool?: string;
    isAdmin?: boolean;
    createdAt: string;
  };
  message: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  age?: number;
  area?: string;
  workOrSchool?: string;
  isAdmin?: boolean;
  createdAt: string;
}

class AuthService {
  private api: AxiosInstance;

  constructor() {
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

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        username: data.username,
        age: data.age,
        area: data.area,
        workOrSchool: data.workOrSchool,
        adminInviteCode: data.adminInviteCode,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      throw new Error(message);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    try {
      const response = await this.api.get<{ user: User }>('/auth/me');
      // Store user data including new fields if available
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch user';
      throw new Error(message);
    }
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserData(): User | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  clearUserData(): void {
    localStorage.removeItem('userData');
  }
}

export default new AuthService();

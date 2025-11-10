/**
 * API Configuration
 * Centralizes all API base URL configuration
 * Uses VITE_API_BASE_URL environment variable from Netlify/development
 */

export const API_BASE_URL =
  (import.meta.env as any).VITE_API_BASE_URL ||
  'http://localhost:3000/api/v1';

export default API_BASE_URL;

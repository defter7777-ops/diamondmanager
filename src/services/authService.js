/**
 * Authentication Service for DiamondManager
 * Adapted from newapp frontend authService with diamondmanager app context
 */

// Use the same Railway auth-service URL as the working frontend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://newapp-backend-production.up.railway.app';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.getStoredUser();
  }

  getStoredUser() {
    const userData = localStorage.getItem('user');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  async login(credentials) {
    try {
      console.log('🌐 Making login request to:', `${API_BASE_URL}/api/v1/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-app-id': 'diamondmanager' // Critical for multi-app authentication
        },
        body: JSON.stringify(credentials)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', [...response.headers.entries()]);
      console.log('📡 Content-Type:', response.headers.get('content-type'));
      
      const responseText = await response.text();
      console.log('📄 Response text:', responseText.substring(0, 200));
      
      // Check if response is HTML instead of JSON
      if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON. The API endpoint may not be available.');
      }
      
      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        this.token = data.token;
        this.user = data.user;
      }

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Authentication failed'
      };
    }
  }

  async logout() {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Reset instance variables
      this.token = null;
      this.user = null;

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: error.message };
    }
  }

  async checkAuthStatus() {
    try {
      if (!this.token) {
        return { isAuthenticated: false };
      }

      // Verify token with backend
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          'x-app-id': 'diamondmanager'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isAuthenticated: true,
          user: this.user || data.user
        };
      } else {
        // Token invalid, clear auth data
        this.logout();
        return { isAuthenticated: false };
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      return { isAuthenticated: false };
    }
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Helper method for authenticated API requests
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'x-app-id': 'diamondmanager'
    };
  }
}

export const authService = new AuthService();
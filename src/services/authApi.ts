import { apiConfig } from '@/utils/apiConfig';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id: number;
  department?: string;
  avatar?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_verified: number;
  must_change_password: number;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ProfileResponse {
  user: AuthUser;
}

// Get auth base URL from the main API config (same server, different path)
const getAuthBaseUrl = () => {
  const baseUrl = apiConfig.getBaseUrl();
  // Convert from /wp-json/ims/v1 to /api/auth format
  // e.g., https://usmanhardware.site/wp-json/ims/v1 -> https://usmanhardware.site/api/auth
  const url = new URL(baseUrl);
  return `${url.origin}/api/auth`;
};

const authRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${getAuthBaseUrl()}${endpoint}`;
  
  console.log('Auth request to:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log('Auth response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Auth request error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
};

export const authApi = {
  login: (credentials: LoginCredentials) =>
    authRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterData) =>
    authRequest<{ message: string; userId: number }>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: (refreshToken: string) =>
    authRequest<{ accessToken: string }>('/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (token: string) =>
    authRequest<{ message: string }>('/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getProfile: (token: string) =>
    authRequest<ProfileResponse>('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updateProfile: (token: string, data: Partial<AuthUser>) =>
    authRequest<{ message: string }>('/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  changePassword: (
    token: string,
    data: { current_password: string; new_password: string; confirm_password: string }
  ) =>
    authRequest<{ message: string }>('/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
};

// Token management utilities
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  getUser: (): AuthUser | null => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  setUser: (user: AuthUser) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  clearAll: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('jwt_token'); // Clear legacy token
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

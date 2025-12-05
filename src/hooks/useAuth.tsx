import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { authApi, tokenManager, AuthUser, LoginCredentials } from '@/services/authApi';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkAuth = useCallback(() => {
    const storedUser = tokenManager.getUser();
    const accessToken = tokenManager.getAccessToken();

    if (accessToken && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);

      tokenManager.setTokens(response.accessToken, response.refreshToken);
      tokenManager.setUser(response.user);

      setUser(response.user);
      setIsAuthenticated(true);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.first_name || response.user.username}!`,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (token) {
        await authApi.logout(token).catch(() => {
          // Ignore logout API errors, still clear local state
        });
      }
    } finally {
      tokenManager.clearAll();
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    }
  };

  const refreshSession = async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      tokenManager.setTokens(response.accessToken, refreshToken);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshSession,
    checkAuth,
  };
};

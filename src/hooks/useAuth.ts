import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (login: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ login, password });
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.registerStudent(data);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerTeacher = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.registerTeacher(data);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    registerStudent,
    registerTeacher,
  };
};

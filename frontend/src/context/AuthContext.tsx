import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, userApi } from '../api/api';
import { User, UserRole, AuthContextType } from '../types/index';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate user from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem('nexus_user');
    const token = localStorage.getItem('nexus_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data } = await authApi.login({ email, password, role });
    localStorage.setItem('nexus_token', data.token);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const { data } = await authApi.register({ name, email, password, role });
    localStorage.setItem('nexus_token', data.token);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authApi.resetPassword(token, newPassword);
  };

  const updateProfile = async (userId: string, updates: Partial<User>) => {
    const { data } = await userApi.updateProfile(userId, updates);
    setUser(data.user);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
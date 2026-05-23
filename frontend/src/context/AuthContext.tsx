import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return username && role ? { username, role } : null;
  });

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { access_token, username, role } = response;

    localStorage.setItem('token', access_token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    setToken(access_token);
    setUser({ username, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

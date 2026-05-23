import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';
import { SessionExpiredModal } from '../ui/components/SessionExpiredModal';

interface AuthContextType {
  token: string | null;
  user: User | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
  const [user, setUser] = useState<User | null>(() => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return username && role ? { username, role } : null;
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      // Only show if the user was actually logged in
      if (localStorage.getItem('token')) {
        setIsSessionExpired(true);
      }
    };
    window.addEventListener('session_expired', handleSessionExpired as EventListener);
    return () => window.removeEventListener('session_expired', handleSessionExpired as EventListener);
  }, []);

  const login = async (loginEmail: string, password: string) => {
    const response = await authService.login(loginEmail, password);
    const { access_token, username, role } = response;

    localStorage.setItem('token', access_token);
    localStorage.setItem('email', loginEmail);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    setToken(access_token);
    setEmail(loginEmail);
    setUser({ username, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setEmail(null);
    setUser(null);
  };

  const handleRelogin = async (password: string) => {
    if (!email) return;
    await login(email, password);
    setIsSessionExpired(false);
  };

  const handleCancelLogout = () => {
    setIsSessionExpired(false);
    logout();
  };

  return (
    <AuthContext.Provider value={{ token, user, email, isAuthenticated: !!token, login, logout }}>
      {children}
      {isSessionExpired && user && (
        <SessionExpiredModal
          email={email || ''}
          onRelogin={handleRelogin}
          onCancel={handleCancelLogout}
        />
      )}
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

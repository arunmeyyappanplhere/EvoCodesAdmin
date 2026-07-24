import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from './api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore session on mount by checking with backend
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axiosInstance.get("/me");
        setCurrentUser(res.data.admin);
        setIsAuthenticated(true);
      } catch (err) {
        // 401 means not logged in
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Listen for session expired events from axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setCurrentUser(null);
      setIsAuthenticated(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:sessionExpired', handleSessionExpired);
      return () => window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    }
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    isAuthLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
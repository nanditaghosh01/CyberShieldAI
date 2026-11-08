import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          removeAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (email, username, password, role = 'Regular User') => {
    const res = await api.register(email, username, password, role);
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const isAdmin = user?.role === 'Administrator';
  const isAnalyst = user?.role === 'Security Analyst' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isAnalyst,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


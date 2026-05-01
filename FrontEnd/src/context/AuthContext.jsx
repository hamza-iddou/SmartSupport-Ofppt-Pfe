import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [workspace, setWorkspace] = useState(() => {
    const saved = localStorage.getItem('workspace');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // In a real app, you might want to fetch the user profile here
      // For now, we'll assume the token is valid if it exists
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout API failed', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('workspace');
    setToken(null);
    setUser(null);
    setWorkspace(null);
  };

  const selectWorkspace = (ws) => {
    localStorage.setItem('workspace', JSON.stringify(ws));
    setWorkspace(ws);
  };

  return (
    <AuthContext.Provider value={{ user, token, workspace, loading, login, register, logout, selectWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

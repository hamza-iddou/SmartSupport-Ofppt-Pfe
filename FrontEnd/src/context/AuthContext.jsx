import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
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
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return response.data;
  };

  const register = async (name, lastName, email, password) => {
    const response = await api.post('/register', { name, last_name: lastName, email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
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
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setWorkspace(null);
  };

  const selectWorkspace = (ws) => {
    localStorage.setItem('workspace', JSON.stringify(ws));
    setWorkspace(ws);
  };

  // Helper: is the current user an admin of the selected workspace?
  const isAdmin = workspace?.pivot?.is_admin === true || workspace?.pivot?.is_admin === 1;

  return (
    <AuthContext.Provider value={{ user, token, workspace, loading, login, register, logout, selectWorkspace, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

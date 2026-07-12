import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'auth_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        setUser(parsed.user ?? null);
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (newSession) => {
    if (newSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setSession(newSession);
    setUser(newSession?.user ?? null);
  };

  const signUp = async (email, password) => {
    const response = await api.signUp(email, password);
    if (response.data.session) {
      persistSession(response.data.session);
    }
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.login(email, password);
    persistSession(response.data.session);
    return response.data;
  };

  const logout = async () => {
    const token = session?.access_token;
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // Clear local session even if server logout fails
      }
    }
    persistSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    login,
    logout,
    accessToken: session?.access_token ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

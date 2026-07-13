import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (!currentSession) {
          setUsername('');
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.access_token) {
        try {
          const profileData = await api.getProfile(session.access_token);
          if (profileData?.data?.username) {
            setUsername(profileData.data.username);
            setUser((prevUser) => 
              prevUser ? { ...prevUser, username: profileData.data.username } : null
            );
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      } else {
        setUsername('');
      }
    };
    fetchProfile();
  }, [session]);

  const signUp = async (username, email, password) => {
    const response = await api.signUp(username, email, password);
    if (response.data?.session) {
      await supabase.auth.setSession({
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
      });
    }
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.login(email, password);
    if (response.data?.session) {
      await supabase.auth.setSession({
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
      });
    }
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
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    username,
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


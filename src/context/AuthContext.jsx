/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;
    try {
      const profileData = await api.getProfile();
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
      return null;
    }
  }, [user]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const { user: currentUser } = await api.getMe();
      setSession({ user: currentUser });
      setUser(currentUser);
      const profileData = await api.getProfile();
      setProfile(profileData);
    } catch {
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const applyAuthResult = async ({ user: authUser }) => {
    setSession({ user: authUser });
    setUser(authUser);
    const profileData = await api.getProfile();
    setProfile(profileData);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn: async (credentials) => {
      const result = await api.login(credentials);
      await applyAuthResult(result);
      return result;
    },
    register: async (payload) => {
      const result = await api.register(payload);
      await applyAuthResult(result);
      return result;
    },
    signOut: async () => {
      try {
        await api.logout();
      } catch (error) {
        console.error('Error during sign out:', error);
      } finally {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    },
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

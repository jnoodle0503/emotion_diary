import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // New state for profile
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return; // Can only refresh if user is logged in
    setLoading(true); // Set loading while refreshing profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('nickname, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error refreshing profile:', profileError);
      setProfile(null);
    } else {
      setProfile(profileData);
    }
    setLoading(false); // Reset loading
  };

  useEffect(() => {
    const fetchUserAndProfile = async (currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('nickname, full_name, avatar_url') // Select nickname and other existing fields
          .eq('id', currentUser.id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (profileError) { // No need to check for PGRST116 with maybeSingle()
          console.error('Error fetching profile:', profileError);
          setProfile(null); // Set profile to null on error
        } else {
          setProfile(profileData);
        }
      } else {
        setProfile(null); // Clear profile if no user
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndProfile(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchUserAndProfile(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    signOut: () => supabase.auth.signOut(),
    refreshProfile, // Expose the new function
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
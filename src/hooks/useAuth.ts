import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    // Khôi phục profile từ localStorage nếu có
    try {
      const cachedProfile = localStorage.getItem('cached_profile');
      return cachedProfile ? JSON.parse(cachedProfile) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const startTime = performance.now();
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          // Clear cache on sign out
          localStorage.removeItem('cached_profile');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile với retry logic
          let retryCount = 0;
          const maxRetries = 3;
          
          const fetchProfileWithRetry = async () => {
            const profileStartTime = performance.now();
            
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              const profileEndTime = performance.now();
              
              if (error && error.code !== 'PGRST116') {
                // Retry nếu là lỗi network hoặc timeout
                if (retryCount < maxRetries && (error.code === 'PGRST301' || error.message.includes('timeout'))) {
                  retryCount++;
                  setTimeout(fetchProfileWithRetry, 1000 * retryCount); // Exponential backoff
                  return;
                }
              } else {
                setProfile(profileData as Profile);
                // Cache profile vào localStorage
                if (profileData) {
                  localStorage.setItem('cached_profile', JSON.stringify(profileData));
                }
              }
            } catch (error) {
              // Retry nếu là lỗi network
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(fetchProfileWithRetry, 1000 * retryCount);
                return;
              }
            }
          };
          
          // Delay nhỏ để đảm bảo profile đã được tạo bởi trigger
          setTimeout(fetchProfileWithRetry, 100);
        } else {
          setProfile(null);
          localStorage.removeItem('cached_profile');
        }
        
        const endTime = performance.now();
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch profile for initial session
      if (session?.user) {
        const initialProfileStartTime = performance.now();
        
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          const initialProfileEndTime = performance.now();
          
          if (error && error.code !== 'PGRST116') {
            // Silent error handling
          } else {
            setProfile(profileData as Profile);
            // Cache profile vào localStorage
            if (profileData) {
              localStorage.setItem('cached_profile', JSON.stringify(profileData));
            }
          }
        } catch (error) {
          // Silent error handling
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name,
        },
      },
    });
    
    // Profile will be automatically created by the database trigger
    // No need to manually create it here
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      // Clear cached profile
      localStorage.removeItem('cached_profile');
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    
    return { error };
  };

  const refreshProfile = async () => {
    if (!user) return { error: new Error('No user logged in') };
    
    const refreshStartTime = performance.now();
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      const refreshEndTime = performance.now();
      
      if (error && error.code !== 'PGRST116') {
        return { error };
      } else {
        setProfile(profileData as Profile);
        // Cache profile vào localStorage
        if (profileData) {
          localStorage.setItem('cached_profile', JSON.stringify(profileData));
        }
        return { error: null };
      }
    } catch (error) {
      return { error };
    }
  };

  const clearCacheAndRefresh = async () => {
    localStorage.removeItem('cached_profile');
    setProfile(null);
    await refreshProfile();
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    clearCacheAndRefresh,
  };
};
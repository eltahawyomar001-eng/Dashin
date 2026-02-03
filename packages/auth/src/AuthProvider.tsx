'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@dashin/supabase';
import type { User, UserRole } from '@dashin/shared-types';

interface AuthContextValue {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: UserRole, agencyId?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Only create client on the browser
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getSupabaseBrowserClient();
  }, []);

  // Fetch user profile from database
  // Note: Profile creation is handled by database trigger (handle_new_user) on auth.users insert
  const fetchUserProfile = useCallback(async (userId: string, retries = 3): Promise<User | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet if trigger hasn't run - wait and retry
        if (error.code === 'PGRST116' && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchUserProfile(userId, retries - 1);
        }
        console.warn('Failed to fetch user profile:', error.message);
        return null;
      }
      return data as User;
    } catch {
      return null;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    // If no supabase client (SSR or not mounted), set loading to false
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        setLoading(false);

        // Fetch profile in background
        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id);
          if (isMounted) setUser(profile);
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);
        setLoading(false);

        if (newSession?.user) {
          const profile = await fetchUserProfile(newSession.user.id);
          if (isMounted) setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Auth not initialized') };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Note: Profile creation is handled by database trigger (handle_new_user) on auth.users insert
  // We just need to call auth.signUp and the trigger will create the profile
  const signUp = async (email: string, password: string, role: UserRole, agencyId?: string) => {
    if (!supabase) {
      return { error: new Error('Auth not initialized') };
    }
    try {
      const { error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role,
            agency_id: agencyId ?? null,
          }
        }
      });
      if (authError) return { error: authError as Error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Auth not initialized') };
    }
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Auth not initialized') };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!supabase) {
      return { error: new Error('Auth not initialized') };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}

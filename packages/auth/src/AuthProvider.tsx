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
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data: newProfile } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                email: authUser.email!,
                role: 'client' as UserRole,
              } as any)
              .select()
              .single();
            return newProfile ? (newProfile as unknown as User) : null;
          }
        }
        return null;
      }
      return data as User;
    } catch {
      return null;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        setLoading(false);

        // Fetch profile in background
        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id);
          if (mounted) setUser(profile);
        }
      } catch {
        if (mounted) {
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
        if (!mounted) return;
        
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);
        setLoading(false);

        if (newSession?.user) {
          const profile = await fetchUserProfile(newSession.user.id);
          if (mounted) setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
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

  const signUp = async (email: string, password: string, role: UserRole, agencyId?: string) => {
    if (!supabase) {
      return { error: new Error('Auth not initialized') };
    }
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) return { error: authError as Error };

      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        role,
        agency_id: agencyId ?? null,
      } as any);

      if (profileError) return { error: profileError as Error };
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

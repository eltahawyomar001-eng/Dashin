'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  const supabase = getSupabaseBrowserClient();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthProvider] Error fetching user profile:', error);
        
        // If profile doesn't exist (PGRST116), create it automatically
        if (error.code === 'PGRST116') {
          console.log('[AuthProvider] Profile not found, creating...');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            const newProfile: any = {
              id: authUser.id,
              email: authUser.email!,
              full_name: authUser.user_metadata?.full_name || null,
              company_name: authUser.user_metadata?.company_name || null,
              role: 'client' as UserRole,
            };
            
            const { data: createdProfile, error: insertError } = await supabase
              .from('users')
              .insert(newProfile)
              .select()
              .single();
            
            if (insertError) {
              console.error('[AuthProvider] Failed to create profile:', insertError);
              return null;
            }
            
            console.log('[AuthProvider] Profile created successfully');
            return createdProfile as User;
          }
        }
        
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('[AuthProvider] Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);

        if (newSession?.user) {
          const profile = await fetchUserProfile(newSession.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthProvider] Starting signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[AuthProvider] signInWithPassword response:', { data, error });

      if (error) {
        console.error('[AuthProvider] Sign in error:', error);
        return { error };
      }

      console.log('[AuthProvider] Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('[AuthProvider] Unexpected error during sign in:', error);
      return { error: error as Error };
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    agencyId?: string
  ) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        return { error: authError };
      }

      // Create user profile
      type UserInsert = {
        id: string;
        email: string;
        role: UserRole;
        agency_id: string | null;
      };
      
      const userInsert: UserInsert = {
        id: authData.user.id,
        email,
        role,
        agency_id: agencyId ?? null,
      };
      
      const { error: profileError } = await supabase.from('users').insert(userInsert as any);

      if (profileError) {
        // Rollback: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { error: profileError };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }

      setUser(null);
      setSupabaseUser(null);
      setSession(null);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: AuthContextValue = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}

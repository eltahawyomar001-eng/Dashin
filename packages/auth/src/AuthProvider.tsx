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

  // Fetch user profile data with timeout
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('[AuthProvider] Fetching user profile for:', userId);
      
      // Add timeout to prevent infinite hang
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // If timeout won, result will be rejection handled in catch
      const { data, error } = result as Awaited<typeof fetchPromise>;

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

      console.log('[AuthProvider] Profile fetched successfully');
      return data as User;
    } catch (error: any) {
      console.warn('[AuthProvider] Profile fetch failed or timed out:', error?.message);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing auth...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        // If there's an error getting the session (like token revoked), clear it
        if (error) {
          console.warn('[AuthProvider] Session error, clearing local session:', error.message);
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('[AuthProvider] Session check complete:', { hasSession: !!currentSession });
        
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        // IMPORTANT: Set loading to false IMMEDIATELY after session is set
        // This allows pages to redirect based on session without waiting for profile
        setLoading(false);

        // Fetch profile in background (non-blocking)
        if (currentSession?.user) {
          console.log('[AuthProvider] Fetching profile in background...');
          fetchUserProfile(currentSession.user.id).then(profile => {
            console.log('[AuthProvider] Profile loaded:', !!profile);
            setUser(profile);
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // On any error, ensure we're in a clean state
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AuthProvider] Auth state changed:', event, { hasSession: !!newSession });
        
        // Handle token revocation - clear everything and redirect to login
        if (event === 'TOKEN_REFRESHED' && !newSession) {
          console.warn('[AuthProvider] Token refresh failed, clearing session');
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] User signed out');
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Set session immediately so components can redirect
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);
        
        // IMPORTANT: Set loading to false BEFORE fetching profile
        // This allows the login page to redirect to dashboard immediately
        setLoading(false);

        // Fetch profile in background (non-blocking)
        if (newSession?.user) {
          console.log('[AuthProvider] Fetching profile in background...');
          fetchUserProfile(newSession.user.id).then(profile => {
            console.log('[AuthProvider] Profile fetch complete:', !!profile);
            setUser(profile);
          });
        } else {
          setUser(null);
        }
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
      
      // Clear any existing stale session first to prevent token refresh issues
      // This prevents the "token_revoked" issue when an old session exists
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        console.log('[AuthProvider] Clearing existing session before fresh login...');
        await supabase.auth.signOut({ scope: 'local' });
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[AuthProvider] signInWithPassword response:', { 
        hasData: !!data, 
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: error?.message 
      });

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

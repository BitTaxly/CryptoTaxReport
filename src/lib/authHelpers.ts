import { supabase } from './supabase';

/**
 * Authentication Helper Functions
 * Supabase Auth with Email/Password and Google OAuth
 * Enterprise-grade security, GDPR compliant
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up with email and password
 * Sends verification email automatically
 */
export async function signUp(data: SignUpData) {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || null,
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Create user record in our database
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: data.name || null,
        });

      if (dbError && dbError.code !== '23505') {
        // Ignore duplicate key errors
        console.error('Error creating user record:', dbError);
      }
    }

    return {
      success: true,
      user: authData.user,
      message: 'Verification email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google sign in failed',
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
}

/**
 * Get current user session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message, session: null };
    }

    return { success: true, session };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session',
      session: null,
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || null,
      emailVerified: user.email_confirmed_at !== null,
      createdAt: user.created_at,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset email',
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password',
    };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || null,
          emailVerified: session.user.email_confirmed_at !== null,
          createdAt: session.user.created_at,
        });
      } else {
        callback(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}

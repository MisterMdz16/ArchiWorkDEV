import { useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { AutoProfileService } from '../services/autoProfileService';

/**
 * Enhanced authentication hook that automatically manages user profiles in Firestore
 * This hook extends the basic Firebase Auth functionality with automatic profile creation
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  profileReady: boolean; // New state to track if profile is ready
}

export interface AuthError {
  code: string;
  message: string;
}

export const useAuthWithAutoProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);

  /**
   * Set up authentication state listener with automatic profile creation
   */
  useEffect(() => {
    console.log('useAuthWithAutoProfile: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        console.log('useAuthWithAutoProfile: Auth state changed:', authUser ? 'User authenticated' : 'User signed out');
        
        setUser(authUser);
        setLoading(true);
        setProfileReady(false);

        // Handle profile creation/verification
        const profileHandled = await AutoProfileService.handleUserProfileCreation(authUser);
        
        if (authUser && profileHandled) {
          console.log('useAuthWithAutoProfile: Profile ready for user');
          setProfileReady(true);
        } else if (!authUser) {
          // User signed out
          setProfileReady(false);
        } else {
          // Profile creation failed
          console.warn('useAuthWithAutoProfile: Profile creation failed');
          setProfileReady(false);
        }

      } catch (error) {
        console.error('useAuthWithAutoProfile: Error in auth state change handler:', error);
        setProfileReady(false);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Sign up with email and password
   * Automatically creates user profile after successful registration
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (fullName) {
        await updateProfile(result.user, {
          displayName: fullName
        });
      }
      
      // Profile creation will be handled automatically by onAuthStateChanged listener
      console.log('useAuthWithAutoProfile: User registration successful, profile creation will be handled automatically');
      
      return { user: result.user, error: null };
    } catch (error: any) {
      setLoading(false);
      console.error('useAuthWithAutoProfile: Sign up error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  /**
   * Sign in with email and password
   * Automatically ensures user profile exists after successful login
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Profile creation/verification will be handled automatically by onAuthStateChanged listener
      console.log('useAuthWithAutoProfile: User sign in successful, profile verification will be handled automatically');
      
      return { user: result.user, error: null };
    } catch (error: any) {
      setLoading(false);
      console.error('useAuthWithAutoProfile: Sign in error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  /**
   * Sign in with Google OAuth
   * Automatically creates user profile for new users
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Profile creation will be handled automatically by onAuthStateChanged listener
      console.log('useAuthWithAutoProfile: Google sign in successful, profile creation will be handled automatically');
      
      return { user: result.user, error: null };
    } catch (error: any) {
      setLoading(false);
      console.error('useAuthWithAutoProfile: Google sign in error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  /**
   * Sign in with Facebook OAuth
   * Automatically creates user profile for new users
   */
  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Profile creation will be handled automatically by onAuthStateChanged listener
      console.log('useAuthWithAutoProfile: Facebook sign in successful, profile creation will be handled automatically');
      
      return { user: result.user, error: null };
    } catch (error: any) {
      setLoading(false);
      console.error('useAuthWithAutoProfile: Facebook sign in error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      console.error('useAuthWithAutoProfile: Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Sign out user
   */
  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      console.error('useAuthWithAutoProfile: Logout error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Force refresh the current user's profile status
   * Useful if you know the profile was updated externally
   */
  const refreshProfileStatus = async () => {
    if (user) {
      setLoading(true);
      try {
        const profileExists = await AutoProfileService.refreshProfileStatus(user.uid);
        setProfileReady(profileExists);
      } catch (error) {
        console.error('useAuthWithAutoProfile: Error refreshing profile status:', error);
        setProfileReady(false);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Convert Firebase Auth error to user-friendly message
   */
  const getErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  return {
    user,
    loading,
    profileReady, // New property to indicate if profile is ready
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    logout,
    refreshProfileStatus,
    getErrorMessage
  };
};
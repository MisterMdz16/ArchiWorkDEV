import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { UserService } from '../services/userService';
import { UserProfile, CreateUserProfileData, UserType } from '../types/user';

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
        setUser(user);
        
        if (user) {
          try {
            console.log('👤 Fetching user profile for:', user.uid);
            // Fetch user profile from Firestore
            const profile = await UserService.getUserProfile(user.uid);
            if (profile) {
              console.log('✅ Profile loaded:', profile.user_type);
              setUserProfile(profile);
            } else {
              // If no profile exists, create one with default values
              console.log('⚠️ No profile found, creating default profile for user:', user.uid);
              const defaultProfileData = {
                email: user.email || '',
                full_name: user.displayName || user.email?.split('@')[0] || 'User',
                user_type: 'service_requester' as UserType, // Default to service requester
              };
              
              console.log('🔄 Creating profile with data:', defaultProfileData);
              const newProfile = await UserService.createUserProfile(user.uid, defaultProfileData);
              console.log('✅ New profile created successfully');
              setUserProfile(newProfile);
              
              // Increment profile views for new user
              try {
                const { AnalyticsService } = await import('../services/analyticsService');
                await AnalyticsService.incrementProfileViews(user.uid);
              } catch (analyticsError) {
                console.log('📊 Analytics tracking failed (non-critical):', analyticsError);
              }
            }
          } catch (profileError) {
            console.error('❌ Error fetching/creating user profile:', profileError);
            // Set userProfile to null so we can handle this state
            setUserProfile(null);
          }
        } else {
          console.log('👋 User signed out, clearing profile');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        setUserProfile(null);
      } finally {
        console.log('✅ Auth loading complete');
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Sign up with email, password, full name, and user type
   * Creates both Firebase Auth user and Firestore user profile
   */
  const signUp = async (email: string, password: string, fullName: string, userType: UserType, designerVerificationStatus?: 'verified' | 'unverified') => {
    try {
      console.log('📝 Starting signup process for:', email);
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase user created:', result.user.uid);
      
      // Update user profile with display name
      await updateProfile(result.user, {
        displayName: fullName
      });
      console.log('✅ Display name updated');
      
      // Create user profile in Firestore
      const profileData: CreateUserProfileData = {
        email,
        full_name: fullName,
        user_type: userType
      };

      // Only add designer_verification_status if user is a designer
      if (userType === 'designer') {
        profileData.designer_verification_status = designerVerificationStatus || 'unverified';
      }
      
      console.log('🔄 Creating Firestore profile with data:', profileData);
      const userProfile = await UserService.createUserProfile(result.user.uid, profileData);
      console.log('✅ Profile created successfully');
      setUserProfile(userProfile);
      
      return { user: result.user, userProfile, error: null };
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { user: null, userProfile: null, error: error as AuthError };
    }
  };

  /**
   * Sign in with email and password
   * Automatically fetches user profile after successful sign in
   */
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Starting signin process for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase signin successful');
      
      // Fetch user profile
      const profile = await UserService.getUserProfile(result.user.uid);
      console.log('👤 Profile fetched:', profile ? profile.user_type : 'No profile');
      setUserProfile(profile);
      
      return { user: result.user, userProfile: profile, error: null };
    } catch (error: any) {
      console.error('❌ Signin error:', error);
      return { user: null, userProfile: null, error: error as AuthError };
    }
  };

  /**
   * Sign in with Google OAuth
   * Creates user profile if first time sign up
   */
  const signInWithGoogle = async () => {
    try {
      console.log('🔑 Starting Google signin');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google signin successful');
      
      // Check if user profile exists, create if not
      let profile = await UserService.getUserProfile(result.user.uid);
      
      if (!profile && result.user.email) {
        // First time Google sign up - create profile as service_requester by default
        const profileData: CreateUserProfileData = {
          email: result.user.email,
          full_name: result.user.displayName || result.user.email.split('@')[0],
          user_type: 'service_requester' // Default for OAuth sign ups
        };
        
        profile = await UserService.createUserProfile(result.user.uid, profileData);
      }
      
      setUserProfile(profile);
      return { user: result.user, userProfile: profile, error: null };
    } catch (error: any) {
      console.error('❌ Google signin error:', error);
      return { user: null, userProfile: null, error: error as AuthError };
    }
  };

  /**
   * Sign in with Facebook OAuth
   * Creates user profile if first time sign up
   */
  const signInWithFacebook = async () => {
    try {
      console.log('🔑 Starting Facebook signin');
      const result = await signInWithPopup(auth, facebookProvider);
      console.log('✅ Facebook signin successful');
      
      // Check if user profile exists, create if not
      let profile = await UserService.getUserProfile(result.user.uid);
      
      if (!profile && result.user.email) {
        // First time Facebook sign up - create profile as service_requester by default
        const profileData: CreateUserProfileData = {
          email: result.user.email,
          full_name: result.user.displayName || result.user.email.split('@')[0],
          user_type: 'service_requester' // Default for OAuth sign ups
        };
        
        profile = await UserService.createUserProfile(result.user.uid, profileData);
      }
      
      setUserProfile(profile);
      return { user: result.user, userProfile: profile, error: null };
    } catch (error: any) {
      console.error('❌ Facebook signin error:', error);
      return { user: null, userProfile: null, error: error as AuthError };
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
      return { error: error as AuthError };
    }
  };

  /**
   * Sign out user and clear profile
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { error: null };
    } catch (error: any) {
      return { error: error as AuthError };
    }
  };

  /**
   * Update user profile in Firestore
   */
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No authenticated user');
      
      await UserService.updateUserProfile(user.uid, updates);
      
      // Refresh user profile
      const updatedProfile = await UserService.getUserProfile(user.uid);
      setUserProfile(updatedProfile);
      
      return { error: null };
    } catch (error: any) {
      return { error: error as AuthError };
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
      case 'firestore/permission-denied':
        return 'Access denied. Please check your permissions.';
      case 'firestore/unavailable':
        return 'Service temporarily unavailable. Please try again.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    logout,
    updateUserProfile,
    getErrorMessage
  };
};
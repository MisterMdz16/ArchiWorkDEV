import React from 'react';
import { useAuthWithAutoProfile } from '../hooks/useAuthWithAutoProfile';
import { Building, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * AuthWrapper Component
 * 
 * This component wraps your main application and handles:
 * 1. Authentication state management
 * 2. Automatic user profile creation in Firestore
 * 3. Loading states during profile creation
 * 4. Error states if profile creation fails
 * 
 * Usage: Wrap your main App component with this AuthWrapper
 */

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  children, 
  fallback,
  loadingComponent,
  errorComponent 
}) => {
  const { user, loading, profileReady } = useAuthWithAutoProfile();

  // Show loading state while authentication and profile creation are in progress
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Building className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">ArchiWork</h2>
          </div>
          <p className="text-gray-600 font-medium">Setting up your account...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your profile</p>
        </div>
      </div>
    );
  }

  // Show fallback component if user is not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback - you should replace this with your sign-in component
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ArchiWork</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show error state if user is authenticated but profile creation failed
  if (user && !profileReady) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Setup Issue</h2>
          <p className="text-gray-600 mb-6">
            We're having trouble setting up your profile. This might be a temporary issue.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                // You can implement a sign-out function here
                console.log('User requested sign out');
              }}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success state briefly to confirm profile is ready
  if (user && profileReady) {
    return (
      <>
        {/* Optional: Show a brief success indicator */}
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Profile Ready</span>
        </div>
        {children}
      </>
    );
  }

  // Fallback - should not reach here
  return <>{children}</>;
};

/**
 * Higher-Order Component version for easier integration
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthWrapperProps, 'children'>
) => {
  const AuthenticatedComponent = (props: P) => (
    <AuthWrapper {...options}>
      <Component {...props} />
    </AuthWrapper>
  );

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return AuthenticatedComponent;
};

export default AuthWrapper;
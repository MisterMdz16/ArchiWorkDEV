import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Building, Chrome, Facebook, Compass, PenTool, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignInProps {
  onSwitchToSignUp: () => void;
}

function SignIn({ onSwitchToSignUp }: SignInProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signInWithGoogle, signInWithFacebook, resetPassword, getErrorMessage } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError('');
    
    const { user, userProfile, error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setAuthError(getErrorMessage(error));
      setIsLoading(false);
    } else {
      console.log('User signed in:', user, 'Profile:', userProfile);
      // User will be redirected automatically via App.tsx
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    const { user, userProfile, error } = await signInWithGoogle();
    
    if (error) {
      setAuthError(getErrorMessage(error));
    } else {
      console.log('User signed in with Google:', user, 'Profile:', userProfile);
    }
  };

  const handleFacebookSignIn = async () => {
    setAuthError('');
    const { user, userProfile, error } = await signInWithFacebook();
    
    if (error) {
      setAuthError(getErrorMessage(error));
    } else {
      console.log('User signed in with Facebook:', user, 'Profile:', userProfile);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    
    const { error } = await resetPassword(forgotPasswordEmail);
    
    if (error) {
      alert(`Error: ${getErrorMessage(error)}`);
      setForgotPasswordLoading(false);
    } else {
      alert('Password reset instructions have been sent to your email!');
      setForgotPasswordLoading(false);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Panel - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 max-w-md lg:max-w-lg mx-auto lg:mx-0">
        <div className="w-full">
          {/* Logo */}
          <div className="flex items-center mb-8 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 shadow-lg transform group-hover:scale-105 transition-transform duration-200">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ArchiWork
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sign in to continue working on your architectural projects and designs.
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md group"
            >
              <Chrome className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
              Continue with Google
            </button>
            <button
              onClick={handleFacebookSignIn}
              type="button"
              className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md group"
            >
              <Facebook className="w-5 h-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 to-blue-50 text-gray-500 font-medium">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Auth Error Display */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">{authError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 mt-8 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In to ArchiWork
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
            >
              Create account
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="flex flex-col justify-center items-center text-center px-12 relative z-10">
          {/* Floating Architectural Tools Preview */}
          <div className="mb-8 relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 transform -rotate-2 hover:rotate-0 transition-all duration-700 hover:scale-105">
              <div className="bg-white rounded-2xl p-6 w-96 h-64 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">ArchiWork Studio</span>
                </div>
                
                {/* 3D Model Preview */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-32 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20"></div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Modern Villa Project</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tool Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Compass className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <PenTool className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last saved: 2 min ago
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Design Elements */}
            <div className="absolute -top-6 -right-6 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce">
              <Building className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-16 -left-8 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Continue designing amazing architectural projects.
          </h2>
          <p className="text-blue-100 text-xl max-w-lg leading-relaxed">
            Access your projects, collaborate with your team, and bring your architectural visions to life with our comprehensive design tools.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mt-8 mb-8">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Your Projects
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Team Collaboration
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Cloud Sync
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border border-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 border border-white/30 rounded-full"></div>
          <div className="absolute top-32 right-32 w-16 h-16 border border-white/30 rounded-full"></div>
        </div>
      </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="mb-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-gray-300"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SignIn;
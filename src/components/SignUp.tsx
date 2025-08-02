import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Chrome, Facebook, Building, Compass, PenTool, Users, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserType, USER_TYPE_LABELS, USER_TYPE_DESCRIPTIONS } from '../types/user';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  agreeToTerms: boolean;
}

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'service_requester', // Default to service requester
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, signInWithGoogle, signInWithFacebook, getErrorMessage } = useAuth();

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.userType) {
      newErrors.userType = 'Please select an account type';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError('');
    
    const { user, userProfile, error } = await signUp(
      formData.email, 
      formData.password, 
      formData.fullName, 
      formData.userType,
      formData.userType === 'designer' ? 'unverified' : undefined
    );
    
    if (error) {
      setAuthError(getErrorMessage(error));
      setIsLoading(false);
    } else {
      console.log('User account created:', user, 'Profile:', userProfile);
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

  // User type selection options with icons
  const userTypeOptions = [
    {
      type: 'service_requester' as UserType,
      icon: Users,
      label: 'Service Requester',
      description: 'Request architectural services and collaborate with designers'
    },
    {
      type: 'designer' as UserType,
      icon: Compass,
      label: 'Designer',
      description: 'Create architectural designs and offer professional services'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Panel - Sign Up Form */}
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
              Design Your Future
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Join thousands of architects creating extraordinary spaces with our comprehensive design platform.
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
                or continue with email
              </span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Auth Error Display */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">{authError}</p>
              </div>
            )}

            {/* Account Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose your account type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {userTypeOptions.map((option) => (
                  <label
                    key={option.type}
                    className={`relative flex cursor-pointer rounded-xl border p-4 hover:border-blue-300 transition-all duration-200 ${
                      formData.userType === option.type
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value={option.type}
                      checked={formData.userType === option.type}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.userType === option.type
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        <option.icon className={`w-5 h-5 ${
                          formData.userType === option.type
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          formData.userType === option.type
                            ? 'text-blue-900'
                            : 'text-gray-900'
                        }`}>
                          {option.label}
                        </div>
                        <div className={`text-sm mt-1 ${
                          formData.userType === option.type
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.userType && (
                <p className="mt-2 text-sm text-red-600">{errors.userType}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                    errors.fullName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

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

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-600 leading-relaxed">
                  I agree to ArchiWork's{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">
                    Privacy Policy
                  </a>
                  {formData.userType === 'designer' && (
                    <>
                      {', and understand that my designer account will be marked as '}
                      <span className="font-medium text-amber-600">unverified</span>
                      {' until reviewed by our team'}
                    </>
                  )}
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 mt-8 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Your Account...
                </div>
              ) : (
                'Create Your ArchiWork Account'
              )}
            </button>
          </form>

          {/* Designer Verification Notice */}
          {formData.userType === 'designer' && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Designer Account Verification</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    New designer accounts start as "unverified". Submit your portfolio and credentials after registration for verification by our team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Link */}
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="flex flex-col justify-center items-center text-center px-12 relative z-10">
          {/* Floating Architectural Dashboard Preview */}
          <div className="mb-8 relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-all duration-700 hover:scale-105">
              <div className="bg-white rounded-2xl p-6 w-96 h-64 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">ArchiWork Dashboard</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded-full w-32"></div>
                      <div className="h-2 bg-gray-100 rounded-full w-24"></div>
                    </div>
                    <div className="w-16 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-green-700 font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <Compass className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded-full w-28"></div>
                      <div className="h-2 bg-gray-100 rounded-full w-20"></div>
                    </div>
                    <div className="w-16 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-blue-700 font-medium">Draft</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded-full w-36"></div>
                      <div className="h-2 bg-gray-100 rounded-full w-28"></div>
                    </div>
                    <div className="w-16 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-yellow-700 font-medium">Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Architectural Icons */}
            <div className="absolute -top-6 -left-6 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-pulse">
              <Building className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-12 -right-8 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Connect with your architectural vision effortlessly.
          </h2>
          <p className="text-blue-100 text-xl max-w-lg leading-relaxed">
            Everything you need for architectural design and complete home plans in an easy-to-customize dashboard tailored to your needs.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mt-8 mb-8">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              3D Modeling
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Floor Plans
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Collaboration
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border border-white/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border border-white/30 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 border border-white/30 rounded-full"></div>
          <div className="absolute top-32 right-32 w-16 h-16 border border-white/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
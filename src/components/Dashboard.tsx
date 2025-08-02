
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building, LogOut, User, Settings, FolderOpen, Plus, Shield, Users, Compass, CheckCircle, AlertCircle,
  BarChart3, TrendingUp, Calendar, MessageSquare, Award, Target, Zap, Sparkles, Eye, Heart, ArrowUpRight,
  X, Upload, FileText, Image, Send, Phone, MapPin, Code, Briefcase, Star, Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AnalyticsService } from '../services/analyticsService';
import { USER_TYPE_LABELS, isAdmin, isDesigner, isVerifiedDesigner, isServiceRequester, canManageUsers, canCreateProjects } from '../types/user';
import { verificationService } from '../services/verificationService';
import CreateNewProject from './CreateNewProject';

function Dashboard() {
  // ===== AUTHENTICATION & USER DATA =====
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  // ===== DASHBOARD ANALYTICS STATE =====
  // Real analytics data for admin dashboard
  const [dashboardStats, setDashboardStats] = React.useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalProfileViews: 0,
    usersByType: {
      admins: 0,
      designers: 0,
      serviceRequesters: 0,
      verifiedDesigners: 0,
      unverifiedDesigners: 0
    }
  });
  
  // Loading state for analytics data
  const [statsLoading, setStatsLoading] = React.useState(true);
  
  // Monthly growth statistics
  const [monthlyGrowth, setMonthlyGrowth] = React.useState({
    usersGrowth: 0,
    projectsGrowth: 0,
    revenueGrowth: 0
  });
  
  // ===== VERIFICATION MODAL STATE =====
  // Controls whether the verification modal is visible
  const [showVerificationModal, setShowVerificationModal] = React.useState(false);
  
  // Comprehensive verification form data with all required fields
  const [verificationForm, setVerificationForm] = React.useState({
    // Personal Information Section
    full_name: '',
    detailed_address: '',
    national_id: null as File | null,
    phone_number: '',
    
    // Professional Information Section
    specialization: '',
    specialization_description: '',
    software_proficiency: [] as string[],
    experience_years: '',
    
    // Portfolio and Projects Section
    portfolio_url: '',
    sample_project: null as File | null,
    project_description: '',
    
    // Additional Information Section
    certifications: '',
    description: '',
    education: '',
    additional_info: '',
    
    // Legal Agreement Section
    terms_accepted: false
  });
  
  // File upload tracking state
  const [uploadedFiles, setUploadedFiles] = React.useState({
    national_id: null as File | null,
    sample_project: null as File | null,
    supporting_docs: [] as File[]
  });
  
  // Verification form submission states
  const [isSubmittingVerification, setIsSubmittingVerification] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState('');
  const [verificationSuccess, setVerificationSuccess] = React.useState(false);

  // ===== CREATE PROJECT MODAL STATE =====
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);

  // ===== CONFIGURATION DATA =====
  // Available architectural software options for verification
  const softwareOptions = [
    'AutoCAD',
    'ArchiCAD', 
    'Revit',
    'SketchUp',
    'Rhino',
    '3ds Max',
    'Lumion',
    'V-Ray',
    'Photoshop',
    'Illustrator',
    'Vectorworks',
    'Chief Architect'
  ];

  // Professional specialization options
  const specializationOptions = [
    { value: 'architect', label: 'Licensed Architect' },
    { value: 'designer', label: 'Architectural Designer' },
    { value: 'consultant', label: 'Design Consultant' },
    { value: 'interior_designer', label: 'Interior Designer' },
    { value: 'landscape_architect', label: 'Landscape Architect' },
    { value: 'urban_planner', label: 'Urban Planner' }
  ];

  // ===== EFFECTS =====
  // Load dashboard statistics when component mounts (admin only)
  React.useEffect(() => {
    const loadDashboardStats = async () => {
      // Only load stats for admin users
      if (isAdmin(userProfile)) {
        try {
          console.log('📈 Loading dashboard statistics for admin...');
          setStatsLoading(true);
          
          // Fetch both dashboard stats and growth data in parallel
          const [stats, growth] = await Promise.all([
            AnalyticsService.getDashboardStats(),
            AnalyticsService.getMonthlyGrowth()
          ]);
          
          setDashboardStats(stats);
          setMonthlyGrowth(growth);
          console.log('✅ Dashboard stats loaded successfully');
        } catch (error) {
          console.error('❌ Error loading dashboard stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadDashboardStats();
  }, [userProfile]);

  // Track profile views when dashboard is accessed
  React.useEffect(() => {
    if (user) {
      AnalyticsService.incrementProfileViews(user.uid);
    }
  }, [user]);

  // ===== EVENT HANDLERS =====
  
  // Handle user logout
  const handleLogout = async () => {
    await logout();
  };

  // Handle form input changes for verification form
  const handleVerificationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      
      // Special handling for software proficiency checkboxes (multiple selection)
      if (name === 'software_proficiency') {
        setVerificationForm(prev => ({
          ...prev,
          software_proficiency: target.checked 
            ? [...prev.software_proficiency, value] // Add to array if checked
            : prev.software_proficiency.filter(item => item !== value) // Remove from array if unchecked
        }));
      } else {
        // Handle single checkbox (like terms acceptance)
        setVerificationForm(prev => ({
          ...prev,
          [name]: target.checked
        }));
      }
    } else {
      // Handle text inputs, textareas, and selects
      setVerificationForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any existing error when user starts typing
    if (verificationError) {
      setVerificationError('');
    }
  };

  // Handle file uploads with validation
  const handleFileUpload = (fileType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setVerificationError('File size must be less than 10MB');
      return;
    }

    // Validate file type based on upload purpose
    if (fileType === 'national_id') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setVerificationError('National ID must be an image (JPG, PNG) or PDF file');
        return;
      }
      // Update both file tracking and form data
      setUploadedFiles(prev => ({ ...prev, national_id: file }));
      setVerificationForm(prev => ({ ...prev, national_id: file }));
    } else if (fileType === 'sample_project') {
      const allowedTypes = ['application/pdf', 'application/dwg', 'application/dxf', 'image/jpeg', 'image/png'];
      const isDwgFile = file.name.toLowerCase().endsWith('.dwg') || file.name.toLowerCase().endsWith('.dxf');
      
      if (!allowedTypes.includes(file.type) && !isDwgFile) {
        setVerificationError('Sample project must be PDF, DWG, DXF, or image file');
        return;
      }
      // Update both file tracking and form data
      setUploadedFiles(prev => ({ ...prev, sample_project: file }));
      setVerificationForm(prev => ({ ...prev, sample_project: file }));
    }
    
    // Clear any existing error after successful file selection
    setVerificationError('');
  };

  // Handle verification form submission
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ===== COMPREHENSIVE VALIDATION =====
    
    // Check required text fields
    const requiredFields = [
      'full_name', 'detailed_address', 'phone_number', 'specialization', 
      'specialization_description', 'experience_years', 'portfolio_url'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = verificationForm[field as keyof typeof verificationForm];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      setVerificationError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check required file uploads
    if (!verificationForm.national_id) {
      setVerificationError('Please upload your National ID or Passport');
      return;
    }

    if (!verificationForm.sample_project) {
      setVerificationError('Please upload a sample project file');
      return;
    }

    // Check software proficiency selection
    if (verificationForm.software_proficiency.length === 0) {
      setVerificationError('Please select at least one software you are proficient in');
      return;
    }

    // Check terms acceptance
    if (!verificationForm.terms_accepted) {
      setVerificationError('Please accept the terms and conditions');
      return;
    }

    // ===== FORM SUBMISSION =====
    setIsSubmittingVerification(true);
    setVerificationError('');

    try {
      console.log('🔄 Submitting comprehensive verification request:', verificationForm);
      
      // Check if user already has a pending verification
      if (user?.uid) {
        const hasExisting = await verificationService.hasExistingVerification(user.uid);
        if (hasExisting) {
          setVerificationError('You already have a pending verification request. Please wait for review.');
          setIsSubmittingVerification(false);
          return;
        }
      }
      
      // Submit verification request to Firebase
      const result = await verificationService.submitVerificationRequest(
        verificationForm,
        user?.uid || '',
        user?.email || ''
      );
      
      if (result.success) {
        // Show success state
        setVerificationSuccess(true);
        console.log('✅ Comprehensive verification request submitted successfully with ID:', result.id);
      } else {
        throw new Error(result.error || 'Failed to submit verification request');
      }
      
      // Reset form and close modal after successful submission
      setTimeout(() => {
        setShowVerificationModal(false);
        setVerificationSuccess(false);
        
        // Reset all form data
        setVerificationForm({
          full_name: '',
          detailed_address: '',
          national_id: null,
          phone_number: '',
          specialization: '',
          specialization_description: '',
          software_proficiency: [],
          experience_years: '',
          portfolio_url: '',
          sample_project: null,
          project_description: '',
          certifications: '',
          description: '',
          education: '',
          additional_info: '',
          terms_accepted: false
        });
        
        // Reset file uploads
        setUploadedFiles({
          national_id: null,
          sample_project: null,
          supporting_docs: []
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error submitting verification:', error);
      setVerificationError('Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // Handle verification button click to open modal
  const handleVerificationButtonClick = () => {
    setShowVerificationModal(true);
  };

  // Handle create project button click
  const handleCreateProjectClick = () => {
    setShowCreateProjectModal(true);
  };

  // Handle project creation success
  const handleProjectCreated = (project: any) => {
    console.log('Project created successfully:', project);
    // Here you could add the project to a local state or refresh data
    // For now, we'll just log it
  };

  // ===== UTILITY FUNCTIONS =====
  
  // Format numbers with commas for better readability
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Calculate percentage change for growth indicators
  const formatGrowthPercentage = (growth: number): string => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  // Get appropriate color class for growth indicators
  const getGrowthColorClass = (growth: number): string => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // ===== RENDER COMPONENT =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ===== ROLE-SPECIFIC NAVIGATION HEADER ===== */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  ArchiWork
                </span>
              </div>

              {/* Role-specific Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                {/* Admin Navigation */}
                {isAdmin(userProfile) && (
                  <>
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/users')}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      Users
                    </button>
                    <button
                      onClick={() => navigate('/verifications')}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      Verifications
                    </button>
                    <button
                      onClick={() => navigate('/analytics')}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      Analytics
                    </button>
                  </>
                )}

                {/* Verified Designer Navigation */}
                {isVerifiedDesigner(userProfile) && (
                  <>
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/projects')}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => navigate('/projects')}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      Portfolio
                    </button>
                    <button
                      onClick={() => navigate('/clients')}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      Clients
                    </button>
                  </>
                )}

                {/* Unverified Designer Navigation */}
                {isDesigner(userProfile) && !isVerifiedDesigner(userProfile) && (
                  <>
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      Dashboard
                    </button>
                    <button
                      onClick={handleVerificationButtonClick}
                      className="px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Get Verified</span>
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      Learn More
                    </button>
                  </>
                )}

                {/* Service Requester Navigation */}
                {isServiceRequester(userProfile) && (
                  <>
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      Dashboard
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      Find Designers
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      My Requests
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      Messages
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Profile and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell (for all users) */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
                <MessageSquare className="w-5 h-5" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </button>

              {/* User Info Display */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || user?.displayName || 'User'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">
                      {userProfile?.user_type ? USER_TYPE_LABELS[userProfile.user_type] : 'Loading...'}
                    </p>
                    {/* Show verification status for designers */}
                    {isDesigner(userProfile) && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isVerifiedDesigner(userProfile)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isVerifiedDesigner(userProfile) ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* User Avatar with role-specific styling */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isAdmin(userProfile)
                    ? 'bg-gradient-to-br from-purple-100 to-indigo-200'
                    : isVerifiedDesigner(userProfile)
                    ? 'bg-gradient-to-br from-green-100 to-emerald-200'
                    : isDesigner(userProfile)
                    ? 'bg-gradient-to-br from-amber-100 to-yellow-200'
                    : 'bg-gradient-to-br from-blue-100 to-cyan-200'
                }`}>
                  <User className={`w-5 h-5 ${
                    isAdmin(userProfile)
                      ? 'text-purple-600'
                      : isVerifiedDesigner(userProfile)
                      ? 'text-green-600'
                      : isDesigner(userProfile)
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Settings Button */}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MAIN DASHBOARD CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===== VERIFICATION NOTIFICATION (Unverified Designers Only) ===== */}
        {userProfile?.user_type === 'designer' && userProfile.designer_verification_status === 'unverified' && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-amber-900 mb-2">Complete Your Designer Verification</h3>
                <p className="text-amber-700 mb-4">
                  Your designer account is currently unverified. Submit your portfolio and credentials to get verified and unlock additional features including project creation and premium tools.
                </p>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleVerificationButtonClick}
                    className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Submit for Verification</span>
                  </button>
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center space-x-2 text-amber-700">
                    <div className="w-24 bg-amber-200 rounded-full h-2">
                      <div className="w-3/4 bg-amber-600 h-2 rounded-full transition-all duration-300"></div>
                    </div>
                    <span className="text-sm font-medium">75% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ROLE-SPECIFIC WELCOME SECTION ===== */}
        <div className="mb-8">
          {/* Admin Welcome */}
          {isAdmin(userProfile) && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Admin'}! 👑
                  </h1>
                  <p className="text-purple-700 text-lg font-medium">Platform Administrator</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Monitor platform performance, manage users, and oversee verification processes. Your dashboard provides comprehensive analytics and administrative tools.
              </p>
            </div>
          )}

          {/* Verified Designer Welcome */}
          {isVerifiedDesigner(userProfile) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Designer'}! ✨
                  </h1>
                  <p className="text-green-700 text-lg font-medium flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Verified Professional Designer
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Create stunning architectural designs, manage your projects, and collaborate with clients. Your verified status unlocks all premium features and tools.
              </p>
            </div>
          )}

          {/* Unverified Designer Welcome */}
          {isDesigner(userProfile) && !isVerifiedDesigner(userProfile) && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, {userProfile?.full_name?.split(' ')[0] || 'Designer'}! 🚀
                  </h1>
                  <p className="text-amber-700 text-lg font-medium flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Designer Account (Pending Verification)
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                You're almost ready to start creating! Complete your verification process to unlock all designer features, project creation tools, and client collaboration capabilities.
              </p>
            </div>
          )}

          {/* Service Requester Welcome */}
          {isServiceRequester(userProfile) && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Client'}! 🏗️
                  </h1>
                  <p className="text-blue-700 text-lg font-medium">Service Requester</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Connect with talented verified designers, browse architectural services, and bring your vision to life. Explore our network of professional architects and designers.
              </p>
            </div>
          )}
        </div>

        {/* ===== ADMIN DASHBOARD ANALYTICS (Admin Users Only) ===== */}
        {isAdmin(userProfile) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Platform Analytics
            </h2>
            
            {statsLoading ? (
              // Loading State for Analytics
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`text-sm font-medium ${getGrowthColorClass(monthlyGrowth.usersGrowth)}`}>
                      {formatGrowthPercentage(monthlyGrowth.usersGrowth)}
                    </span>
                  </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardStats.totalUsers)}
                  </h3>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>vs last month</span>
                  </div>
                </div>

                {/* Active Projects Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <span className={`text-sm font-medium ${getGrowthColorClass(monthlyGrowth.projectsGrowth)}`}>
                      {formatGrowthPercentage(monthlyGrowth.projectsGrowth)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardStats.activeProjects)}
                  </h3>
                  <p className="text-gray-600 text-sm">Active Projects</p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <Target className="w-3 h-3 mr-1" />
                    <span>Currently in progress</span>
                  </div>
                </div>

                {/* Verified Designers Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {dashboardStats.usersByType.verifiedDesigners > 0 
                        ? `${((dashboardStats.usersByType.verifiedDesigners / dashboardStats.usersByType.designers) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardStats.usersByType.verifiedDesigners)}
                  </h3>
                  <p className="text-gray-600 text-sm">Verified Designers</p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>of {dashboardStats.usersByType.designers} total</span>
                  </div>
                </div>

                {/* Profile Views Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-orange-600">
                      <ArrowUpRight className="w-3 h-3 inline mr-1" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatNumber(dashboardStats.totalProfileViews)}
                  </h3>
                  <p className="text-gray-600 text-sm">Profile Views</p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>Total engagement</span>
                  </div>
                </div>
              </div>

              {/* User Distribution Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  User Distribution by Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Admins */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-gray-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{dashboardStats.usersByType.admins}</h4>
                    <p className="text-gray-600 text-sm">Administrators</p>
                  </div>

                  {/* Designers */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Compass className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{dashboardStats.usersByType.designers}</h4>
                    <p className="text-gray-600 text-sm">Designers</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {dashboardStats.usersByType.verifiedDesigners} verified
                    </p>
                  </div>

                  {/* Service Requesters */}
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{dashboardStats.usersByType.serviceRequesters}</h4>
                    <p className="text-gray-600 text-sm">Service Requesters</p>
                  </div>
                </div>
                </div>

                {/* User Distribution Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    User Distribution by Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Admins */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-8 h-8 text-gray-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">{dashboardStats.usersByType.admins}</h4>
                      <p className="text-gray-600 text-sm">Administrators</p>
                    </div>

                    {/* Designers */}
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Compass className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">{dashboardStats.usersByType.designers}</h4>
                      <p className="text-gray-600 text-sm">Designers</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {dashboardStats.usersByType.verifiedDesigners} verified
                      </p>
                    </div>

                    {/* Service Requesters */}
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Building className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">{dashboardStats.usersByType.serviceRequesters}</h4>
                      <p className="text-gray-600 text-sm">Service Requesters</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== ROLE-SPECIFIC QUICK ACTIONS SECTION ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-blue-600" />
            {isAdmin(userProfile) && "Administrative Actions"}
            {isVerifiedDesigner(userProfile) && "Designer Tools"}
            {isDesigner(userProfile) && !isVerifiedDesigner(userProfile) && "Getting Started"}
            {isServiceRequester(userProfile) && "Find Services"}
          </h2>
          
          {/* Admin Actions */}
          {isAdmin(userProfile) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => navigate('/users')}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                <p className="text-gray-600 text-sm mb-4">Oversee user accounts, verifications, and platform permissions.</p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <span>Manage Users</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div
                onClick={() => navigate('/verifications')}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Center</h3>
                <p className="text-gray-600 text-sm mb-4">Review and approve designer verification requests.</p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  <span>Review Requests</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div
                onClick={() => navigate('/analytics')}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 text-sm mb-4">View detailed platform analytics and performance metrics.</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>View Analytics</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          )}

          {/* Verified Designer Actions */}
          {isVerifiedDesigner(userProfile) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={handleCreateProjectClick}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Project</h3>
                <p className="text-gray-600 text-sm mb-4">Start a new architectural design project with premium tools.</p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <span>Create Project</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div
                onClick={() => navigate('/projects')}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Projects</h3>
                <p className="text-gray-600 text-sm mb-4">View and manage your ongoing architectural projects.</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>View Projects</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div
                onClick={() => navigate('/projects')}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Manager</h3>
                <p className="text-gray-600 text-sm mb-4">Showcase your best work and attract new clients.</p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <span>Manage Portfolio</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          )}

          {/* Unverified Designer Actions */}
          {isDesigner(userProfile) && !isVerifiedDesigner(userProfile) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group" onClick={handleVerificationButtonClick}>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Verification</h3>
                <p className="text-gray-600 text-sm mb-4">Submit your credentials and portfolio for verification.</p>
                <div className="flex items-center text-amber-600 text-sm font-medium">
                  <span>Get Verified</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Platform</h3>
                <p className="text-gray-600 text-sm mb-4">Learn about features and tools available after verification.</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Explore Features</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          )}

          {/* Service Requester Actions */}
          {isServiceRequester(userProfile) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => navigate('/clients')}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Designers</h3>
                <p className="text-gray-600 text-sm mb-4">Browse verified designers and their portfolios.</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Browse Designers</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div
                onClick={() => navigate('/requests')}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Post Project Request</h3>
                <p className="text-gray-600 text-sm mb-4">Describe your project and get proposals from designers.</p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <span>Post Request</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>

              <div
                onClick={() => navigate('/requests')}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Requests</h3>
                <p className="text-gray-600 text-sm mb-4">Track your project requests and communications.</p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <span>View Requests</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          )}

          {/* Common Actions for All Users */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Profile Settings</h4>
                    <p className="text-sm text-gray-500">Update your account</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/messages')}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors duration-200">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Messages</h4>
                    <p className="text-sm text-gray-500">Chat with team</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Schedule</h4>
                    <p className="text-sm text-gray-500">Manage calendar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RECENT ACTIVITY SECTION ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
            Recent Activity
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              {/* Activity Timeline */}
              <div className="space-y-6">
                {/* Sample Activity Items */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Welcome to ArchiWork!</span> Your account has been created successfully.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                  </div>
                </div>

                {/* Conditional activity based on user type */}
                {isDesigner(userProfile) && !isVerifiedDesigner(userProfile) && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Verification Required:</span> Complete your designer verification to unlock all features.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Pending</p>
                    </div>
                  </div>
                )}

                {isVerifiedDesigner(userProfile) && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Verification Complete:</span> Your designer account has been verified!
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Recently</p>
                    </div>
                  </div>
                )}

                {/* Empty state for no recent activity */}
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No recent activity to show</p>
                  <p className="text-gray-400 text-xs mt-1">Start using ArchiWork to see your activity here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== COMPREHENSIVE VERIFICATION MODAL ===== */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Award className="w-8 h-8 mr-3 text-blue-600" />
                    Designer Verification Application
                  </h2>
                  <p className="text-gray-600 mt-2">Complete all sections to submit your verification request</p>
                </div>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-8 py-6">
              {/* Success State */}
              {verificationSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Application Submitted Successfully!</h3>
                  <p className="text-green-700">Your verification request has been submitted and is under review. You'll receive an email notification once the review is complete.</p>
                </div>
              )}

              {/* Error State */}
              {verificationError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">{verificationError}</p>
                </div>
              )}

              {/* Verification Form */}
              <form onSubmit={handleVerificationSubmit} className="space-y-8">
                {/* ===== SECTION 1: PERSONAL INFORMATION ===== */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={verificationForm.full_name}
                        onChange={handleVerificationInputChange}
                        placeholder="Enter your full legal name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone_number"
                          value={verificationForm.phone_number}
                          onChange={handleVerificationInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Detailed Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Address *
                      </label>
                      <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          name="detailed_address"
                          value={verificationForm.detailed_address}
                          onChange={handleVerificationInputChange}
                          placeholder="Enter your complete address including street, city, state, and postal code"
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          required
                        />
                      </div>
                    </div>

                    {/* National ID Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National ID / Passport *
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                        uploadedFiles.national_id
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}>
                        <input
                          type="file"
                          name="national_id"
                          onChange={handleFileUpload('national_id')}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="national-id-upload"
                          required
                        />
                        <label htmlFor="national-id-upload" className="cursor-pointer">
                          {uploadedFiles.national_id ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm text-green-700 font-medium">
                                {uploadedFiles.national_id.name}
                              </p>
                              <p className="text-xs text-green-600 mt-1">Document uploaded successfully</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Click to upload your National ID or Passport
                              </p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, or PDF up to 10MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 2: PROFESSIONAL INFORMATION ===== */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Specialization *
                      </label>
                      <select
                        name="specialization"
                        value={verificationForm.specialization}
                        onChange={handleVerificationInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select your specialization</option>
                        <option value="residential">Residential Architecture</option>
                        <option value="commercial">Commercial Architecture</option>
                        <option value="industrial">Industrial Architecture</option>
                        <option value="landscape">Landscape Architecture</option>
                        <option value="interior">Interior Design</option>
                        <option value="urban_planning">Urban Planning</option>
                        <option value="sustainable">Sustainable Design</option>
                        <option value="restoration">Historic Restoration</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Experience Years */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <select
                        name="experience_years"
                        value={verificationForm.experience_years}
                        onChange={handleVerificationInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select experience level</option>
                        <option value="0-1">0-1 years (Entry Level)</option>
                        <option value="2-5">2-5 years (Junior)</option>
                        <option value="6-10">6-10 years (Mid-Level)</option>
                        <option value="11-15">11-15 years (Senior)</option>
                        <option value="16+">16+ years (Expert)</option>
                      </select>
                    </div>

                    {/* Specialization Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization Description *
                      </label>
                      <textarea
                        name="specialization_description"
                        value={verificationForm.specialization_description}
                        onChange={handleVerificationInputChange}
                        placeholder="Describe your expertise, notable projects, and what makes you unique in your field"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        required
                      />
                    </div>

                    {/* Software Proficiency */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Software Proficiency *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {[
                          'AutoCAD', 'Revit', 'SketchUp', '3ds Max',
                          'Rhino', 'ArchiCAD', 'Lumion', 'V-Ray',
                          'Photoshop', 'Illustrator', 'InDesign', 'Blender'
                        ].map((software) => (
                          <label key={software} className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 ${
                            verificationForm.software_proficiency.includes(software)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}>
                            <input
                              type="checkbox"
                              value={software}
                              checked={verificationForm.software_proficiency.includes(software)}
                              onChange={(e) => {
                                const { value, checked } = e.target;
                                setVerificationForm(prev => ({
                                  ...prev,
                                  software_proficiency: checked
                                    ? [...prev.software_proficiency, value]
                                    : prev.software_proficiency.filter(item => item !== value)
                                }));
                              }}
                              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium">{software}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Select all software you are proficient in (minimum 1 required)
                      </p>
                    </div>

                    {/* Portfolio URL */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio Website *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          name="portfolio_url"
                          value={verificationForm.portfolio_url}
                          onChange={handleVerificationInputChange}
                          placeholder="https://your-portfolio.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Please provide a link to your online portfolio or professional website
                      </p>
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 3: PROJECT PORTFOLIO ===== */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Project Portfolio
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Sample Project Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sample Project Files *
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                        uploadedFiles.sample_project
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                      }`}>
                        <input
                          type="file"
                          name="sample_project"
                          onChange={handleFileUpload('sample_project')}
                          accept="image/*,.pdf,.dwg,.rvt,.skp"
                          className="hidden"
                          id="sample-project-upload"
                          required
                        />
                        <label htmlFor="sample-project-upload" className="cursor-pointer">
                          {uploadedFiles.sample_project ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm text-green-700 font-medium">
                                {uploadedFiles.sample_project.name}
                              </p>
                              <p className="text-xs text-green-600 mt-1">File uploaded successfully</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Upload your best project files
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Images, PDFs, CAD files up to 50MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Project Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Description *
                      </label>
                      <textarea
                        name="project_description"
                        value={verificationForm.project_description}
                        onChange={handleVerificationInputChange}
                        placeholder="Describe the uploaded project: scope, challenges, solutions, and your role"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 4: CERTIFICATIONS & ADDITIONAL INFO ===== */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      Certifications & Additional Information
                    </h3>
                    <div className="flex items-center space-x-2 text-amber-600">
                      <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <span className="text-sm font-medium">Final Step</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Certifications (Optional)
                      </label>
                      <textarea
                        name="certifications"
                        value={verificationForm.certifications}
                        onChange={handleVerificationInputChange}
                        placeholder="List any professional certifications, licenses, or memberships (e.g., AIA, RIBA, LEED AP)"
                        rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* Education */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education Background *
                      </label>
                      <textarea
                        name="education"
                        value={verificationForm.education}
                        onChange={handleVerificationInputChange}
                        placeholder="List your relevant education (degree, institution, graduation year)"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        required
                      />
                    </div>

                    {/* Additional Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Information (Optional)
                      </label>
                      <textarea
                        name="additional_info"
                        value={verificationForm.additional_info}
                        onChange={handleVerificationInputChange}
                        placeholder="Any additional information that supports your verification (awards, publications, notable projects, etc.)"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="terms_accepted"
                          checked={verificationForm.terms_accepted}
                          onChange={handleVerificationInputChange}
                          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                          required
                        />
                        <div className="text-sm">
                          <span className="text-gray-700">
                            I agree to the{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                              Privacy Policy
                            </a>
                            . I confirm that all information provided is accurate and I understand that false information may result in account suspension.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ===== FORM ACTIONS ===== */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Ready to Submit?</h4>
                      <p className="text-sm text-gray-600">Review your information and submit for verification</p>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">All sections complete</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setShowVerificationModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingVerification || !verificationForm.terms_accepted}
                      className="flex-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {isSubmittingVerification ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>Submitting Application...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Send className="w-5 h-5" />
                          <span>Submit Verification Application</span>
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Secure submission</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>24-48 hour review</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span>Email notification</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE PROJECT MODAL ===== */}
      {showCreateProjectModal && (
        <CreateNewProject
          onClose={() => setShowCreateProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
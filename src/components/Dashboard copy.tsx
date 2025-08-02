import React from 'react';
import { 
  Building, LogOut, User, Settings, FolderOpen, Plus, Shield, Users, Compass, CheckCircle, AlertCircle,
  BarChart3, TrendingUp, Calendar, MessageSquare, Award, Target, Zap, Sparkles, Eye, Heart, ArrowUpRight,
  X, Upload, FileText, Image, Send
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AnalyticsService } from '../services/analyticsService';
import { USER_TYPE_LABELS, isAdmin, isDesigner, isVerifiedDesigner, isServiceRequester, canManageUsers, canCreateProjects } from '../types/user';

function Dashboard() {
  const { user, userProfile, logout } = useAuth();
  
  // Real analytics data state
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
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [monthlyGrowth, setMonthlyGrowth] = React.useState({
    usersGrowth: 0,
    projectsGrowth: 0,
    revenueGrowth: 0
  });
  
  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = React.useState(false);
  const [verificationForm, setVerificationForm] = React.useState({
    portfolio_url: '',
    experience_years: '',
    specialization: '',
    description: '',
    certifications: '',
    contact_phone: ''
  });
  const [isSubmittingVerification, setIsSubmittingVerification] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState('');
  const [verificationSuccess, setVerificationSuccess] = React.useState(false);

  // Load real dashboard statistics
  React.useEffect(() => {
    const loadDashboardStats = async () => {
      if (isAdmin(userProfile)) {
        try {
          console.log('📈 Loading dashboard statistics for admin...');
          setStatsLoading(true);
          
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

  // Increment profile views when dashboard is viewed
  React.useEffect(() => {
    if (user) {
      AnalyticsService.incrementProfileViews(user.uid);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleVerificationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVerificationForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (verificationError) {
      setVerificationError('');
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!verificationForm.portfolio_url || !verificationForm.experience_years || !verificationForm.specialization) {
      setVerificationError('Please fill in all required fields.');
      return;
    }

    setIsSubmittingVerification(true);
    setVerificationError('');

    try {
      // Simulate API call - replace with actual verification submission
      console.log('🔄 Submitting verification request:', verificationForm);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll just show success
      // In real implementation, you would call an API endpoint
      /*
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          ...verificationForm,
          user_id: user?.uid
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit verification request');
      }
      */
      
      setVerificationSuccess(true);
      console.log('✅ Verification request submitted successfully');
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowVerificationModal(false);
        setVerificationSuccess(false);
        setVerificationForm({
          portfolio_url: '',
          experience_years: '',
          specialization: '',
          description: '',
          certifications: '',
          contact_phone: ''
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error submitting verification:', error);
      setVerificationError('Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                <Building className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
                ArchiWork
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || user?.displayName || user?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">
                      {userProfile ? USER_TYPE_LABELS[userProfile.user_type] : 'Loading...'}
                    </p>
                    {userProfile?.user_type === 'designer' && (
                      <div className="flex items-center">
                        {userProfile.designer_verification_status === 'verified' ? (
                          <CheckCircle className="w-3 h-3 text-green-500" title="Verified Designer" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-500" title="Unverified Designer" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">
              Welcome back, {userProfile?.full_name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            {userProfile?.user_type === 'admin' && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </div>
            )}
            {userProfile?.user_type === 'designer' && userProfile.designer_verification_status === 'verified' && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Verified Designer</span>
              </div>
            )}
            {userProfile?.user_type === 'designer' && userProfile.designer_verification_status === 'unverified' && (
              <div className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Unverified Designer</span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            {userProfile?.user_type === 'admin' && 'Manage the platform, users, and oversee all architectural projects.'}
            {userProfile?.user_type === 'designer' && 'Continue working on your architectural projects and designs.'}
            {userProfile?.user_type === 'service_requester' && 'Find and collaborate with talented designers for your architectural needs.'}
          </p>
        </div>

        {/* Role-specific notifications */}
        {/* Enhanced notification with progress tracking */}
        {userProfile?.user_type === 'designer' && userProfile.designer_verification_status === 'unverified' && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-amber-900 mb-2">Complete Your Designer Verification</h3>
                <p className="text-amber-700 mb-4">
                  Your designer account is currently unverified. Submit your portfolio and credentials to get verified and unlock additional features.
                </p>
                <div className="flex items-center space-x-4">
                  <button className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Submit for Verification</span>
                  </button>
                  <div className="flex items-center space-x-2 text-amber-700">
                    <div className="w-24 bg-amber-200 rounded-full h-2">
                      <div className="w-3/4 bg-amber-600 h-2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">75% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats for all users */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isAdmin(userProfile) && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 relative">
                {statsLoading && (
                  <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : dashboardStats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{monthlyGrowth.usersGrowth}% this month
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600 opacity-75" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 relative">
                {statsLoading && (
                  <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : dashboardStats.activeProjects.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      +{monthlyGrowth.projectsGrowth}% this month
                    </p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-blue-600 opacity-75" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 relative">
                {statsLoading && (
                  <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : dashboardStats.totalProfileViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-indigo-600 flex items-center mt-1">
                      <Eye className="w-3 h-3 mr-1" />
                      All time views
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-indigo-600 opacity-75" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 relative">
                {statsLoading && (
                  <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verified Designers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : dashboardStats.usersByType.verifiedDesigners.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active designers
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600 opacity-75" />
                </div>
              </div>
            </>
          )}
          
          {isDesigner(userProfile) && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Projects Completed</p>
                    <p className="text-2xl font-bold text-gray-900">45</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <Award className="w-3 h-3 mr-1" />
                      4.9★ rating
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600 opacity-75" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$3,200</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +23% growth
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600 opacity-75" />
                </div>
              </div>
            </>
          )}
          
          {isServiceRequester(userProfile) && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      2 in progress
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-blue-600 opacity-75" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Saved Designers</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <Heart className="w-3 h-3 mr-1" />
                      In favorites
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600 opacity-75" />
                </div>
              </div>
            </>
          )}
          
          {/* Universal stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isAdmin(userProfile) 
                    ? (statsLoading ? '...' : dashboardStats.totalProfileViews.toLocaleString())
                    : '156' /* Individual user views - implement user-specific tracking */
                  }
                </p>
                <p className="text-xs text-indigo-600 flex items-center mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  {isAdmin(userProfile) ? 'All time views' : '+8 today'}
                </p>
              </div>
              <Eye className="w-8 h-8 text-indigo-600 opacity-75" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Admin-only actions */}
          {isAdmin(userProfile) && (
            <div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer"
              onClick={() => console.log('Navigate to User Management')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
              <p className="text-gray-600 text-sm mb-4">
                {statsLoading ? 'Loading...' : `${dashboardStats.totalUsers} total users, ${dashboardStats.usersByType.unverifiedDesigners} pending verification`}
              </p>
              <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
                Manage Users →
              </button>
            </div>
          )}
          
          {/* Project creation - Admin and Designers */}
          {canCreateProjects(userProfile) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                New Project
                <Sparkles className="w-4 h-4 ml-2 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {isDesigner(userProfile) 
                  ? 'Start a new architectural design project from scratch.'
                  : 'Create and manage architectural projects.'
                }
              </p>
              <button className="text-blue-600 font-medium text-sm hover:text-blue-700">
                Create Project →
              </button>
            </div>
          )}
          
          {/* Service requests - Service Requesters and Admin */}
          {(isServiceRequester(userProfile) || isAdmin(userProfile)) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Compass className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Service</h3>
              <p className="text-gray-600 text-sm mb-4">
                Connect with verified designers for your architectural needs.
              </p>
              <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                Find Designers →
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Projects</h3>
            <p className="text-gray-600 text-sm mb-4">
              Access your recently worked on projects.
            </p>
            <button className="text-green-600 font-medium text-sm hover:text-green-700">
              View Projects →
            </button>
          </div>

          {/* Additional action cards based on role */}
          {isDesigner(userProfile) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Messages</h3>
              <p className="text-gray-600 text-sm mb-4">
                Communicate with your clients and manage project discussions.
              </p>
              <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700">
                Open Messages →
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm mb-4">
              Customize your workspace and preferences.
            </p>
            <button className="text-gray-600 font-medium text-sm hover:text-gray-700">
              Open Settings →
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">View:</span>
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">Grid</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">List</button>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">
              {isDesigner(userProfile) && 'Start by creating your first architectural project.'}
              {isServiceRequester(userProfile) && 'Request your first architectural service from our talented designers.'}
              {isAdmin(userProfile) && 'Monitor and manage all platform projects.'}
            </p>
            {canCreateProjects(userProfile) && (
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                Create Your First Project
              </button>
            )}
            {isServiceRequester(userProfile) && (
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200">
                Find a Designer
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Verification Submission Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Shield className="w-6 h-6 text-amber-600" />
                    <span>Designer Verification</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Submit your credentials to get verified</p>
                </div>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-8 py-6">
              {verificationSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Submitted!</h3>
                  <p className="text-gray-600 mb-4">
                    Your verification request has been submitted successfully. Our team will review your application within 2-3 business days.
                  </p>
                  <p className="text-sm text-gray-500">
                    You'll receive an email notification once your account is verified.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitVerification} className="space-y-6">
                  {/* Error Display */}
                  {verificationError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm font-medium">{verificationError}</p>
                    </div>
                  )}

                  {/* Portfolio URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Website <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Image className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="portfolio_url"
                        value={verificationForm.portfolio_url}
                        onChange={handleVerificationInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        placeholder="https://yourportfolio.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experience_years"
                      value={verificationForm.experience_years}
                      onChange={handleVerificationInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      required
                    >
                      <option value="">Select experience level</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-15">11-15 years</option>
                      <option value="15+">15+ years</option>
                    </select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="specialization"
                      value={verificationForm.specialization}
                      onChange={handleVerificationInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      required
                    >
                      <option value="">Select your specialization</option>
                      <option value="residential">Residential Architecture</option>
                      <option value="commercial">Commercial Architecture</option>
                      <option value="interior">Interior Design</option>
                      <option value="landscape">Landscape Architecture</option>
                      <option value="urban_planning">Urban Planning</option>
                      <option value="sustainable">Sustainable Design</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={verificationForm.contact_phone}
                      onChange={handleVerificationInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Certifications
                    </label>
                    <textarea
                      name="certifications"
                      value={verificationForm.certifications}
                      onChange={handleVerificationInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="List any relevant certifications, licenses, or professional memberships..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Summary
                    </label>
                    <textarea
                      name="description"
                      value={verificationForm.description}
                      onChange={handleVerificationInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Briefly describe your experience, expertise, and design philosophy..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVerificationModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingVerification}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingVerification ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="w-5 h-5 mr-2" />
                          Submit for Verification
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
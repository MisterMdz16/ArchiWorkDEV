import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, FolderOpen, DollarSign, Eye, Star,
  Calendar, Download, Filter, RefreshCw, ArrowUpRight, ArrowDownRight,
  Target, Award, Clock, CheckCircle, AlertCircle, Activity, Zap,
  Globe, MessageSquare, Heart, Share2, PieChart, LineChart, Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, canViewAnalytics } from '../types/user';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    completedProjects: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
  userMetrics: {
    newUsers: number;
    userRetention: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  projectMetrics: {
    projectsCreated: number;
    projectsCompleted: number;
    averageProjectValue: number;
    successRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRecurring: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  geographicData: {
    country: string;
    users: number;
    revenue: number;
  }[];
  timeSeriesData: {
    date: string;
    users: number;
    projects: number;
    revenue: number;
  }[];
}

const Analytics: React.FC = () => {
  const { userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Mock data for demonstration
  useEffect(() => {
    const mockData: AnalyticsData = {
      overview: {
        totalUsers: 2847,
        activeUsers: 1923,
        totalProjects: 1456,
        completedProjects: 1089,
        totalRevenue: 485000,
        monthlyGrowth: 12.5
      },
      userMetrics: {
        newUsers: 234,
        userRetention: 78.5,
        averageSessionTime: 24.3,
        bounceRate: 32.1
      },
      projectMetrics: {
        projectsCreated: 89,
        projectsCompleted: 67,
        averageProjectValue: 15750,
        successRate: 94.2
      },
      revenueMetrics: {
        totalRevenue: 485000,
        monthlyRecurring: 45000,
        averageOrderValue: 8500,
        conversionRate: 3.8
      },
      geographicData: [
        { country: 'United States', users: 1245, revenue: 285000 },
        { country: 'Canada', users: 456, revenue: 89000 },
        { country: 'United Kingdom', users: 389, revenue: 67000 },
        { country: 'Australia', users: 234, revenue: 44000 },
        { country: 'Germany', users: 198, revenue: 38000 }
      ],
      timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 50,
        projects: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 5000) + 1000
      }))
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  // Check permissions
  if (!canViewAnalytics(userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Monitor platform performance and user engagement</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+{analyticsData.overview.monthlyGrowth}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(analyticsData.overview.totalUsers)}
            </h3>
            <p className="text-gray-600 text-sm">Total Users</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Activity className="w-3 h-3 mr-1" />
              <span>{formatNumber(analyticsData.overview.activeUsers)} active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+8.2%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(analyticsData.overview.totalProjects)}
            </h3>
            <p className="text-gray-600 text-sm">Total Projects</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>{formatNumber(analyticsData.overview.completedProjects)} completed</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+15.3%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(analyticsData.overview.totalRevenue)}
            </h3>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{formatCurrency(analyticsData.revenueMetrics.monthlyRecurring)} MRR</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+2.1%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {analyticsData.revenueMetrics.conversionRate}%
            </h3>
            <p className="text-gray-600 text-sm">Conversion Rate</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Zap className="w-3 h-3 mr-1" />
              <span>{formatCurrency(analyticsData.revenueMetrics.averageOrderValue)} AOV</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Time Series Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                Growth Trends
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMetric('users')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedMetric === 'users' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setSelectedMetric('projects')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedMetric === 'projects' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedMetric === 'revenue' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
            
            {/* Simple Chart Visualization */}
            <div className="h-64 flex items-end space-x-1">
              {analyticsData.timeSeriesData.slice(-14).map((data, index) => {
                const value = selectedMetric === 'users' ? data.users : 
                             selectedMetric === 'projects' ? data.projects : 
                             data.revenue / 100;
                const maxValue = Math.max(...analyticsData.timeSeriesData.map(d => 
                  selectedMetric === 'users' ? d.users : 
                  selectedMetric === 'projects' ? d.projects : 
                  d.revenue / 100
                ));
                const height = (value / maxValue) * 100;
                
                return (
                  <div
                    key={index}
                    className={`flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                      selectedMetric === 'users' ? 'bg-blue-500' :
                      selectedMetric === 'projects' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${new Date(data.date).toLocaleDateString()}: ${
                      selectedMetric === 'revenue' ? formatCurrency(data.revenue) : value
                    }`}
                  />
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>{analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 14]?.date}</span>
              <span>Today</span>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              Geographic Distribution
            </h3>
            
            <div className="space-y-4">
              {analyticsData.geographicData.map((country, index) => {
                const maxUsers = Math.max(...analyticsData.geographicData.map(c => c.users));
                const percentage = (country.users / maxUsers) * 100;
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-900 truncate">
                      {country.country}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{country.users} users</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(country.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              User Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-blue-900">New Users</p>
                  <p className="text-2xl font-bold text-blue-900">{analyticsData.userMetrics.newUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Retention</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.userMetrics.userRetention}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analyticsData.userMetrics.userRetention}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Session Time</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.userMetrics.averageSessionTime}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.userMetrics.bounceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-green-600" />
              Project Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-green-900">Projects Created</p>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.projectMetrics.projectsCreated}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.projectMetrics.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analyticsData.projectMetrics.successRate}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Project Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(analyticsData.projectMetrics.averageProjectValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.projectMetrics.projectsCompleted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
              Revenue Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-purple-900">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(analyticsData.revenueMetrics.monthlyRecurring)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.revenueMetrics.conversionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${analyticsData.revenueMetrics.conversionRate * 10}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Order Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(analyticsData.revenueMetrics.averageOrderValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(analyticsData.revenueMetrics.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {[
              { icon: Users, color: 'blue', text: '23 new users registered today', time: '2 hours ago' },
              { icon: FolderOpen, color: 'green', text: '15 new projects created', time: '4 hours ago' },
              { icon: CheckCircle, color: 'purple', text: '8 projects completed successfully', time: '6 hours ago' },
              { icon: DollarSign, color: 'orange', text: '$12,500 in revenue generated', time: '8 hours ago' },
              { icon: Star, color: 'yellow', text: '45 new reviews submitted', time: '12 hours ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center`}>
                  <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
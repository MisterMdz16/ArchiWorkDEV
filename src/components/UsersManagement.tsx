import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, MoreHorizontal, Edit3, Trash2, Eye,
  Shield, CheckCircle, XCircle, AlertCircle, Clock, Star, Award,
  Mail, Phone, MapPin, Calendar, TrendingUp, Download, Upload,
  Grid, List, ChevronDown, X, User, Building, Briefcase, Ban,
  UserCheck, UserX, Settings, Key, Lock, Unlock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, canManageUsers } from '../types/user';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  userType: 'admin' | 'designer' | 'service_requester';
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'unverified';
  status: 'active' | 'suspended' | 'inactive';
  joinDate: string;
  lastActive: string;
  location?: string;
  projectsCount: number;
  rating?: number;
  reviewCount?: number;
  totalEarnings?: number;
  specializations?: string[];
  companyName?: string;
  isOnline: boolean;
  permissions: string[];
}

const UsersManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: UserData[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        avatar: '/api/placeholder/50/50',
        userType: 'designer',
        verificationStatus: 'verified',
        status: 'active',
        joinDate: '2023-06-15',
        lastActive: '2024-01-20T10:30:00Z',
        location: 'Los Angeles, CA',
        projectsCount: 89,
        rating: 4.9,
        reviewCount: 127,
        totalEarnings: 245000,
        specializations: ['Residential', 'Sustainable Design'],
        isOnline: true,
        permissions: ['create_projects', 'manage_portfolio', 'client_communication']
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678',
        avatar: '/api/placeholder/50/50',
        userType: 'designer',
        verificationStatus: 'pending',
        status: 'active',
        joinDate: '2023-08-22',
        lastActive: '2024-01-19T16:45:00Z',
        location: 'New York, NY',
        projectsCount: 34,
        rating: 4.7,
        reviewCount: 45,
        totalEarnings: 89000,
        specializations: ['Commercial', 'Office Design'],
        isOnline: false,
        permissions: ['create_projects', 'manage_portfolio']
      },
      {
        id: '3',
        name: 'David Thompson',
        email: 'david.thompson@techcorp.com',
        phone: '+1 (555) 345-6789',
        avatar: '/api/placeholder/50/50',
        userType: 'service_requester',
        verificationStatus: 'verified',
        status: 'active',
        joinDate: '2022-03-10',
        lastActive: '2024-01-20T08:15:00Z',
        location: 'Beverly Hills, CA',
        projectsCount: 23,
        companyName: 'Thompson Development',
        isOnline: true,
        permissions: ['post_projects', 'hire_designers', 'manage_contracts']
      },
      {
        id: '4',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1 (555) 456-7890',
        avatar: '/api/placeholder/50/50',
        userType: 'designer',
        verificationStatus: 'rejected',
        status: 'suspended',
        joinDate: '2023-11-05',
        lastActive: '2024-01-15T12:20:00Z',
        location: 'Miami, FL',
        projectsCount: 12,
        rating: 4.2,
        reviewCount: 18,
        totalEarnings: 15000,
        specializations: ['Interior Design'],
        isOnline: false,
        permissions: []
      },
      {
        id: '5',
        name: 'Admin User',
        email: 'admin@architeams.com',
        avatar: '/api/placeholder/50/50',
        userType: 'admin',
        verificationStatus: 'verified',
        status: 'active',
        joinDate: '2022-01-01',
        lastActive: '2024-01-20T11:00:00Z',
        projectsCount: 0,
        isOnline: true,
        permissions: ['manage_users', 'manage_verifications', 'view_analytics', 'system_admin']
      }
    ];
    setUsers(mockUsers);
  }, []);

  const userTypes = ['all', 'admin', 'designer', 'service_requester'];
  const statuses = ['all', 'active', 'suspended', 'inactive'];
  const verificationStatuses = ['all', 'verified', 'pending', 'rejected', 'unverified'];

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Administrator';
      case 'designer': return 'Designer';
      case 'service_requester': return 'Client';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'unverified': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      case 'unverified': return <AlertCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesUserType = selectedUserType === 'all' || user.userType === selectedUserType;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesVerification = selectedVerification === 'all' || user.verificationStatus === selectedVerification;
    
    return matchesSearch && matchesUserType && matchesStatus && matchesVerification;
  });

  const handleUserAction = (action: string, userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' as const };
          case 'suspend':
            return { ...user, status: 'suspended' as const };
          case 'verify':
            return { ...user, verificationStatus: 'verified' as const };
          case 'reject':
            return { ...user, verificationStatus: 'rejected' as const };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return;
    
    setUsers(prev => prev.map(user => {
      if (selectedUsers.includes(user.id)) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' as const };
          case 'suspend':
            return { ...user, status: 'suspended' as const };
          case 'delete':
            return user; // In real app, would remove from array
          default:
            return user;
        }
      }
      return user;
    }));
    
    setSelectedUsers([]);
  };

  // Only allow access if user can manage users
  if (!canManageUsers(userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage platform users, permissions, and verification status</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Designers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.userType === 'designer' && u.verificationStatus === 'verified').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.verificationStatus === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors duration-200"
                  >
                    Suspend
                  </button>
                </div>
              )}

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-purple-50 border-purple-200 text-purple-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* User Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {userTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : getUserTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                  <select
                    value={selectedVerification}
                    onChange={(e) => setSelectedVerification(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {verificationStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Verifications' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="name">Name</option>
                    <option value="projects">Projects</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table/Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.companyName && (
                              <div className="text-xs text-gray-400">{user.companyName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.userType === 'designer' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.userType === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.userType === 'designer' && <Briefcase className="w-3 h-3 mr-1" />}
                          {user.userType === 'service_requester' && <Building className="w-3 h-3 mr-1" />}
                          {getUserTypeLabel(user.userType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                          {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationColor(user.verificationStatus)}`}>
                          {getVerificationIcon(user.verificationStatus)}
                          <span className="ml-1">{user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{user.projectsCount}</span>
                          {user.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">{user.rating}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserAction('suspend', user.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <Ban className="w-4 h-4" />
                                  <span>Suspend User</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction('activate', user.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  <span>Activate User</span>
                                </button>
                              )}
                              {user.verificationStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUserAction('verify', user.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Verify User</span>
                                  </button>
                                  <button
                                    onClick={() => handleUserAction('reject', user.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Reject Verification</span>
                                  </button>
                                </>
                              )}
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2">
                                <Key className="w-4 h-4" />
                                <span>Reset Password</span>
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                <Trash2 className="w-4 h-4" />
                                <span>Delete User</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.companyName && (
                          <p className="text-xs text-gray-500">{user.companyName}</p>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.id]);
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.userType === 'designer' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.userType === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.userType === 'designer' && <Briefcase className="w-3 h-3 mr-1" />}
                      {user.userType === 'service_requester' && <Building className="w-3 h-3 mr-1" />}
                      {getUserTypeLabel(user.userType)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'inactive' && <Clock className="w-3 h-3 mr-1" />}
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Verification:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVerificationColor(user.verificationStatus)}`}>
                        {getVerificationIcon(user.verificationStatus)}
                        <span className="ml-1">{user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-medium text-gray-900">{user.projectsCount}</span>
                    </div>
                    {user.rating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium text-gray-900">{user.rating}</span>
                          <span className="text-gray-500">({user.reviewCount})</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Active:</span>
                      <span className="text-gray-900">{new Date(user.lastActive).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 py-2.5 px-4 rounded-lg font-medium hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-100 text-gray-600 p-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedUserType !== 'all' || selectedStatus !== 'all' || selectedVerification !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users available at the moment'
              }
            </p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start space-x-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                  {selectedUser.isOnline && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedUser.name}</h3>
                  <p className="text-gray-600 mb-2">{selectedUser.email}</p>
                  {selectedUser.companyName && (
                    <p className="text-gray-500 mb-2">{selectedUser.companyName}</p>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                      selectedUser.userType === 'designer' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getUserTypeLabel(selectedUser.userType)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{selectedUser.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">Joined {new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-medium text-gray-900">{selectedUser.projectsCount}</span>
                    </div>
                    {selectedUser.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium text-gray-900">{selectedUser.rating}</span>
                          <span className="text-gray-500">({selectedUser.reviewCount})</span>
                        </div>
                      </div>
                    )}
                    {selectedUser.totalEarnings && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Earnings:</span>
                        <span className="font-medium text-gray-900">${selectedUser.totalEarnings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Verification:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(selectedUser.verificationStatus)}`}>
                        {getVerificationIcon(selectedUser.verificationStatus)}
                        <span className="ml-1">{selectedUser.verificationStatus.charAt(0).toUpperCase() + selectedUser.verificationStatus.slice(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.specializations && selectedUser.specializations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.specializations.map((spec, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions.map((permission, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      <Lock className="w-3 h-3 mr-1" />
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                  Edit User
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
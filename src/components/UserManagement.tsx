import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserService } from '../services/userService';
import { UserProfile, UserType, USER_TYPE_LABELS, isAdmin } from '../types/user';

/**
 * User Management Component - Admin Only
 * Allows admins to view, manage, and verify users
 */
function UserManagement() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<UserType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Redirect if not admin
  if (!isAdmin(userProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Load users based on selected type
  useEffect(() => {
    loadUsers();
  }, [selectedUserType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      let loadedUsers: UserProfile[] = [];
      
      if (selectedUserType === 'all') {
        // Load all user types
        const [designers, serviceRequesters, admins] = await Promise.all([
          UserService.getUsersByType('designer'),
          UserService.getUsersByType('service_requester'),
          UserService.getUsersByType('admin')
        ]);
        loadedUsers = [...designers, ...serviceRequesters, ...admins];
      } else {
        loadedUsers = await UserService.getUsersByType(selectedUserType);
      }
      
      setUsers(loadedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDesigner = async (userId: string) => {
    try {
      await UserService.updateDesignerVerificationStatus(userId, 'verified');
      await loadUsers(); // Refresh the list
      setShowDropdown(null);
    } catch (err) {
      console.error('Error verifying designer:', err);
      alert('Failed to verify designer. Please try again.');
    }
  };

  const handleUnverifyDesigner = async (userId: string) => {
    try {
      await UserService.updateDesignerVerificationStatus(userId, 'unverified');
      await loadUsers(); // Refresh the list
      setShowDropdown(null);
    } catch (err) {
      console.error('Error unverifying designer:', err);
      alert('Failed to unverify designer. Please try again.');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userTypeOptions = [
    { value: 'all' as const, label: 'All Users', count: users.length },
    { value: 'designer' as const, label: 'Designers', count: users.filter(u => u.user_type === 'designer').length },
    { value: 'service_requester' as const, label: 'Service Requesters', count: users.filter(u => u.user_type === 'service_requester').length },
    { value: 'admin' as const, label: 'Administrators', count: users.filter(u => u.user_type === 'admin').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Users className="w-8 h-8 text-purple-600" />
                <span>User Management</span>
              </h1>
              <p className="text-gray-600 mt-1">Manage platform users and designer verifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* User Type Filter */}
            <div className="flex flex-wrap gap-2">
              {userTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedUserType(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedUserType === option.value
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={loadUsers}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-sm">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.user_type === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.user_type === 'designer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {USER_TYPE_LABELS[user.user_type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                          {user.user_type === 'designer' && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.designer_verification_status === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {user.designer_verification_status === 'verified' ? (
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowDropdown(showDropdown === user.uid ? null : user.uid)}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {showDropdown === user.uid && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                <Eye className="w-4 h-4 mr-3" />
                                View Profile
                              </button>
                              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                <Edit className="w-4 h-4 mr-3" />
                                Edit User
                              </button>
                              
                              {user.user_type === 'designer' && (
                                <>
                                  {user.designer_verification_status === 'unverified' ? (
                                    <button 
                                      onClick={() => handleVerifyDesigner(user.uid)}
                                      className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                    >
                                      <UserCheck className="w-4 h-4 mr-3" />
                                      Verify Designer
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleUnverifyDesigner(user.uid)}
                                      className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 w-full text-left"
                                    >
                                      <UserX className="w-4 h-4 mr-3" />
                                      Unverify Designer
                                    </button>
                                  )}
                                </>
                              )}
                              
                              <hr className="my-1" />
                              <button className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left">
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, Clock, DollarSign, User,
  MapPin, Eye, MessageSquare, Edit3, Trash2, MoreHorizontal, Star,
  CheckCircle, AlertCircle, XCircle, Pause, Play, ArrowUpRight,
  ChevronDown, Grid, List, Tag, TrendingUp, Award, Send, Bookmark
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isServiceRequester, isDesigner } from '../types/user';

interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  location: string;
  timeline: string;
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  skills: string[];
  attachments: string[];
  proposals: number;
  views: number;
  postedDate: string;
  deadline: string;
  client: {
    name: string;
    rating: number;
    reviewCount: number;
    avatar: string;
  };
  assignedDesigner?: {
    name: string;
    avatar: string;
    rating: number;
  };
  milestones?: {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string;
    amount: number;
  }[];
}

const MyRequests: React.FC = () => {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests: ProjectRequest[] = [
      {
        id: '1',
        title: 'Modern Office Building Design',
        description: 'Looking for an experienced architect to design a 5-story modern office building with sustainable features and open workspace concepts.',
        category: 'Commercial',
        budget: { min: 50000, max: 80000, type: 'fixed' },
        location: 'Downtown LA, CA',
        timeline: '4-6 months',
        status: 'active',
        priority: 'high',
        skills: ['Commercial Architecture', 'Sustainable Design', 'AutoCAD', 'Revit'],
        attachments: ['site-plan.pdf', 'requirements.docx'],
        proposals: 12,
        views: 156,
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        client: {
          name: 'TechCorp Inc.',
          rating: 4.8,
          reviewCount: 23,
          avatar: '/api/placeholder/50/50'
        }
      },
      {
        id: '2',
        title: 'Luxury Villa Renovation',
        description: 'Complete renovation of a luxury villa including interior design, landscape architecture, and smart home integration.',
        category: 'Residential',
        budget: { min: 120, max: 180, type: 'hourly' },
        location: 'Beverly Hills, CA',
        timeline: '8-10 months',
        status: 'in_progress',
        priority: 'medium',
        skills: ['Residential Architecture', 'Interior Design', 'Luxury Design'],
        attachments: ['current-photos.zip', 'floor-plans.pdf'],
        proposals: 8,
        views: 89,
        postedDate: '2024-01-10',
        deadline: '2024-01-30',
        client: {
          name: 'Johnson Family',
          rating: 4.9,
          reviewCount: 15,
          avatar: '/api/placeholder/50/50'
        },
        assignedDesigner: {
          name: 'Sarah Johnson',
          avatar: '/api/placeholder/50/50',
          rating: 4.9
        },
        milestones: [
          { id: '1', title: 'Initial Design Concepts', status: 'completed', dueDate: '2024-02-01', amount: 15000 },
          { id: '2', title: 'Detailed Plans & Permits', status: 'in_progress', dueDate: '2024-03-15', amount: 25000 },
          { id: '3', title: 'Construction Supervision', status: 'pending', dueDate: '2024-08-30', amount: 35000 }
        ]
      },
      {
        id: '3',
        title: 'Community Center Design',
        description: 'Design a modern community center with multipurpose halls, library, and recreational facilities.',
        category: 'Public',
        budget: { min: 30000, max: 45000, type: 'fixed' },
        location: 'Austin, TX',
        timeline: '6-8 months',
        status: 'completed',
        priority: 'low',
        skills: ['Public Architecture', 'Community Design', 'Accessibility Design'],
        attachments: ['community-needs.pdf'],
        proposals: 15,
        views: 203,
        postedDate: '2023-08-20',
        deadline: '2023-09-20',
        client: {
          name: 'Austin City Council',
          rating: 4.7,
          reviewCount: 31,
          avatar: '/api/placeholder/50/50'
        },
        assignedDesigner: {
          name: 'Michael Chen',
          avatar: '/api/placeholder/50/50',
          rating: 4.8
        }
      }
    ];
    setRequests(mockRequests);
  }, []);

  const categories = ['all', 'Residential', 'Commercial', 'Public', 'Industrial', 'Hospitality'];
  const statuses = ['all', 'draft', 'active', 'in_progress', 'completed', 'cancelled'];
  const priorities = ['all', 'low', 'medium', 'high', 'urgent'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-3 h-3" />;
      case 'active': return <Play className="w-3 h-3" />;
      case 'in_progress': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isServiceRequester(userProfile) ? 'My Project Requests' : 'Available Projects'}
                </h1>
                <p className="text-gray-600">
                  {isServiceRequester(userProfile) 
                    ? 'Manage your project requests and track progress'
                    : 'Browse and apply to available project opportunities'
                  }
                </p>
              </div>
            </div>
            
            {isServiceRequester(userProfile) && (
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>New Request</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-green-50 border-green-200 text-green-700' 
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
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow-sm' 
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
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="deadline">Deadline</option>
                    <option value="budget">Budget</option>
                    <option value="proposals">Most Proposals</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requests Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
                {/* Request Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200 line-clamp-2">
                        {request.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{request.description}</p>
                    </div>
                    {isServiceRequester(userProfile) && (
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Status and Priority */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                  </div>

                  {/* Budget and Timeline */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-bold text-gray-900">
                        {request.budget.type === 'fixed' 
                          ? `$${request.budget.min.toLocaleString()}-${request.budget.max.toLocaleString()}`
                          : `$${request.budget.min}-${request.budget.max}/hr`
                        }
                      </div>
                      <div className="text-xs text-gray-600">Budget</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-bold text-gray-900">{request.timeline}</div>
                      <div className="text-xs text-gray-600">Timeline</div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Posted {new Date(request.postedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{request.proposals} proposals • {request.views} views</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                        <Tag className="w-3 h-3 mr-1" />
                        {skill}
                      </span>
                    ))}
                    {request.skills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        +{request.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Assigned Designer (if in progress) */}
                  {request.assignedDesigner && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">{request.assignedDesigner.name}</p>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs text-blue-700">{request.assignedDesigner.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 py-2.5 px-4 rounded-lg font-medium hover:from-green-100 hover:to-emerald-100 transition-all duration-200 flex items-center justify-center space-x-2 group">
                    <span>View Details</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start space-x-6">
                  {/* Request Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {request.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(request.postedDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {request.timeline}
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {request.proposals} proposals
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {request.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                              {skill}
                            </span>
                          ))}
                          {request.skills.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{request.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status, Budget and Actions */}
                      <div className="flex items-start space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {request.budget.type === 'fixed' 
                              ? `$${request.budget.min.toLocaleString()}-${request.budget.max.toLocaleString()}`
                              : `$${request.budget.min}-${request.budget.max}/hr`
                            }
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}</span>
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!isServiceRequester(userProfile) && (
                            <button className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                              <Bookmark className="w-5 h-5" />
                            </button>
                          )}
                          <button className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-lg font-medium hover:from-green-100 hover:to-emerald-100 transition-all duration-200 flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          {isServiceRequester(userProfile) ? (
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          ) : (
                            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2">
                              <Send className="w-4 h-4" />
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones (for in-progress projects) */}
              {request.milestones && request.status === 'in_progress' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Project Milestones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {request.milestones.map((milestone) => (
                      <div key={milestone.id} className={`p-3 rounded-lg border-2 ${
                        milestone.status === 'completed' ? 'bg-green-50 border-green-200' :
                        milestone.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                          {milestone.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {milestone.status === 'in_progress' && <Clock className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="text-xs text-gray-600">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          ${milestone.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedPriority !== 'all'
              ? 'Try adjusting your search or filters'
              : isServiceRequester(userProfile)
                ? 'Create your first project request to get started'
                : 'No project requests available at the moment'
            }
          </p>
          {isServiceRequester(userProfile) && (
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto">
              <Plus className="w-5 h-5" />
              <span>Create New Request</span>
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default MyRequests;
                  
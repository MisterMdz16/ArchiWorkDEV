import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, MapPin, Star, Award, Eye, Heart, MessageSquare,
  Phone, Mail, Globe, Calendar, Briefcase, ChevronDown, Grid, List,
  ArrowUpRight, Clock, CheckCircle, Plus, X, Send, Bookmark,
  TrendingUp, Target, Zap, Building, User, Image
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isDesigner, isServiceRequester, isVerifiedDesigner } from '../types/user';

interface Designer {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  location: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  experience: string;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  profileImage: string;
  portfolio: string[];
  skills: string[];
  description: string;
  responseTime: string;
  completionRate: number;
  isVerified: boolean;
  isFeatured: boolean;
  lastActive: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  location: string;
  projectsPosted: number;
  totalBudget: number;
  rating: number;
  reviewCount: number;
  memberSince: string;
  activeProjects: number;
  completedProjects: number;
  profileImage: string;
  description: string;
  preferredBudget: string;
  projectTypes: string[];
}

const ClientsDesigners: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'designers' | 'clients'>('designers');
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  // Mock data for designers
  useEffect(() => {
    const mockDesigners: Designer[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Senior Architect',
        specialization: ['Residential', 'Sustainable Design'],
        location: 'Los Angeles, CA',
        rating: 4.9,
        reviewCount: 127,
        projectCount: 89,
        experience: '8+ years',
        hourlyRate: 150,
        availability: 'available',
        profileImage: '/api/placeholder/100/100',
        portfolio: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
        skills: ['AutoCAD', 'Revit', 'SketchUp', 'Sustainable Design'],
        description: 'Passionate architect specializing in sustainable residential design with 8+ years of experience.',
        responseTime: '< 2 hours',
        completionRate: 98,
        isVerified: true,
        isFeatured: true,
        lastActive: '2 hours ago'
      },
      {
        id: '2',
        name: 'Michael Chen',
        title: 'Commercial Designer',
        specialization: ['Commercial', 'Office Design'],
        location: 'New York, NY',
        rating: 4.8,
        reviewCount: 94,
        projectCount: 67,
        experience: '6+ years',
        hourlyRate: 120,
        availability: 'busy',
        profileImage: '/api/placeholder/100/100',
        portfolio: ['/api/placeholder/300/200'],
        skills: ['3ds Max', 'V-Ray', 'Photoshop', 'Commercial Design'],
        description: 'Expert in commercial and office space design with focus on modern workplace solutions.',
        responseTime: '< 4 hours',
        completionRate: 95,
        isVerified: true,
        isFeatured: false,
        lastActive: '1 day ago'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        title: 'Interior Architect',
        specialization: ['Interior Design', 'Hospitality'],
        location: 'Miami, FL',
        rating: 4.7,
        reviewCount: 156,
        projectCount: 112,
        experience: '10+ years',
        hourlyRate: 180,
        availability: 'available',
        profileImage: '/api/placeholder/100/100',
        portfolio: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
        skills: ['Interior Design', 'Hospitality Design', 'Luxury Spaces'],
        description: 'Luxury interior architect with extensive experience in hospitality and high-end residential projects.',
        responseTime: '< 1 hour',
        completionRate: 99,
        isVerified: true,
        isFeatured: true,
        lastActive: '30 minutes ago'
      }
    ];

    const mockClients: Client[] = [
      {
        id: '1',
        name: 'David Thompson',
        company: 'Thompson Development',
        location: 'Beverly Hills, CA',
        projectsPosted: 23,
        totalBudget: 2500000,
        rating: 4.8,
        reviewCount: 45,
        memberSince: '2022-01-15',
        activeProjects: 3,
        completedProjects: 20,
        profileImage: '/api/placeholder/100/100',
        description: 'Real estate developer focused on luxury residential and commercial properties.',
        preferredBudget: '$100K - $500K',
        projectTypes: ['Residential', 'Commercial', 'Luxury']
      },
      {
        id: '2',
        name: 'Lisa Park',
        company: 'Park Hospitality Group',
        location: 'Las Vegas, NV',
        projectsPosted: 18,
        totalBudget: 1800000,
        rating: 4.9,
        reviewCount: 32,
        memberSince: '2021-08-20',
        activeProjects: 2,
        completedProjects: 16,
        profileImage: '/api/placeholder/100/100',
        description: 'Hospitality industry leader specializing in hotel and restaurant design projects.',
        preferredBudget: '$200K - $1M',
        projectTypes: ['Hospitality', 'Restaurant', 'Hotel']
      }
    ];

    setDesigners(mockDesigners);
    setClients(mockClients);
  }, []);

  const specializations = ['all', 'Residential', 'Commercial', 'Interior Design', 'Sustainable Design', 'Hospitality', 'Industrial'];
  const locations = ['all', 'Los Angeles, CA', 'New York, NY', 'Miami, FL', 'Chicago, IL', 'San Francisco, CA'];
  const availabilities = ['all', 'available', 'busy', 'unavailable'];
  const priceRanges = ['all', '0-100', '100-200', '200-300', '300+'];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="w-3 h-3" />;
      case 'busy': return <Clock className="w-3 h-3" />;
      case 'unavailable': return <X className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredDesigners = designers.filter(designer => {
    const matchesSearch = designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         designer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         designer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = selectedSpecialization === 'all' || designer.specialization.includes(selectedSpecialization);
    const matchesLocation = selectedLocation === 'all' || designer.location === selectedLocation;
    const matchesAvailability = selectedAvailability === 'all' || designer.availability === selectedAvailability;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === '0-100' && designer.hourlyRate <= 100) ||
      (priceRange === '100-200' && designer.hourlyRate > 100 && designer.hourlyRate <= 200) ||
      (priceRange === '200-300' && designer.hourlyRate > 200 && designer.hourlyRate <= 300) ||
      (priceRange === '300+' && designer.hourlyRate > 300);
    
    return matchesSearch && matchesSpecialization && matchesLocation && matchesAvailability && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isDesigner(userProfile) ? 'Find Clients' : 'Find Designers'}
                </h1>
                <p className="text-gray-600">
                  {isDesigner(userProfile) 
                    ? 'Connect with clients looking for architectural services'
                    : 'Discover talented architects and designers for your projects'
                  }
                </p>
              </div>
            </div>
            
            {isServiceRequester(userProfile) && (
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Post Project</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('designers')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'designers'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Designers</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'clients'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Clients</span>
            </div>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
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
          {showFilters && activeTab === 'designers' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Specialization Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>
                        {spec === 'all' ? 'All Specializations' : spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location === 'all' ? 'All Locations' : location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {availabilities.map(availability => (
                      <option key={availability} value={availability}>
                        {availability === 'all' ? 'All Availability' : availability.charAt(0).toUpperCase() + availability.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {priceRanges.map(range => (
                      <option key={range} value={range}>
                        {range === 'all' ? 'All Rates' : range === '300+' ? '$300+/hr' : `$${range}/hr`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'designers' ? (
          /* Designers Grid/List */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDesigners.map((designer) => (
                <div key={designer.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
                  {/* Designer Header */}
                  <div className="relative p-6 pb-4">
                    {designer.isFeatured && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                        {designer.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                          {designer.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{designer.title}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(designer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {designer.rating} ({designer.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Designer Info */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(designer.availability)}`}>
                        {getAvailabilityIcon(designer.availability)}
                        <span className="ml-1">{designer.availability.charAt(0).toUpperCase() + designer.availability.slice(1)}</span>
                      </span>
                      <span className="text-lg font-bold text-gray-900">${designer.hourlyRate}/hr</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{designer.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{designer.projectCount} projects completed</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Responds in {designer.responseTime}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{designer.description}</p>

                    {/* Specializations */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {designer.specialization.slice(0, 2).map((spec, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                          {spec}
                        </span>
                      ))}
                      {designer.specialization.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          +{designer.specialization.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 py-2.5 px-4 rounded-lg font-medium hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View for Designers */
            <div className="space-y-4">
              {filteredDesigners.map((designer) => (
                <div key={designer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-6">
                    {/* Designer Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                      {designer.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Designer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{designer.name}</h3>
                            {designer.isFeatured && (
                              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{designer.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {designer.location}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {designer.projectCount} projects
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {designer.responseTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(designer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {designer.rating} ({designer.reviewCount} reviews)
                            </span>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">${designer.hourlyRate}/hr</span>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(designer.availability)}`}>
                                {getAvailabilityIcon(designer.availability)}
                                <span className="ml-1">{designer.availability.charAt(0).toUpperCase() + designer.availability.slice(1)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-purple-500 transition-colors duration-200">
                              <Bookmark className="w-5 h-5" />
                            </button>
                            <button className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-4 py-2 rounded-lg font-medium hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center space-x-2">
                              <Eye className="w-4 h-4" />
                              <span>View Profile</span>
                            </button>
                            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>Contact</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Clients View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
                {/* Client Header */}
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{client.company}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(client.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {client.rating} ({client.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Client Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{client.projectsPosted}</div>
                      <div className="text-xs text-gray-600">Projects Posted</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{client.activeProjects}</div>
                      <div className="text-xs text-gray-600">Active Projects</div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{client.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Member since {new Date(client.memberSince).getFullYear()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span>{client.preferredBudget} budget range</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{client.description}</p>

                  {/* Project Types */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {client.projectTypes.slice(0, 2).map((type, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {type}
                      </span>
                    ))}
                    {client.projectTypes.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        +{client.projectTypes.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 py-2.5 px-4 rounded-lg font-medium hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'designers' && filteredDesigners.length === 0) ||
          (activeTab === 'clients' && clients.length === 0)) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || (activeTab === 'designers' && (selectedSpecialization !== 'all' || selectedLocation !== 'all' || selectedAvailability !== 'all' || priceRange !== 'all'))
                ? 'Try adjusting your search or filters'
                : `No ${activeTab} available at the moment`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsDesigners;
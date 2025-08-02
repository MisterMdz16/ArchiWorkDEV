import React, { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft, Upload, X, Plus, Calendar, Users, FileText, Tag,
  CheckCircle, AlertCircle, Clock, Image as ImageIcon, Trash2,
  Save, Send, Eye, Star, Award, Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isVerifiedDesigner } from '../types/user';
import { ProjectService, CreateProjectData } from '../services/projectService';

interface ProjectFormData {
  title: string;
  deliveryTimeline: string;
  deliverables: string;
  meetingsCount: number;
  revisionsCount: number;
  customTags: string[];
  primaryImage: File | null;
  additionalImages: File[];
  description: string;
  price: number;
  category: string;
}

interface CreateNewProjectProps {
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

const CreateNewProject: React.FC<CreateNewProjectProps> = ({ onClose, onProjectCreated }) => {
  const { user, userProfile } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    deliveryTimeline: '',
    deliverables: '',
    meetingsCount: 1,
    revisionsCount: 2,
    customTags: [],
    primaryImage: null,
    additionalImages: [],
    description: '',
    price: 0,
    category: ''
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string>('');

  // Refs
  const primaryImageRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);

  // Categories for projects
  const categories = [
    'Residential Architecture',
    'Commercial Architecture', 
    'Interior Design',
    'Landscape Architecture',
    'Urban Planning',
    'Sustainable Design',
    'Historic Restoration',
    'Industrial Design'
  ];

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a project category';
    }

    if (!formData.deliveryTimeline) {
      newErrors.deliveryTimeline = 'Please specify delivery timeline';
    }

    if (!formData.deliverables.trim()) {
      newErrors.deliverables = 'Please describe the deliverables';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Please set an appropriate price';
    }

    if (!formData.primaryImage) {
      newErrors.primaryImage = 'Primary image is required';
    }

    if (formData.customTags.length === 0) {
      newErrors.customTags = 'Please add at least one tag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle primary image upload
  const handlePrimaryImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, primaryImage: 'File size must be less than 10MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPrimaryImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({ ...prev, primaryImage: file }));
    setErrors(prev => ({ ...prev, primaryImage: '' }));
  };

  // Handle additional images upload
  const handleAdditionalImagesUpload = (files: FileList) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      if (file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === validFiles.length) {
            setPreviewImages(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setFormData(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...validFiles]
    }));
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = e.dataTransfer.files;
      if (files.length === 1) {
        handlePrimaryImageUpload(files[0]);
      } else {
        handleAdditionalImagesUpload(files);
      }
    }
  }, []);

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.customTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        customTags: [...prev.customTags, newTag.trim()]
      }));
      setNewTag('');
      setErrors(prev => ({ ...prev, customTags: '' }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      customTags: prev.customTags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.uid) {
      setErrors({ submit: 'You must be logged in to create a project.' });
      return;
    }

    if (!formData.primaryImage) {
      setErrors({ primaryImage: 'Primary image is required' });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Creating project with ProjectService...');
      
      // Prepare project data for the service
      const projectData: CreateProjectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        deliveryTimeline: formData.deliveryTimeline,
        deliverables: formData.deliverables,
        meetingsCount: formData.meetingsCount,
        revisionsCount: formData.revisionsCount,
        customTags: formData.customTags,
        primaryImage: formData.primaryImage,
        additionalImages: formData.additionalImages
      };
      
      // Create project using ProjectService
      const createdProject = await ProjectService.createProject(projectData, user.uid);
      
      console.log('✅ Project created successfully:', createdProject);
      
      // Call success callback
      if (onProjectCreated) {
        onProjectCreated(createdProject);
      }

      // Close modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error creating project:', error);
      setErrors({
        submit: error instanceof Error
          ? `Error creating project: ${error.message}`
          : 'An error occurred while creating the project. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200 px-6 py-4 rounded-t-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Create New Project
                </h1>
                <p className="text-gray-600 mt-1">Create a new project and start attracting clients</p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center space-x-3">
              {isVerifiedDesigner(userProfile) ? (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified Designer</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Pending Verification</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            {[
              { step: 1, label: 'Basic Information' },
              { step: 2, label: 'Images & Media' },
              { step: 3, label: 'Details & Pricing' },
              { step: 4, label: 'Review & Publish' }
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
                <span className="text-xs text-gray-600 ml-2 hidden sm:inline">{label}</span>
                {step < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter an attractive title for your project"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select project category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Write a detailed description of your project and what makes it unique"
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Images and Media */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Images & Media
                </h2>

                {/* Primary Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Image *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-purple-500 bg-purple-50' 
                        : primaryImagePreview
                        ? 'border-green-500 bg-green-50'
                        : errors.primaryImage
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={primaryImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handlePrimaryImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                    
                    {primaryImagePreview ? (
                      <div className="relative">
                        <img
                          src={primaryImagePreview}
                          alt="Primary preview"
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPrimaryImagePreview('');
                            setFormData(prev => ({ ...prev, primaryImage: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => primaryImageRef.current?.click()}>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Drag image here or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.primaryImage && <p className="text-red-500 text-sm mt-1">{errors.primaryImage}</p>}
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                    <input
                      ref={additionalImagesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => e.target.files && handleAdditionalImagesUpload(e.target.files)}
                      className="hidden"
                    />
                    <div className="cursor-pointer" onClick={() => additionalImagesRef.current?.click()}>
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Add additional images</p>
                    </div>
                  </div>

                  {/* Additional Images Preview */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details and Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-600" />
                  Details & Scheduling
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Timeline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Timeline *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="deliveryTimeline"
                        value={formData.deliveryTimeline}
                        onChange={handleInputChange}
                        placeholder="Example: 7 days, 2 weeks, 1 month"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                          errors.deliveryTimeline ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.deliveryTimeline && <p className="text-red-500 text-sm mt-1">{errors.deliveryTimeline}</p>}
                  </div>

                  {/* Meetings Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Meetings
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="meetingsCount"
                        value={formData.meetingsCount}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Revisions Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Revisions Allowed
                    </label>
                    <input
                      type="number"
                      name="revisionsCount"
                      value={formData.revisionsCount}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Deliverables */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deliverables *
                    </label>
                    <textarea
                      name="deliverables"
                      value={formData.deliverables}
                      onChange={handleInputChange}
                      placeholder="List all files and outputs you will provide to the client"
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.deliverables ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.deliverables && <p className="text-red-500 text-sm mt-1">{errors.deliverables}</p>}
                  </div>

                  {/* Custom Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Tags *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.customTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a new tag"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                    {errors.customTags && <p className="text-red-500 text-sm mt-1">{errors.customTags}</p>}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review and Submit */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-amber-600" />
                  Project Review
                </h2>

                {/* Project Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Title:</span> {formData.title || 'Not specified'}</div>
                      <div><span className="font-medium">Category:</span> {formData.category || 'Not specified'}</div>
                      <div><span className="font-medium">Price:</span> ${formData.price || 0}</div>
                    </div>
                  </div>

                  {/* Timeline Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-green-600" />
                      Scheduling & Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Delivery Timeline:</span> {formData.deliveryTimeline || 'Not specified'}</div>
                      <div><span className="font-medium">Meetings:</span> {formData.meetingsCount}</div>
                      <div><span className="font-medium">Revisions:</span> {formData.revisionsCount}</div>
                    </div>
                  </div>

                  {/* Images Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2 text-purple-600" />
                      Images
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Primary Image:</span> {formData.primaryImage ? '✓ Uploaded' : '✗ Not uploaded'}</div>
                      <div><span className="font-medium">Additional Images:</span> {formData.additionalImages.length} image(s)</div>
                    </div>
                  </div>

                  {/* Tags Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {formData.customTags.length > 0 ? (
                        formData.customTags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No tags</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Project Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {formData.description || 'No description'}
                  </p>
                </div>

                {/* Deliverables Preview */}
                <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Deliverables</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {formData.deliverables || 'No details'}
                  </p>
                </div>

                {/* Error Display */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>

              {/* Final Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ready to Publish?</h3>
                    <p className="text-sm text-gray-600">Make sure all information is correct before publishing</p>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">All fields completed</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Publish Project</span>
                        <Star className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Secure Publishing</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Instant Visibility</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Attract Clients</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateNewProject;
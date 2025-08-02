/**
 * Verification Management Component
 *
 * A comprehensive admin panel for managing user verification requests with:
 * - Professional table/card layout with sorting and pagination
 * - Advanced search and filtering capabilities
 * - Approval/rejection workflows with templates
 * - Real-time updates and communication system
 * - Accessibility compliance (WCAG 2.1)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Filter, Download, RefreshCw, Eye, CheckCircle, XCircle,
  AlertTriangle, MessageSquare, User, Calendar, Clock, Shield,
  ChevronDown, ChevronUp, MoreHorizontal, Mail, Phone, MapPin,
  FileText, Image, Award, Briefcase, Globe, Star, AlertCircle,
  Users, TrendingUp, BarChart3, Settings, Send, Edit, Trash2,
  ArrowUpDown, ArrowUp, ArrowDown, Plus, X, Check
} from 'lucide-react';

import {
  VerificationProcess,
  VerificationProcessResponse,
  FilterOptions,
  SortOptions,
  PaginationOptions,
  VerificationManagementState,
  VerificationStatus,
  VerificationPriority,
  UserType,
  RiskLevel,
  MessageTemplate,
  RejectionReason,
  ApprovalRequest,
  RejectionRequest,
  MoreInfoRequest,
  VerificationTableColumn,
  DEFAULT_PAGE_SIZE
} from '../types/verification-management';

import VerificationManagementService from '../services/verificationManagementService';
import MoreInfoModal from './MoreInfoModal';

// ===== UTILITY COMPONENTS =====

const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case VerificationStatus.APPROVED:
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' };
      case VerificationStatus.REJECTED:
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' };
      case VerificationStatus.REQUIRES_MORE_INFO:
        return { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle, label: 'More Info Required' };
      case VerificationStatus.RESUBMITTED:
        return { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, label: 'Resubmitted' };
      case VerificationStatus.UNDER_REVIEW:
        return { color: 'bg-orange-100 text-orange-800', icon: Eye, label: 'Under Review' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: VerificationPriority }> = ({ priority }) => {
  const getPriorityConfig = (priority: VerificationPriority) => {
    switch (priority) {
      case VerificationPriority.LOW:
        return { color: 'bg-gray-100 text-gray-800', label: 'Low' };
      case VerificationPriority.MEDIUM:
        return { color: 'bg-blue-100 text-blue-800', label: 'Medium' };
      case VerificationPriority.HIGH:
        return { color: 'bg-orange-100 text-orange-800', label: 'High' };
      case VerificationPriority.URGENT:
        return { color: 'bg-red-100 text-red-800', label: 'Urgent' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const RiskIndicator: React.FC<{ level: RiskLevel; score: number }> = ({ level, score }) => {
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Low Risk' };
      case RiskLevel.MEDIUM:
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Medium Risk' };
      case RiskLevel.HIGH:
        return { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'High Risk' };
      case RiskLevel.CRITICAL:
        return { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Critical Risk' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Unknown' };
    }
  };

  const config = getRiskConfig(level);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${config.bgColor}`}>
        <div 
          className={`w-full h-full rounded-full ${config.color.replace('text-', 'bg-')}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label} ({score})
      </span>
    </div>
  );
};

// ===== MODAL COMPONENTS =====

const ApprovalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  process: VerificationProcess | null;
  onApprove: (request: ApprovalRequest) => Promise<void>;
  templates: MessageTemplate[];
}> = ({ isOpen, onClose, process, onApprove, templates }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process) return;

    setIsSubmitting(true);
    try {
      await onApprove({
        processId: process.id,
        reviewNotes,
        customMessage: customMessage || templates.find(t => t.id === selectedTemplate)?.content,
        notifyUser,
      });
      onClose();
    } catch (error) {
      console.error('Failed to approve verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !process) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              Approve Verification Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Information Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{process.request.fullName}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{process.request.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Specialization:</span>
                <span className="ml-2 font-medium">{process.request.specialization}</span>
              </div>
              <div>
                <span className="text-gray-500">Experience:</span>
                <span className="ml-2 font-medium">{process.request.experienceYears}</span>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes (Internal)
            </label>
            <textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add internal notes about this approval..."
            />
          </div>

          {/* Message Template Selection */}
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              Notification Template
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a template...</option>
              {templates.filter(t => t.type === 'approval').map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Message */}
          <div>
            <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message to User
            </label>
            <textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter a custom message or leave blank to use the selected template..."
            />
          </div>

          {/* Notification Options */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyUser"
              checked={notifyUser}
              onChange={(e) => setNotifyUser(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="notifyUser" className="ml-2 text-sm text-gray-700">
              Send notification to user
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RejectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  process: VerificationProcess | null;
  onReject: (request: RejectionRequest) => Promise<void>;
  rejectionReasons: RejectionReason[];
  templates: MessageTemplate[];
}> = ({ isOpen, onClose, process, onReject, rejectionReasons, templates }) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [requiresResubmission, setRequiresResubmission] = useState(true);
  const [notifyUser, setNotifyUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId) 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process || selectedReasons.length === 0) return;

    setIsSubmitting(true);
    try {
      await onReject({
        processId: process.id,
        reasonIds: selectedReasons,
        customReason,
        reviewNotes,
        customMessage: customMessage || templates.find(t => t.id === selectedTemplate)?.content,
        requiresResubmission,
        notifyUser,
      });
      onClose();
    } catch (error) {
      console.error('Failed to reject verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !process) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <XCircle className="w-6 h-6 mr-2 text-red-600" />
              Reject Verification Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Information Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{process.request.fullName}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{process.request.email}</span>
              </div>
            </div>
          </div>

          {/* Rejection Reasons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rejection Reasons *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejectionReasons.map(reason => (
                <label key={reason.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason.id)}
                    onChange={() => handleReasonToggle(reason.id)}
                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{reason.reason}</div>
                    <div className="text-xs text-gray-500">{reason.category}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              id="customReason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Provide additional details about the rejection..."
            />
          </div>

          {/* Review Notes */}
          <div>
            <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes (Internal)
            </label>
            <textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Add internal notes about this rejection..."
            />
          </div>

          {/* Message Template */}
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              Notification Template
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a template...</option>
              {templates.filter(t => t.type === 'rejection').map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Message */}
          <div>
            <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message to User
            </label>
            <textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter a custom message or leave blank to use the selected template..."
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresResubmission"
                checked={requiresResubmission}
                onChange={(e) => setRequiresResubmission(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="requiresResubmission" className="ml-2 text-sm text-gray-700">
                Allow user to resubmit after addressing issues
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyUser"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="notifyUser" className="ml-2 text-sm text-gray-700">
                Send notification to user
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedReasons.length === 0}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

const VerificationManagement: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [state, setState] = useState<VerificationManagementState>({
    processes: [],
    selectedProcesses: [],
    loading: true,
    error: null,
    filters: {},
    sort: { field: 'createdAt', direction: 'desc' },
    pagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
    showApprovalModal: false,
    showRejectionModal: false,
    showMoreInfoModal: false,
    showMessageModal: false,
    currentProcess: null,
    actionInProgress: false,
  });

  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ===== DATA FETCHING =====
  const fetchProcesses = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await VerificationManagementService.getVerificationProcesses(
        { ...state.filters, searchQuery },
        state.sort,
        state.pagination
      );

      if (response.success) {
        setState(prev => ({
          ...prev,
          processes: response.data.processes,
          pagination: { ...prev.pagination, total: response.data.pagination.total },
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to fetch verification processes',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred',
        loading: false,
      }));
    }
  }, [state.filters, state.sort, state.pagination.page, state.pagination.pageSize, searchQuery]);

  const fetchRejectionReasons = useCallback(async () => {
    try {
      const response = await VerificationManagementService.getRejectionReasons();
      if (response.success) {
        setRejectionReasons(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch rejection reasons:', error);
    }
  }, []);

  const fetchMessageTemplates = useCallback(async () => {
    try {
      const response = await VerificationManagementService.getMessageTemplates();
      if (response.success) {
        setMessageTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch message templates:', error);
    }
  }, []);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  useEffect(() => {
    fetchRejectionReasons();
    fetchMessageTemplates();
  }, [fetchRejectionReasons, fetchMessageTemplates]);

  // Real-time updates subscription
  useEffect(() => {
    const unsubscribe = VerificationManagementService.subscribeToUpdates((update) => {
      if (update.type === 'process_updated') {
        setState(prev => ({
          ...prev,
          processes: prev.processes.map(process =>
            process.id === update.data.id ? { ...process, ...update.data } : process
          ),
        }));
      }
    });

    return unsubscribe;
  }, []);

  // ===== ACTION HANDLERS =====
  const handleApprove = async (request: ApprovalRequest) => {
    setState(prev => ({ ...prev, actionInProgress: true }));
    
    try {
      const response = await VerificationManagementService.approveVerification(request);
      if (response.success) {
        await fetchProcesses(); // Refresh data
        setState(prev => ({ 
          ...prev, 
          showApprovalModal: false, 
          currentProcess: null,
          actionInProgress: false 
        }));
      }
    } catch (error) {
      console.error('Failed to approve verification:', error);
      setState(prev => ({ ...prev, actionInProgress: false }));
    }
  };

  const handleReject = async (request: RejectionRequest) => {
    setState(prev => ({ ...prev, actionInProgress: true }));
    
    try {
      const response = await VerificationManagementService.rejectVerification(request);
      if (response.success) {
        await fetchProcesses(); // Refresh data
        setState(prev => ({ 
          ...prev, 
          showRejectionModal: false, 
          currentProcess: null,
          actionInProgress: false 
        }));
      }
    } catch (error) {
      console.error('Failed to reject verification:', error);
      setState(prev => ({ ...prev, actionInProgress: false }));
    }
  };

  const handleRequestMoreInfo = async (request: MoreInfoRequest) => {
    setState(prev => ({ ...prev, actionInProgress: true }));
    
    try {
      const response = await VerificationManagementService.requestMoreInfo(request);
      if (response.success) {
        await fetchProcesses(); // Refresh data
        setState(prev => ({ 
          ...prev, 
          showMoreInfoModal: false, 
          currentProcess: null,
          actionInProgress: false 
        }));
      }
    } catch (error) {
      console.error('Failed to request more info:', error);
      setState(prev => ({ ...prev, actionInProgress: false }));
    }
  };

  // ===== TABLE CONFIGURATION =====
  const columns: VerificationTableColumn[] = useMemo(() => [
    {
      key: 'request.fullName',
      label: 'User',
      sortable: true,
      width: '200px',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.request.fullName}</div>
            <div className="text-sm text-gray-500">{record.request.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'userType',
      label: 'Type',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '150px',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      width: '100px',
      render: (value) => <PriorityBadge priority={value} />,
    },
    {
      key: 'riskAssessment',
      label: 'Risk',
      sortable: false,
      width: '150px',
      render: (value) => <RiskIndicator level={value.level} score={value.score} />,
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      sortable: true,
      width: '120px',
      render: (value) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: '200px',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setState(prev => ({
              ...prev,
              currentProcess: record,
              showApprovalModal: true
            }))}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
            disabled={record.status === VerificationStatus.APPROVED}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approve
          </button>
          <button
            onClick={() => setState(prev => ({
              ...prev,
              currentProcess: record,
              showRejectionModal: true
            }))}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
            disabled={record.status === VerificationStatus.REJECTED}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Reject
          </button>
          <button
            onClick={() => setState(prev => ({
              ...prev,
              currentProcess: record,
              showMoreInfoModal: true
            }))}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            More Info
          </button>
        </div>
      ),
    },
  ], []);

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Verification Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchProcesses}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="requires_more_info">More Info Required</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* User Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Types</option>
                    <option value="designer">Designer</option>
                    <option value="service_requester">Service Requester</option>
                  </select>
                </div>

                {/* Risk Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Risk Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Verification Requests ({state.pagination.total})
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing {((state.pagination.page - 1) * state.pagination.pageSize) + 1} to{' '}
                  {Math.min(state.pagination.page * state.pagination.pageSize, state.pagination.total)} of{' '}
                  {state.pagination.total} results
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {state.loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-lg text-gray-600">Loading verification requests...</span>
            </div>
          )}

          {/* Error State */}
          {state.error && (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="ml-3 text-lg text-red-600">{state.error}</span>
            </div>
          )}

          {/* Table Content */}
          {!state.loading && !state.error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: column.width }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {column.sortable && (
                            <button className="text-gray-400 hover:text-gray-600">
                              <ArrowUpDown className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.processes.map((process) => (
                    <tr key={process.id} className="hover:bg-gray-50">
                      {columns.map((column) => {
                        const getValue = (key: string, obj: any): any => {
                          if (key.includes('.')) {
                            return key.split('.').reduce((current, prop) => current?.[prop], obj);
                          }
                          return obj[key];
                        };

                        const value = getValue(column.key, process);
                        
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            {column.render ? column.render(value, process) : String(value || '')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!state.loading && !state.error && state.processes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No verification requests found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}

          {/* Pagination */}
          {!state.loading && !state.error && state.processes.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={state.pagination.pageSize}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      pagination: { ...prev.pagination, pageSize: parseInt(e.target.value), page: 1 }
                    }))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      pagination: { ...prev.pagination, page: Math.max(1, prev.pagination.page - 1) }
                    }))}
                    disabled={state.pagination.page === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {state.pagination.page} of {Math.ceil(state.pagination.total / state.pagination.pageSize)}
                  </span>
                  
                  <button
                    onClick={() => setState(prev => ({
                      ...prev,
                      pagination: {
                        ...prev.pagination,
                        page: Math.min(
                          Math.ceil(prev.pagination.total / prev.pagination.pageSize),
                          prev.pagination.page + 1
                        )
                      }
                    }))}
                    disabled={state.pagination.page >= Math.ceil(state.pagination.total / state.pagination.pageSize)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal
        isOpen={state.showApprovalModal}
        onClose={() => setState(prev => ({ ...prev, showApprovalModal: false, currentProcess: null }))}
        process={state.currentProcess}
        onApprove={handleApprove}
        templates={messageTemplates}
      />

      <RejectionModal
        isOpen={state.showRejectionModal}
        onClose={() => setState(prev => ({ ...prev, showRejectionModal: false, currentProcess: null }))}
        process={state.currentProcess}
        onReject={handleReject}
        rejectionReasons={rejectionReasons}
        templates={messageTemplates}
      />

      <MoreInfoModal
        isOpen={state.showMoreInfoModal}
        onClose={() => setState(prev => ({ ...prev, showMoreInfoModal: false, currentProcess: null }))}
        process={state.currentProcess}
        onRequestMoreInfo={handleRequestMoreInfo}
        templates={messageTemplates}
      />
    </div>
  );
};

export default VerificationManagement;
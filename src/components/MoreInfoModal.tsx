/**
 * More Info Request Modal Component
 * 
 * Allows administrators to request additional information from users
 * with specific field requirements and custom messaging.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, Send, RefreshCw, Calendar } from 'lucide-react';
import { VerificationProcess, MoreInfoRequest, MessageTemplate } from '../types/verification-management';

interface MoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: VerificationProcess | null;
  onRequestMoreInfo: (request: MoreInfoRequest) => Promise<void>;
  templates: MessageTemplate[];
}

const MoreInfoModal: React.FC<MoreInfoModalProps> = ({
  isOpen,
  onClose,
  process,
  onRequestMoreInfo,
  templates
}) => {
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available fields that can be requested
  const availableFields = [
    { id: 'national_id', label: 'National ID / Passport', category: 'Identity' },
    { id: 'address_proof', label: 'Address Verification', category: 'Identity' },
    { id: 'portfolio_samples', label: 'Additional Portfolio Samples', category: 'Professional' },
    { id: 'certifications', label: 'Professional Certifications', category: 'Professional' },
    { id: 'education_transcripts', label: 'Education Transcripts', category: 'Professional' },
    { id: 'work_experience', label: 'Work Experience Details', category: 'Professional' },
    { id: 'references', label: 'Professional References', category: 'Professional' },
    { id: 'project_details', label: 'Detailed Project Information', category: 'Portfolio' },
    { id: 'software_proof', label: 'Software Proficiency Evidence', category: 'Technical' },
    { id: 'license_verification', label: 'Professional License Verification', category: 'Legal' },
  ];

  const handleFieldToggle = (fieldId: string) => {
    setRequiredFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process || requiredFields.length === 0) return;

    setIsSubmitting(true);
    try {
      await onRequestMoreInfo({
        processId: process.id,
        requiredFields,
        customMessage: customMessage || templates.find(t => t.id === selectedTemplate)?.content || '',
        deadline: deadline ? new Date(deadline) : undefined,
        notifyUser,
      });
      onClose();
      // Reset form
      setRequiredFields([]);
      setCustomMessage('');
      setSelectedTemplate('');
      setDeadline('');
      setNotifyUser(true);
    } catch (error) {
      console.error('Failed to request more info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !process) return null;

  // Group fields by category
  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof availableFields>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
              Request Additional Information
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
                <span className="text-gray-500">Current Status:</span>
                <span className="ml-2 font-medium">{process.status}</span>
              </div>
            </div>
          </div>

          {/* Required Fields Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Required Information *
            </label>
            <div className="space-y-4">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.map(field => (
                      <label key={field.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requiredFields.includes(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <span className="text-sm text-gray-900">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Template Selection */}
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              Message Template
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a template...</option>
              {templates.filter(t => t.type === 'more_info_request').map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Message */}
          <div>
            <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message to User *
            </label>
            <textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain what additional information is needed and why. Be specific about requirements and provide guidance on how to submit the information."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide clear instructions on what information is needed and how the user should submit it.
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Response Deadline (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="datetime-local"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Set a deadline for the user to provide the additional information.
            </p>
          </div>

          {/* Notification Options */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyUser"
              checked={notifyUser}
              onChange={(e) => setNotifyUser(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notifyUser" className="ml-2 text-sm text-gray-700">
              Send notification to user immediately
            </label>
          </div>

          {/* Selected Fields Summary */}
          {requiredFields.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Selected Information Requirements ({requiredFields.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {requiredFields.map(fieldId => {
                  const field = availableFields.find(f => f.id === fieldId);
                  return (
                    <span
                      key={fieldId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {field?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

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
              disabled={isSubmitting || requiredFields.length === 0 || !customMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Information Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoreInfoModal;
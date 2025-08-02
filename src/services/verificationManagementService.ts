/**
 * Verification Management Service
 * 
 * This service handles all API interactions for the verification management system,
 * including CRUD operations for verification processes, messages, and system notifications.
 */

import { 
  VerificationProcess, 
  SystemMessage, 
  UserMessage,
  VerificationProcessResponse,
  ApprovalRequest,
  RejectionRequest,
  MoreInfoRequest,
  CreateMessageRequest,
  CreateSystemMessageRequest,
  FilterOptions,
  SortOptions,
  PaginationOptions,
  VerificationProcessUpdate,
  MessageTemplate,
  RejectionReason,
  VerificationStatus,
  MessageType
} from '../types/verification-management';

// Mock API base URL - replace with actual API endpoint
const API_BASE_URL = '/api/verification-management';

/**
 * API Response wrapper interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * HTTP client wrapper with error handling
 */
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

/**
 * Verification Management Service Class
 */
export class VerificationManagementService {
  
  // ===== VERIFICATION PROCESSES =====

  /**
   * Fetch verification processes with filtering, sorting, and pagination
   */
  static async getVerificationProcesses(
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'createdAt', direction: 'desc' },
    pagination: PaginationOptions = { page: 1, pageSize: 25, total: 0 }
  ): Promise<ApiResponse<VerificationProcessResponse>> {
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.status?.length) {
      queryParams.append('status', filters.status.join(','));
    }
    if (filters.priority?.length) {
      queryParams.append('priority', filters.priority.join(','));
    }
    if (filters.userType?.length) {
      queryParams.append('userType', filters.userType.join(','));
    }
    if (filters.riskLevel?.length) {
      queryParams.append('riskLevel', filters.riskLevel.join(','));
    }
    if (filters.dateRange) {
      queryParams.append('startDate', filters.dateRange.start.toISOString());
      queryParams.append('endDate', filters.dateRange.end.toISOString());
    }
    if (filters.assignedReviewer) {
      queryParams.append('assignedReviewer', filters.assignedReviewer);
    }
    if (filters.searchQuery) {
      queryParams.append('search', filters.searchQuery);
    }

    // Add sorting
    queryParams.append('sortField', sort.field);
    queryParams.append('sortDirection', sort.direction);

    // Add pagination
    queryParams.append('page', pagination.page.toString());
    queryParams.append('pageSize', pagination.pageSize.toString());

    return apiClient.get<VerificationProcessResponse>(`/processes?${queryParams.toString()}`);
  }

  /**
   * Get a single verification process by ID
   */
  static async getVerificationProcess(processId: string): Promise<ApiResponse<VerificationProcess>> {
    return apiClient.get<VerificationProcess>(`/processes/${processId}`);
  }

  /**
   * Update verification process
   */
  static async updateVerificationProcess(
    processId: string, 
    updates: VerificationProcessUpdate
  ): Promise<ApiResponse<VerificationProcess>> {
    return apiClient.patch<VerificationProcess>(`/processes/${processId}`, updates);
  }

  /**
   * Assign reviewer to verification process
   */
  static async assignReviewer(
    processId: string, 
    reviewerId: string
  ): Promise<ApiResponse<VerificationProcess>> {
    return apiClient.patch<VerificationProcess>(`/processes/${processId}/assign`, {
      assignedReviewer: reviewerId,
      reviewStartedAt: new Date().toISOString(),
    });
  }

  // ===== APPROVAL ACTIONS =====

  /**
   * Approve verification request
   */
  static async approveVerification(request: ApprovalRequest): Promise<ApiResponse<VerificationProcess>> {
    const response = await apiClient.post<VerificationProcess>(`/processes/${request.processId}/approve`, {
      reviewNotes: request.reviewNotes,
      tags: request.tags,
      notifyUser: request.notifyUser,
      customMessage: request.customMessage,
      completedAt: new Date().toISOString(),
      status: VerificationStatus.APPROVED,
    });

    // If approval successful and user notification requested, send system message
    if (response.success && request.notifyUser) {
      await this.createSystemMessage({
        processId: request.processId,
        userId: response.data.userId,
        type: MessageType.APPROVAL,
        subject: 'Verification Request Approved',
        content: request.customMessage || 'Your verification request has been approved.',
        generatedBy: 'system',
        priority: 'high',
        channels: ['email', 'in_app'],
      });
    }

    return response;
  }

  /**
   * Reject verification request
   */
  static async rejectVerification(request: RejectionRequest): Promise<ApiResponse<VerificationProcess>> {
    const response = await apiClient.post<VerificationProcess>(`/processes/${request.processId}/reject`, {
      rejectionReasons: request.reasonIds,
      rejectionDetails: request.customReason,
      reviewNotes: request.reviewNotes,
      requiresResubmission: request.requiresResubmission,
      completedAt: new Date().toISOString(),
      status: VerificationStatus.REJECTED,
    });

    // If rejection successful and user notification requested, send system message
    if (response.success && request.notifyUser) {
      await this.createSystemMessage({
        processId: request.processId,
        userId: response.data.userId,
        type: MessageType.REJECTION,
        subject: 'Verification Request Rejected',
        content: request.customMessage || 'Your verification request has been rejected.',
        generatedBy: 'system',
        priority: 'high',
        channels: ['email', 'in_app'],
      });
    }

    return response;
  }

  /**
   * Request more information from user
   */
  static async requestMoreInfo(request: MoreInfoRequest): Promise<ApiResponse<VerificationProcess>> {
    const response = await apiClient.post<VerificationProcess>(`/processes/${request.processId}/more-info`, {
      requiredFields: request.requiredFields,
      customMessage: request.customMessage,
      deadline: request.deadline?.toISOString(),
      status: VerificationStatus.REQUIRES_MORE_INFO,
    });

    // If successful and user notification requested, send system message
    if (response.success && request.notifyUser) {
      await this.createSystemMessage({
        processId: request.processId,
        userId: response.data.userId,
        type: MessageType.MORE_INFO_REQUEST,
        subject: 'Additional Information Required',
        content: request.customMessage,
        generatedBy: 'system',
        priority: 'medium',
        channels: ['email', 'in_app'],
      });
    }

    return response;
  }

  // ===== BULK ACTIONS =====

  /**
   * Bulk approve multiple verification requests
   */
  static async bulkApprove(
    processIds: string[], 
    reviewNotes?: string
  ): Promise<ApiResponse<{ successful: string[]; failed: string[] }>> {
    return apiClient.post<{ successful: string[]; failed: string[] }>('/processes/bulk-approve', {
      processIds,
      reviewNotes,
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Bulk reject multiple verification requests
   */
  static async bulkReject(
    processIds: string[], 
    reasonIds: string[], 
    customReason?: string
  ): Promise<ApiResponse<{ successful: string[]; failed: string[] }>> {
    return apiClient.post<{ successful: string[]; failed: string[] }>('/processes/bulk-reject', {
      processIds,
      reasonIds,
      customReason,
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Bulk assign reviewer to multiple processes
   */
  static async bulkAssignReviewer(
    processIds: string[], 
    reviewerId: string
  ): Promise<ApiResponse<{ successful: string[]; failed: string[] }>> {
    return apiClient.post<{ successful: string[]; failed: string[] }>('/processes/bulk-assign', {
      processIds,
      assignedReviewer: reviewerId,
      reviewStartedAt: new Date().toISOString(),
    });
  }

  // ===== SYSTEM MESSAGES =====

  /**
   * Create system message
   */
  static async createSystemMessage(
    message: CreateSystemMessageRequest
  ): Promise<ApiResponse<SystemMessage>> {
    return apiClient.post<SystemMessage>('/system-messages', {
      ...message,
      createdAt: new Date().toISOString(),
      status: 'pending',
      deliveryAttempts: 0,
    });
  }

  /**
   * Get system messages for a process
   */
  static async getSystemMessages(processId: string): Promise<ApiResponse<SystemMessage[]>> {
    return apiClient.get<SystemMessage[]>(`/system-messages/process/${processId}`);
  }

  /**
   * Mark system message as read
   */
  static async markSystemMessageAsRead(messageId: string): Promise<ApiResponse<SystemMessage>> {
    return apiClient.patch<SystemMessage>(`/system-messages/${messageId}/read`, {
      readAt: new Date().toISOString(),
      status: 'read',
    });
  }

  // ===== USER MESSAGES =====

  /**
   * Create user message
   */
  static async createUserMessage(
    message: CreateMessageRequest
  ): Promise<ApiResponse<UserMessage>> {
    return apiClient.post<UserMessage>('/user-messages', {
      ...message,
      createdAt: new Date().toISOString(),
      status: 'sent',
    });
  }

  /**
   * Get user messages for a process
   */
  static async getUserMessages(processId: string): Promise<ApiResponse<UserMessage[]>> {
    return apiClient.get<UserMessage[]>(`/user-messages/process/${processId}`);
  }

  /**
   * Reply to user message
   */
  static async replyToUserMessage(
    parentMessageId: string,
    content: string,
    adminId: string
  ): Promise<ApiResponse<UserMessage>> {
    return apiClient.post<UserMessage>(`/user-messages/${parentMessageId}/reply`, {
      content,
      adminId,
      isFromAdmin: true,
      createdAt: new Date().toISOString(),
      status: 'sent',
    });
  }

  // ===== MESSAGE TEMPLATES =====

  /**
   * Get message templates by type
   */
  static async getMessageTemplates(type?: MessageType): Promise<ApiResponse<MessageTemplate[]>> {
    const endpoint = type ? `/templates?type=${type}` : '/templates';
    return apiClient.get<MessageTemplate[]>(endpoint);
  }

  /**
   * Create message template
   */
  static async createMessageTemplate(
    template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<MessageTemplate>> {
    return apiClient.post<MessageTemplate>('/templates', {
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update message template
   */
  static async updateMessageTemplate(
    templateId: string,
    updates: Partial<MessageTemplate>
  ): Promise<ApiResponse<MessageTemplate>> {
    return apiClient.patch<MessageTemplate>(`/templates/${templateId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // ===== REJECTION REASONS =====

  /**
   * Get rejection reasons
   */
  static async getRejectionReasons(): Promise<ApiResponse<RejectionReason[]>> {
    return apiClient.get<RejectionReason[]>('/rejection-reasons');
  }

  /**
   * Create rejection reason
   */
  static async createRejectionReason(
    reason: Omit<RejectionReason, 'id'>
  ): Promise<ApiResponse<RejectionReason>> {
    return apiClient.post<RejectionReason>('/rejection-reasons', reason);
  }

  /**
   * Update rejection reason
   */
  static async updateRejectionReason(
    reasonId: string,
    updates: Partial<RejectionReason>
  ): Promise<ApiResponse<RejectionReason>> {
    return apiClient.patch<RejectionReason>(`/rejection-reasons/${reasonId}`, updates);
  }

  // ===== ANALYTICS & REPORTING =====

  /**
   * Get verification statistics
   */
  static async getVerificationStats(
    dateRange?: { start: Date; end: Date }
  ): Promise<ApiResponse<{
    totalProcesses: number;
    pendingProcesses: number;
    approvedProcesses: number;
    rejectedProcesses: number;
    averageProcessingTime: number;
    statusDistribution: Record<VerificationStatus, number>;
    priorityDistribution: Record<string, number>;
    riskDistribution: Record<string, number>;
  }>> {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('startDate', dateRange.start.toISOString());
      queryParams.append('endDate', dateRange.end.toISOString());
    }
    
    return apiClient.get(`/analytics/stats?${queryParams.toString()}`);
  }

  /**
   * Export verification data
   */
  static async exportVerificationData(
    filters: FilterOptions,
    format: 'csv' | 'xlsx' | 'json' = 'csv'
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.post<{ downloadUrl: string }>('/export', {
      filters,
      format,
    });
  }

  // ===== REAL-TIME UPDATES =====

  /**
   * Subscribe to real-time updates for verification processes
   */
  static subscribeToUpdates(
    callback: (update: { type: string; data: any }) => void
  ): () => void {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/verification-updates`);
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        callback(update);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  }
}

// Export default instance
export default VerificationManagementService;
/**
 * Comprehensive TypeScript interfaces for User Verification Request Management System
 * 
 * This file defines all the data structures needed for managing user verification requests,
 * including database schemas for the three collections: verification_processes, system_messages, and user_messages
 */

// ===== ENUMS =====

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_MORE_INFO = 'requires_more_info',
  RESUBMITTED = 'resubmitted',
  UNDER_REVIEW = 'under_review'
}

export enum VerificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum UserType {
  DESIGNER = 'designer',
  SERVICE_REQUESTER = 'service_requester',
  ADMIN = 'admin'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MessageType {
  APPROVAL = 'approval',
  REJECTION = 'rejection',
  MORE_INFO_REQUEST = 'more_info_request',
  RESUBMISSION_GUIDANCE = 'resubmission_guidance',
  STATUS_UPDATE = 'status_update'
}

export enum DocumentType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  PORTFOLIO = 'portfolio',
  CERTIFICATE = 'certificate',
  SAMPLE_PROJECT = 'sample_project',
  SUPPORTING_DOCUMENT = 'supporting_document'
}

// ===== CORE INTERFACES =====

export interface VerificationDocument {
  id: string;
  type: DocumentType;
  filename: string;
  url: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
  verified: boolean;
  verificationNotes?: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  factors: string[];
  score: number; // 0-100
  lastUpdated: Date;
  assessedBy?: string;
  notes?: string;
}

export interface VerificationRequest {
  // Personal Information
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  
  // Professional Information
  specialization: string;
  specializationDescription: string;
  experienceYears: string;
  softwareProficiency: string[];
  portfolioUrl?: string;
  
  // Additional Information
  certifications?: string;
  education: string;
  additionalInfo?: string;
  
  // Documents
  documents: VerificationDocument[];
  
  // Metadata
  submittedAt: Date;
  lastModified: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface RejectionReason {
  id: string;
  category: string;
  reason: string;
  template: string;
  requiresResubmission: boolean;
  isActive: boolean;
}

// ===== DATABASE COLLECTION SCHEMAS =====

/**
 * Collection: verification_processes
 * Stores all verification request details and status changes
 */
export interface VerificationProcess {
  id: string;
  userId: string;
  userType: UserType;
  
  // Request Details
  request: VerificationRequest;
  
  // Status Management
  status: VerificationStatus;
  priority: VerificationPriority;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  reviewStartedAt?: Date;
  completedAt?: Date;
  
  // Review Information
  assignedReviewer?: string;
  reviewNotes?: string;
  rejectionReasons?: string[];
  rejectionDetails?: string;
  
  // Risk Assessment
  riskAssessment: RiskAssessment;
  
  // Resubmission Tracking
  resubmissionCount: number;
  previousSubmissions?: string[]; // Array of previous process IDs
  
  // Metadata
  tags?: string[];
  internalNotes?: string;
}

/**
 * Collection: system_messages
 * Logs all automated notifications and status updates
 */
export interface SystemMessage {
  id: string;
  processId: string;
  userId: string;
  
  // Message Details
  type: MessageType;
  subject: string;
  content: string;
  templateId?: string;
  
  // Delivery Information
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  deliveryAttempts: number;
  
  // Metadata
  generatedBy: string; // system or admin user ID
  priority: 'low' | 'medium' | 'high';
  channels: ('email' | 'sms' | 'in_app')[];
}

/**
 * Collection: user_messages
 * Tracks communication between admin and users
 */
export interface UserMessage {
  id: string;
  processId: string;
  userId: string;
  adminId?: string;
  
  // Message Content
  subject: string;
  content: string;
  attachments?: {
    filename: string;
    url: string;
    type: string;
  }[];
  
  // Message Flow
  isFromAdmin: boolean;
  parentMessageId?: string; // For threading
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  respondedAt?: Date;
  
  // Status
  status: 'sent' | 'delivered' | 'read' | 'archived';
  isUrgent: boolean;
  
  // Metadata
  messageType: 'inquiry' | 'clarification' | 'guidance' | 'notification' | 'general';
  tags?: string[];
}

// ===== COMPONENT INTERFACES =====

export interface VerificationTableColumn {
  key: keyof VerificationProcess | string;
  label: string;
  sortable: boolean;
  width?: string;
  render?: (value: any, record: VerificationProcess) => React.ReactNode;
}

export interface FilterOptions {
  status?: VerificationStatus[];
  priority?: VerificationPriority[];
  userType?: UserType[];
  riskLevel?: RiskLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedReviewer?: string;
  searchQuery?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

export interface VerificationAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  variant: 'primary' | 'secondary' | 'danger' | 'warning';
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  handler: (processId: string, process: VerificationProcess) => Promise<void>;
}

// ===== API INTERFACES =====

export interface VerificationProcessResponse {
  processes: VerificationProcess[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  filters: FilterOptions;
  sort: SortOptions;
}

export interface ApprovalRequest {
  processId: string;
  reviewNotes?: string;
  tags?: string[];
  notifyUser: boolean;
  customMessage?: string;
}

export interface RejectionRequest {
  processId: string;
  reasonIds: string[];
  customReason?: string;
  reviewNotes?: string;
  requiresResubmission: boolean;
  notifyUser: boolean;
  customMessage?: string;
}

export interface MoreInfoRequest {
  processId: string;
  requiredFields: string[];
  customMessage: string;
  deadline?: Date;
  notifyUser: boolean;
}

export interface MessageTemplate {
  id: string;
  type: MessageType;
  name: string;
  subject: string;
  content: string;
  variables: string[]; // Available template variables
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== COMPONENT STATE INTERFACES =====

export interface VerificationManagementState {
  // Data
  processes: VerificationProcess[];
  selectedProcesses: string[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Table State
  filters: FilterOptions;
  sort: SortOptions;
  pagination: PaginationOptions;
  
  // Modal States
  showApprovalModal: boolean;
  showRejectionModal: boolean;
  showMoreInfoModal: boolean;
  showMessageModal: boolean;
  
  // Current Actions
  currentProcess: VerificationProcess | null;
  actionInProgress: boolean;
}

// ===== UTILITY TYPES =====

export type VerificationProcessUpdate = Partial<Pick<VerificationProcess, 
  'status' | 'priority' | 'assignedReviewer' | 'reviewNotes' | 'tags' | 'internalNotes'
>>;

export type CreateMessageRequest = Omit<UserMessage, 'id' | 'createdAt' | 'status'>;

export type CreateSystemMessageRequest = Omit<SystemMessage, 'id' | 'createdAt' | 'status' | 'deliveryAttempts'>;

// ===== CONSTANTS =====

export const VERIFICATION_STATUSES = Object.values(VerificationStatus);
export const VERIFICATION_PRIORITIES = Object.values(VerificationPriority);
export const USER_TYPES = Object.values(UserType);
export const RISK_LEVELS = Object.values(RiskLevel);
export const MESSAGE_TYPES = Object.values(MessageType);

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const REJECTION_REASON_CATEGORIES = [
  'Documentation',
  'Identity Verification',
  'Professional Qualifications',
  'Portfolio Quality',
  'Compliance',
  'Technical Requirements',
  'Other'
] as const;

export const RISK_FACTORS = [
  'Incomplete documentation',
  'Suspicious identity documents',
  'Inconsistent information',
  'Previous rejections',
  'High-risk location',
  'Unusual submission patterns',
  'Missing professional credentials',
  'Poor portfolio quality'
] as const;
# Database Schemas for Verification Management System

This document outlines the database schemas for the three collections used in the verification management system.

## Collection 1: `verification_processes`

**Purpose**: Stores all verification request details and status changes

### Schema Structure

```typescript
interface VerificationProcess {
  id: string;                    // Primary key
  userId: string;                // Foreign key to users collection
  userType: UserType;            // 'designer' | 'service_requester' | 'admin'
  
  // Request Details
  request: {
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
  };
  
  // Status Management
  status: VerificationStatus;     // 'pending' | 'approved' | 'rejected' | 'requires_more_info' | 'resubmitted' | 'under_review'
  priority: VerificationPriority; // 'low' | 'medium' | 'high' | 'urgent'
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  reviewStartedAt?: Date;
  completedAt?: Date;
  
  // Review Information
  assignedReviewer?: string;      // User ID of assigned reviewer
  reviewNotes?: string;           // Internal notes
  rejectionReasons?: string[];    // Array of rejection reason IDs
  rejectionDetails?: string;      // Custom rejection details
  
  // Risk Assessment
  riskAssessment: {
    level: RiskLevel;             // 'low' | 'medium' | 'high' | 'critical'
    factors: string[];            // Risk factors identified
    score: number;                // Risk score (0-100)
    lastUpdated: Date;
    assessedBy?: string;          // User ID of assessor
    notes?: string;
  };
  
  // Resubmission Tracking
  resubmissionCount: number;
  previousSubmissions?: string[]; // Array of previous process IDs
  
  // Metadata
  tags?: string[];               // Custom tags for categorization
  internalNotes?: string;        // Internal admin notes
}
```

### Indexes

```javascript
// MongoDB Indexes
db.verification_processes.createIndex({ "userId": 1 });
db.verification_processes.createIndex({ "status": 1 });
db.verification_processes.createIndex({ "priority": 1 });
db.verification_processes.createIndex({ "createdAt": -1 });
db.verification_processes.createIndex({ "assignedReviewer": 1 });
db.verification_processes.createIndex({ "riskAssessment.level": 1 });
db.verification_processes.createIndex({ "request.email": 1 });
db.verification_processes.createIndex({ "userType": 1, "status": 1 });

// Compound indexes for common queries
db.verification_processes.createIndex({ "status": 1, "createdAt": -1 });
db.verification_processes.createIndex({ "assignedReviewer": 1, "status": 1 });
db.verification_processes.createIndex({ "priority": 1, "createdAt": -1 });
```

---

## Collection 2: `system_messages`

**Purpose**: Logs all automated notifications and status updates

### Schema Structure

```typescript
interface SystemMessage {
  id: string;                    // Primary key
  processId: string;             // Foreign key to verification_processes
  userId: string;                // Foreign key to users collection
  
  // Message Details
  type: MessageType;             // 'approval' | 'rejection' | 'more_info_request' | 'resubmission_guidance' | 'status_update'
  subject: string;               // Message subject line
  content: string;               // Message body content
  templateId?: string;           // Reference to message template used
  
  // Delivery Information
  createdAt: Date;               // When message was created
  sentAt?: Date;                 // When message was sent
  deliveredAt?: Date;            // When message was delivered
  readAt?: Date;                 // When message was read by user
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  deliveryAttempts: number;      // Number of delivery attempts
  
  // Metadata
  generatedBy: string;           // 'system' or admin user ID
  priority: 'low' | 'medium' | 'high';
  channels: ('email' | 'sms' | 'in_app')[]; // Delivery channels
}
```

### Indexes

```javascript
// MongoDB Indexes
db.system_messages.createIndex({ "processId": 1 });
db.system_messages.createIndex({ "userId": 1 });
db.system_messages.createIndex({ "status": 1 });
db.system_messages.createIndex({ "createdAt": -1 });
db.system_messages.createIndex({ "type": 1 });
db.system_messages.createIndex({ "priority": 1 });

// Compound indexes
db.system_messages.createIndex({ "userId": 1, "status": 1 });
db.system_messages.createIndex({ "processId": 1, "createdAt": -1 });
db.system_messages.createIndex({ "status": 1, "createdAt": -1 });
```

---

## Collection 3: `user_messages`

**Purpose**: Tracks communication between admin and users

### Schema Structure

```typescript
interface UserMessage {
  id: string;                    // Primary key
  processId: string;             // Foreign key to verification_processes
  userId: string;                // Foreign key to users collection
  adminId?: string;              // Foreign key to admin user (if from admin)
  
  // Message Content
  subject: string;               // Message subject
  content: string;               // Message body
  attachments?: {                // File attachments
    filename: string;
    url: string;
    type: string;
  }[];
  
  // Message Flow
  isFromAdmin: boolean;          // True if sent by admin, false if from user
  parentMessageId?: string;      // For threading conversations
  
  // Timestamps
  createdAt: Date;               // When message was created
  readAt?: Date;                 // When message was read
  respondedAt?: Date;            // When message was responded to
  
  // Status
  status: 'sent' | 'delivered' | 'read' | 'archived';
  isUrgent: boolean;             // Priority flag
  
  // Metadata
  messageType: 'inquiry' | 'clarification' | 'guidance' | 'notification' | 'general';
  tags?: string[];               // Custom tags for categorization
}
```

### Indexes

```javascript
// MongoDB Indexes
db.user_messages.createIndex({ "processId": 1 });
db.user_messages.createIndex({ "userId": 1 });
db.user_messages.createIndex({ "adminId": 1 });
db.user_messages.createIndex({ "createdAt": -1 });
db.user_messages.createIndex({ "status": 1 });
db.user_messages.createIndex({ "isFromAdmin": 1 });
db.user_messages.createIndex({ "parentMessageId": 1 });

// Compound indexes
db.user_messages.createIndex({ "processId": 1, "createdAt": -1 });
db.user_messages.createIndex({ "userId": 1, "status": 1 });
db.user_messages.createIndex({ "adminId": 1, "createdAt": -1 });
db.user_messages.createIndex({ "isFromAdmin": 1, "status": 1 });
```

---

## Additional Supporting Collections

### `message_templates`

```typescript
interface MessageTemplate {
  id: string;
  type: MessageType;
  name: string;
  subject: string;
  content: string;
  variables: string[];           // Available template variables like {{userName}}, {{processId}}
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### `rejection_reasons`

```typescript
interface RejectionReason {
  id: string;
  category: string;              // 'Documentation', 'Identity Verification', etc.
  reason: string;                // Human-readable reason
  template: string;              // Template message for this reason
  requiresResubmission: boolean; // Whether user can resubmit
  isActive: boolean;
}
```

---

## Database Configuration

### MongoDB Configuration

```javascript
// Connection string
const connectionString = "mongodb://localhost:27017/verification_management";

// Database settings
const dbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### Firestore Configuration (Alternative)

```typescript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Verification processes - admin only
    match /verification_processes/{processId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'admin';
    }
    
    // System messages - admin read, system write
    match /system_messages/{messageId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'admin' ||
         resource.data.userId == request.auth.uid);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'admin';
    }
    
    // User messages - users can read their own, admins can read all
    match /user_messages/{messageId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.user_type == 'admin');
      allow write: if request.auth != null;
    }
  }
}
```

---

## Performance Considerations

### Query Optimization

1. **Pagination**: Use cursor-based pagination for large datasets
2. **Filtering**: Create compound indexes for common filter combinations
3. **Sorting**: Ensure sort fields are indexed
4. **Text Search**: Use full-text search indexes for name/email searches

### Caching Strategy

1. **Redis Cache**: Cache frequently accessed data
2. **Application Cache**: Cache templates and rejection reasons
3. **CDN**: Cache static assets and documents

### Monitoring

1. **Query Performance**: Monitor slow queries
2. **Index Usage**: Track index effectiveness
3. **Connection Pool**: Monitor database connections
4. **Storage Growth**: Track collection sizes

---

## Backup and Recovery

### Backup Strategy

```bash
# Daily automated backups
mongodump --host localhost:27017 --db verification_management --out /backups/$(date +%Y%m%d)

# Weekly full backups with compression
mongodump --host localhost:27017 --db verification_management --gzip --archive=/backups/weekly/backup_$(date +%Y%m%d).gz
```

### Recovery Procedures

```bash
# Restore from backup
mongorestore --host localhost:27017 --db verification_management /backups/20240101

# Point-in-time recovery (if using replica sets)
mongorestore --host localhost:27017 --oplogReplay --oplogLimit 1609459200:1
```

This schema design provides a robust foundation for the verification management system with proper indexing, relationships, and scalability considerations.
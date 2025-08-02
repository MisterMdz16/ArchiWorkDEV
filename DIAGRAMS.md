# ArchiWork - Project Diagrams & Architecture Documentation

This document contains comprehensive visual diagrams documenting the ArchiWork application architecture, user flows, component structure, and role-based authentication system.

## 1. Updated Project Structure

```
ArchiWork/
├── src/
│   ├── components/
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Dashboard.tsx
│   │   ├── UserManagement.tsx
│   │   └── AuthWrapper.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAuthWithAutoProfile.ts
│   ├── services/
│   │   ├── userService.ts
│   │   └── autoProfileService.ts
│   ├── types/
│   │   └── user.ts
│   ├── utils/
│   │   ├── firestoreHelpers.ts
│   │   └── firestoreValidation.ts
│   ├── config/
│   │   └── firebase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── firestore.rules
├── FIRESTORE_ERROR_DEBUGGING.md
├── ROLE_IMPLEMENTATION_GUIDE.md
├── INTEGRATION_GUIDE.md
└── DIAGRAMS.md
```

## 2. Enhanced Role-Based Authentication Flow

```mermaid
graph TD
    A[App Load] --> B[Check Auth State]
    B --> C{User Authenticated?}
    C -->|Yes| D[Load User Profile from Firestore]
    C -->|No| E[Show Sign In/Up Pages]
    
    D --> F{Profile Exists?}
    F -->|Yes| G[Set Profile State]
    F -->|No| H[Create Profile Automatically]
    
    H --> I[Determine User Type]
    I --> J[Set Default Values]
    J --> K[Save to Firestore]
    K --> L{Profile Created?}
    L -->|Yes| G
    L -->|No| M[Show Error State]
    
    G --> N[Show Role-Based Dashboard]
    
    E --> O{User Action}
    O -->|Sign In| P[Sign In Form]
    O -->|Sign Up| Q[Sign Up with Role Selection]
    
    P --> R[Firebase Auth]
    Q --> S[Firebase Auth + Role Assignment]
    
    R --> D
    S --> D
    
    M --> T[Retry Options]
    T -->|Retry| H
    T -->|Sign Out| E
    
    N --> U{User Role}
    U -->|Admin| V[Admin Dashboard]
    U -->|Designer Verified| W[Verified Designer Dashboard]
    U -->|Designer Unverified| X[Unverified Designer Dashboard]
    U -->|Service Requester| Y[Service Requester Dashboard]
```

## 3. Role-Based User Types & Permissions

```mermaid
mindmap
  root((User Roles))
    Admin
      Full Platform Access
        Manage All Users
        Verify Designers
        Access All Projects
        System Configuration
      Security Level: Highest
        Read All Profiles
        Update Any Profile
        Delete Users
        Admin Actions Logged
    Designer Verified
      Project Creation
        Create New Projects
        Portfolio Management
        Client Communication
        Collaboration Tools
      Verification Benefits
        Enhanced Visibility
        Client Trust Badge
        Advanced Features
        Priority Support
    Designer Unverified
      Limited Access
        Basic Project Tools
        Profile Setup
        Verification Process
        Educational Resources
      Restrictions
        Limited Visibility
        No Client Requests
        Watermarked Exports
        Verification Required
    Service Requester
      Service Access
        Browse Designers
        Request Services
        Project Collaboration
        Review System
      Features
        Designer Discovery
        Project Communication
        Service History
        Payment Integration
```

## 4. Firestore Data Structure & Security

```mermaid
erDiagram
    USERS {
        string uid PK
        string email
        string full_name
        string user_type
        string designer_verification_status
        timestamp created_at
        timestamp updated_at
        boolean is_active
        string profile_picture_url
    }
    
    PROJECTS {
        string project_id PK
        string owner_uid FK
        string title
        string description
        string status
        array collaborator_uids
        timestamp created_at
        timestamp updated_at
    }
    
    PORTFOLIOS {
        string portfolio_id PK
        string designer_uid FK
        string title
        string description
        array image_urls
        array tags
        boolean is_public
        timestamp created_at
    }
    
    REVIEWS {
        string review_id PK
        string reviewer_uid FK
        string designer_uid FK
        number rating
        string comment
        timestamp created_at
    }
    
    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ PORTFOLIOS : creates
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ REVIEWS : receives
```

## 5. Enhanced Authentication State Management

```mermaid
stateDiagram-v2
    [*] --> AppLoading : Initialize App
    AppLoading --> AuthLoading : Firebase Init
    AuthLoading --> Unauthenticated : No User
    AuthLoading --> ProfileLoading : User Found
    
    ProfileLoading --> ProfileReady : Profile Exists
    ProfileLoading --> ProfileCreating : No Profile
    ProfileLoading --> ProfileError : Load Failed
    
    ProfileCreating --> ProfileReady : Creation Success
    ProfileCreating --> ProfileError : Creation Failed
    
    ProfileReady --> Dashboard : Show UI
    ProfileError --> ErrorState : Show Error
    
    Unauthenticated --> SignInLoading : Sign In Attempt
    Unauthenticated --> SignUpLoading : Sign Up Attempt
    
    SignInLoading --> ProfileLoading : Auth Success
    SignInLoading --> Unauthenticated : Auth Failed
    
    SignUpLoading --> ProfileCreating : Auth Success
    SignUpLoading --> Unauthenticated : Auth Failed
    
    Dashboard --> Unauthenticated : Sign Out
    ErrorState --> Unauthenticated : Sign Out & Retry
    ErrorState --> ProfileLoading : Retry
```

## 6. Component Architecture with Role-Based Access

```mermaid
graph TB
    A[App.tsx] --> B[useAuth Hook]
    B --> C[Firebase Auth State]
    C --> D[UserService]
    D --> E[Firestore Users Collection]
    
    A --> F{Authentication Status}
    F -->|Loading| G[Loading Spinner]
    F -->|Authenticated + Profile Ready| H[Role-Based Dashboard]
    F -->|Authenticated + No Profile| I[Profile Setup/Error]
    F -->|Not Authenticated| J[Auth Pages]
    
    H --> K{User Role Check}
    K -->|Admin| L[Admin Dashboard]
    K -->|Designer Verified| M[Verified Designer Dashboard]
    K -->|Designer Unverified| N[Unverified Designer Dashboard]
    K -->|Service Requester| O[Service Requester Dashboard]
    
    L --> P[User Management]
    L --> Q[System Analytics]
    L --> R[All Projects View]
    
    M --> S[Project Creation]
    M --> T[Portfolio Management]
    M --> U[Client Communication]
    
    N --> V[Verification Notice]
    N --> W[Basic Project Tools]
    N --> X[Verification Process]
    
    O --> Y[Designer Discovery]
    O --> Z[Service Requests]
    O --> AA[Project Collaboration]
    
    J --> BB{Current Page}
    BB -->|signin| CC[SignIn Component]
    BB -->|signup| DD[SignUp Component]
    
    DD --> EE[Role Selection]
    EE --> FF[Form Validation]
    FF --> GG[Firebase Auth]
    GG --> HH[Profile Creation]
```

## 7. Firestore Security Rules Flow

```mermaid
flowchart TD
    A[Firestore Request] --> B{User Authenticated?}
    B -->|No| C[Deny Access]
    B -->|Yes| D[Get User Type from Document]
    
    D --> E{Operation Type}
    E -->|Read| F{Read Rules Check}
    E -->|Write| G{Write Rules Check}
    E -->|Delete| H{Delete Rules Check}
    
    F --> I{Resource Type}
    I -->|Own Profile| J[Allow]
    I -->|Other Profile| K{User Role}
    K -->|Admin| J
    K -->|Designer Verified| L{Target is Designer?}
    K -->|Service Requester| M{Target is Verified Designer?}
    L -->|Yes| J
    L -->|No| C
    M -->|Yes| J
    M -->|No| C
    K -->|Other| C
    
    G --> N{Resource Type}
    N -->|Own Profile| O{Field Updates}
    N -->|Other Profile| P{Admin Only}
    O -->|Basic Fields| J
    O -->|Role/Verification| Q{Admin Only}
    P -->|Yes (Admin)| J
    P -->|No| C
    Q -->|Yes (Admin)| J
    Q -->|No| C
    
    H --> R{Admin Only}
    R -->|Yes| J
    R -->|No| C
```

## 8. Error Handling & Data Validation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as UserService
    participant V as Validation Utils
    participant F as Firestore
    
    U->>C: Submit Registration
    C->>C: Client-side Validation
    
    alt Validation Passes
        C->>S: createUserProfile()
        S->>V: cleanUndefinedValues()
        V->>V: Remove undefined fields
        V->>V: Convert undefined to null
        V-->>S: Cleaned Data
        
        S->>V: validateData()
        V->>V: Check for undefined values
        V->>V: Validate field types
        V->>V: Check required fields
        
        alt Validation Success
            V-->>S: Validation Passed
            S->>F: setDoc(cleanedData)
            F-->>S: Success Response
            S-->>C: Profile Created
            C->>C: Redirect to Dashboard
        else Validation Failed
            V-->>S: Validation Errors
            S-->>C: Validation Error Message
            C->>C: Show Error to User
        end
    else Client Validation Failed
        C->>C: Show Form Errors
    end
    
    Note over S,F: All Firestore operations use<br/>cleaned and validated data
```

## 9. User Management Admin Interface

```mermaid
graph TB
    A[Admin Dashboard] --> B[User Management]
    B --> C[User List with Filters]
    
    C --> D{Filter Options}
    D --> E[All Users]
    D --> F[Admins Only]
    D --> G[Designers Only]
    D --> H[Service Requesters Only]
    
    C --> I[Search Functionality]
    I --> J[Search by Name]
    I --> K[Search by Email]
    I --> L[Search by Role]
    
    C --> M[User Actions]
    M --> N{User Type}
    N -->|Designer| O[Verification Actions]
    N -->|Any| P[Profile Management]
    N -->|Any| Q[Account Status]
    
    O --> R[Verify Designer]
    O --> S[Unverify Designer]
    O --> T[View Portfolio]
    
    P --> U[Edit Profile]
    P --> V[View Details]
    P --> W[Change Role]
    
    Q --> X[Activate Account]
    Q --> Y[Deactivate Account]
    Q --> Z[Delete Account]
```

## 10. Profile Creation & Auto-Management System

```mermaid
flowchart TD
    A[User Authentication Event] --> B[AutoProfileService.handleUserProfileCreation()]
    
    B --> C{User Null?}
    C -->|Yes| D[Return False]
    C -->|No| E{Already Processing?}
    
    E -->|Yes| F[Return True - Avoid Duplicates]
    E -->|No| G[Add to Processing Set]
    
    G --> H[Check Profile Exists - Cache First]
    H --> I{Profile Exists?}
    I -->|Yes| J[Update Cache & Return True]
    I -->|No| K[Create Profile]
    
    K --> L[Determine User Type]
    L --> M[Set Verification Status]
    M --> N[Clean Undefined Values]
    N --> O[Validate Data]
    O --> P{Validation Passed?}
    
    P -->|No| Q[Log Error & Return False]
    P -->|Yes| R[Save to Firestore]
    
    R --> S{Save Successful?}
    S -->|Yes| T[Update Cache]
    S -->|No| U[Log Error]
    
    T --> V[Remove from Processing Set]
    U --> V
    Q --> V
    J --> V
    
    V --> W[Return Result]
```

## 11. Technology Stack & Integration Points

```mermaid
mindmap
  root((ArchiWork Stack))
    Frontend
      React 18
        TypeScript Support
        Functional Components
        Custom Hooks
      Styling
        Tailwind CSS
        Responsive Design
        Component Variants
        Dark Mode Ready
      State Management
        React Hooks
        Context API
        Local State
      Icons & UI
        Lucide React
        Custom Components
        Loading States
    Backend Services
      Firebase Auth
        Email/Password
        Google OAuth
        Facebook OAuth
        Custom Claims
      Firestore
        Role-Based Rules
        Real-time Updates
        Offline Support
        Data Validation
      Cloud Functions
        User Triggers
        Admin Operations
        Background Tasks
    Development
      Vite
        Fast HMR
        ES Modules
        TypeScript
        Environment Variables
      Development Tools
        Firebase Emulator
        DevTools Extensions
        Error Boundaries
    Security
      Firestore Rules
        Role-Based Access
        Data Validation
        Admin Privileges
      Authentication
        Secure Tokens
        Session Management
        CSRF Protection
    Monitoring
      Error Tracking
        Console Logging
        Error Boundaries
        User Feedback
      Analytics
        User Behavior
        Performance Metrics
        Conversion Tracking
```

## 12. Implementation Status & Feature Matrix

| Feature Category | Admin | Designer Verified | Designer Unverified | Service Requester | Status |
|------------------|-------|-------------------|---------------------|-------------------|--------|
| **Authentication** |
| Email/Password | ✅ | ✅ | ✅ | ✅ | Complete |
| Google OAuth | ✅ | ✅ | ✅ | ✅ | Complete |
| Facebook OAuth | ✅ | ✅ | ✅ | ✅ | Complete |
| Auto Profile Creation | ✅ | ✅ | ✅ | ✅ | Complete |
| **User Management** |
| View All Users | ✅ | ❌ | ❌ | ❌ | Complete |
| Manage Roles | ✅ | ❌ | ❌ | ❌ | Complete |
| Verify Designers | ✅ | ❌ | ❌ | ❌ | Complete |
| User Analytics | ✅ | ❌ | ❌ | ❌ | Complete |
| **Project Management** |
| Create Projects | ✅ | ✅ | 🔒 Limited | ❌ | In Progress |
| View All Projects | ✅ | Own Only | Own Only | Collaborated | In Progress |
| Collaborate | ✅ | ✅ | ✅ | ✅ | Planned |
| **Portfolio** |
| Create Portfolio | ✅ | ✅ | 🔒 Limited | ❌ | Planned |
| Public Visibility | ✅ | ✅ | ❌ | N/A | Planned |
| **Service Requests** |
| Browse Designers | ✅ | ✅ | ✅ | ✅ | Planned |
| Request Services | ✅ | ❌ | ❌ | ✅ | Planned |
| **Security & Access** |
| Role-Based Dashboard | ✅ | ✅ | ✅ | ✅ | Complete |
| Firestore Rules | ✅ | ✅ | ✅ | ✅ | Complete |
| Data Validation | ✅ | ✅ | ✅ | ✅ | Complete |
| Error Handling | ✅ | ✅ | ✅ | ✅ | Complete |

Legend: ✅ Full Access | 🔒 Limited Access | ❌ No Access | N/A Not Applicable

## 13. Deployment & Environment Configuration

```mermaid
flowchart TD
    A[Development Environment] --> B[Environment Variables]
    B --> C[.env File]
    C --> D[Firebase Config]
    D --> E[Vite Build Process]
    
    E --> F[Production Build]
    F --> G[Firebase Hosting]
    G --> H[Live Application]
    
    I[Firestore Rules] --> J[Firebase Console]
    J --> K[Deploy Rules]
    K --> L[Security Active]
    
    M[Authentication Config] --> N[OAuth Providers]
    N --> O[Domain Authorization]
    O --> P[Social Login Active]
    
    Q[Analytics Setup] --> R[Google Analytics]
    R --> S[User Tracking]
    S --> T[Performance Monitoring]
```

## 14. Testing Strategy & Quality Assurance

```mermaid
graph TB
    A[Testing Strategy] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[Security Tests]
    A --> E[User Acceptance Tests]
    
    B --> F[Component Testing]
    B --> G[Hook Testing]
    B --> H[Service Testing]
    
    C --> I[Authentication Flow]
    C --> J[Profile Creation]
    C --> K[Role-Based Access]
    
    D --> L[Firestore Rules]
    D --> M[Data Validation]
    D --> N[Access Control]
    
    E --> O[User Registration]
    E --> P[Dashboard Navigation]
    E --> Q[Role-Specific Features]
    E --> R[Error Handling]
    
    F --> S[Jest + React Testing Library]
    I --> T[Firebase Emulator Suite]
    L --> U[Firestore Rules Testing]
    O --> V[Manual Testing Checklist]
```

---

## 📊 **Current Architecture Summary**

The ArchiWork application now features a **comprehensive role-based authentication system** with automatic Firestore profile management, enhanced error handling, and production-ready security measures.

### **Key Achievements:**
- ✅ **4-tier role system** (Admin, Designer Verified/Unverified, Service Requester)
- ✅ **Automatic profile creation** with intelligent user type assignment
- ✅ **Comprehensive error handling** with user-friendly messages
- ✅ **Production-ready security rules** with role-based access control
- ✅ **Type-safe TypeScript** implementation throughout
- ✅ **Responsive UI** with role-specific dashboards

### **Next Development Phase:**
- 🔄 **Project management system** with role-based permissions
- 🔄 **Designer portfolio system** with public visibility controls
- 🔄 **Service request marketplace** connecting requesters with designers
- 🔄 **Real-time messaging** system for collaboration
- 🔄 **Payment integration** for service transactions

*Last Updated: January 2025*  
*ArchiWork - Production-Ready Role-Based Architecture*
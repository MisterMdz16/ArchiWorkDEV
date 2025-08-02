# ArchiWork Role-Based Authentication Implementation Guide

## Overview
This document provides a comprehensive guide to the role-based authentication system implemented in ArchiWork, including testing procedures, security considerations, and maintenance guidelines.

## Role Structure

### User Types
1. **Admin (`admin`)**
   - Full platform access
   - User management capabilities
   - Can verify/unverify designers
   - Access to all projects and data

2. **Designer (`designer`)**
   - Can create and manage architectural projects
   - Has verification status: `verified` or `unverified`
   - Verified designers have enhanced visibility and features
   - Can collaborate with service requesters

3. **Service Requester (`service_requester`)**
   - Can request architectural services
   - Can browse and contact verified designers
   - Can collaborate on projects

### Verification Status (Designers Only)
- **Unverified (`unverified`)**: New designers, limited features
- **Verified (`verified`)**: Approved by admin, full designer features

## Implementation Components

### 1. Database Schema (Firestore)

```typescript
interface UserProfile {
  uid: string;                              // Firebase Auth UID
  email: string;                           // User email
  full_name: string;                       // Full name
  user_type: 'admin' | 'designer' | 'service_requester';
  designer_verification_status?: 'verified' | 'unverified';
  created_at: Date;
  updated_at: Date;
  profile_picture_url?: string;
  is_active: boolean;
}
```

### 2. Security Rules (Firestore)
- Role-based access control enforced at database level
- Admins have elevated permissions
- Users can only modify their own profiles
- Designer verification status can only be changed by admins

### 3. Frontend Components

#### Authentication Flow
- **SignUp**: Includes role selection during registration
- **SignIn**: Automatically loads user profile after authentication
- **Dashboard**: Role-specific content and actions

#### Role Management
- **UserService**: Handles all user profile operations
- **useAuth Hook**: Integrates role checking with authentication
- **Type Definitions**: Comprehensive TypeScript types for type safety

## Testing Checklist

### Registration Testing
- [ ] **Service Requester Registration**
  - [ ] Can register with email/password
  - [ ] Can register with Google OAuth
  - [ ] Can register with Facebook OAuth
  - [ ] Profile created with correct role
  - [ ] Redirected to appropriate dashboard

- [ ] **Designer Registration**
  - [ ] Can select designer role during signup
  - [ ] Profile created with `unverified` status
  - [ ] Shows verification notice on dashboard
  - [ ] Terms include verification disclaimer

- [ ] **Admin Registration**
  - [ ] Only existing admins can create admin accounts
  - [ ] Admin role properly assigned

### Authentication Testing
- [ ] **Sign In**
  - [ ] Email/password login works
  - [ ] OAuth logins work
  - [ ] Profile loaded after authentication
  - [ ] Redirected to appropriate dashboard

- [ ] **Profile Loading**
  - [ ] User profile loads after authentication
  - [ ] Handles missing profiles gracefully
  - [ ] Shows loading states appropriately

### Role-Based Access Control
- [ ] **Dashboard Content**
  - [ ] Admin sees admin-specific features
  - [ ] Designers see design tools
  - [ ] Service requesters see service request options
  - [ ] Verification status displayed correctly

- [ ] **Feature Access**
  - [ ] Project creation restricted to designers/admins
  - [ ] User management restricted to admins
  - [ ] Service requests available to service requesters/admins

### Firestore Security Rules Testing
- [ ] **User Profile Access**
  - [ ] Users can read their own profiles
  - [ ] Admins can read all profiles
  - [ ] Verified designers can read other verified designer profiles
  - [ ] Service requesters can read verified designer profiles

- [ ] **Profile Creation**
  - [ ] Users can create their own profiles
  - [ ] Role validation enforced
  - [ ] Designers start as unverified (unless created by admin)
  - [ ] Only admins can create admin accounts

- [ ] **Profile Updates**
  - [ ] Users can update their own profiles (except role/verification)
  - [ ] Admins can update any profile
  - [ ] Role changes restricted to admins
  - [ ] Verification status changes restricted to admins

### Error Handling
- [ ] **Network Errors**
  - [ ] Graceful handling of connection issues
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms where appropriate

- [ ] **Authentication Errors**
  - [ ] Invalid credentials handled properly
  - [ ] OAuth popup closures handled
  - [ ] Account already exists scenarios

- [ ] **Authorization Errors**
  - [ ] Access denied messages clear
  - [ ] Redirects to appropriate pages
  - [ ] No sensitive information leaked

## Maintenance Guidelines

### Adding New Roles
1. Update `UserType` in `src/types/user.ts`
2. Add role labels and descriptions
3. Update helper functions (isAdmin, isDesigner, etc.)
4. Modify Firestore security rules
5. Update UI components to handle new role
6. Test thoroughly

### Modifying Permissions
1. Update helper functions in `src/types/user.ts`
2. Modify security rules in `firestore.rules`
3. Update UI components and dashboards
4. Test all affected features

### Database Migrations
1. Plan schema changes carefully
2. Update TypeScript types first
3. Modify security rules
4. Update application code
5. Test with existing data
6. Deploy in phases if necessary

## Security Considerations

### Best Practices Implemented
- **Principle of Least Privilege**: Users only have access to what they need
- **Role Validation**: Server-side validation of all role assignments
- **Secure Defaults**: New users start with minimal permissions
- **Admin Restrictions**: Admin account creation restricted
- **Data Segregation**: Role-based data access controls

### Security Rules Features
- **Defense in Depth**: Multiple layers of validation
- **Input Validation**: All user inputs validated
- **Type Safety**: Enforced user types and verification statuses
- **Audit Trail**: Changes tracked with timestamps
- **Admin Oversight**: Admin approval required for sensitive operations

### Monitoring Recommendations
- Monitor failed authentication attempts
- Track role changes and privilege escalations
- Monitor admin actions
- Log security rule violations
- Regular security audits

## Performance Considerations

### Optimizations Implemented
- **Profile Caching**: User profiles cached in authentication context
- **Batch Operations**: Efficient database queries
- **Lazy Loading**: Role-specific components loaded when needed
- **Index Optimization**: Firestore indexes optimized for role queries

### Monitoring Metrics
- Authentication response times
- Profile loading performance
- Database query efficiency
- Error rates by role type

## Troubleshooting Guide

### Common Issues

#### "Access Denied" Errors
- Check user authentication status
- Verify user profile exists in Firestore
- Confirm role assignments are correct
- Review Firestore security rules

#### Profile Not Loading
- Check Firebase configuration
- Verify Firestore rules allow profile access
- Check network connectivity
- Review browser console for errors

#### Role Assignment Issues
- Verify role validation logic
- Check admin permissions for role changes
- Review user creation process
- Confirm database schema matches types

#### OAuth Registration Issues
- Check Firebase OAuth configuration
- Verify provider settings
- Review scope permissions
- Check profile creation logic

### Debug Steps
1. Check browser console for errors
2. Review Firebase console for authentication logs
3. Test Firestore rules in Firebase simulator
4. Verify environment variables
5. Check network requests in developer tools

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security rules validated
- [ ] Environment variables configured
- [ ] Firebase project properly configured
- [ ] OAuth providers configured

### Deployment
- [ ] Deploy Firestore security rules
- [ ] Deploy application code
- [ ] Verify authentication flows
- [ ] Test role-based access
- [ ] Monitor error rates

### Post-Deployment
- [ ] Test all user roles
- [ ] Verify security rules working
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Test OAuth flows

## Future Enhancements

### Potential Improvements
- **Multi-tenancy**: Support for organization-based roles
- **Role Hierarchies**: More complex role relationships
- **Temporary Permissions**: Time-limited access grants
- **Audit Logging**: Comprehensive activity tracking
- **Advanced Verification**: Multi-step designer verification process

### Scalability Considerations
- **Role Caching**: Implement Redis for role caching
- **Microservices**: Separate user management service
- **Event Streaming**: Real-time role change notifications
- **Federation**: Support for external identity providers

---

*This guide should be updated whenever the role system is modified or enhanced.*
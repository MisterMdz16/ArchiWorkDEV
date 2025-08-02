// User type definitions for role-based access control

export type UserType = 'admin' | 'designer' | 'service_requester';

export type DesignerVerificationStatus = 'verified' | 'unverified';

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  user_type: UserType;
  designer_verification_status?: DesignerVerificationStatus | null; // Only for designers, explicitly allow null
  created_at: Date;
  updated_at: Date;
  profile_picture_url?: string | null; // Explicitly allow null
  is_active: boolean;
}

export interface CreateUserProfileData {
  email: string;
  full_name: string;
  user_type: UserType;
  designer_verification_status?: DesignerVerificationStatus | null; // Explicitly allow null
}

// Role display configurations
export const USER_TYPE_LABELS: Record<UserType, string> = {
  admin: 'Administrator',
  designer: 'Designer',
  service_requester: 'Service Requester'
};

export const USER_TYPE_DESCRIPTIONS: Record<UserType, string> = {
  admin: 'Full access to all platform features and user management',
  designer: 'Create and manage architectural designs, accept project requests',
  service_requester: 'Request architectural services and collaborate with designers'
};

// Helper functions for role checking
export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return userProfile?.user_type === 'admin';
};

export const isDesigner = (userProfile: UserProfile | null): boolean => {
  return userProfile?.user_type === 'designer';
};

export const isVerifiedDesigner = (userProfile: UserProfile | null): boolean => {
  return isDesigner(userProfile) && userProfile?.designer_verification_status === 'verified';
};

export const isServiceRequester = (userProfile: UserProfile | null): boolean => {
  return userProfile?.user_type === 'service_requester';
};

export const canManageUsers = (userProfile: UserProfile | null): boolean => {
  return isAdmin(userProfile);
};

export const canCreateProjects = (userProfile: UserProfile | null): boolean => {
  return isAdmin(userProfile) || isDesigner(userProfile);
};

export const canRequestServices = (userProfile: UserProfile | null): boolean => {
  return isAdmin(userProfile) || isServiceRequester(userProfile);
};

export const canViewAnalytics = (userProfile: UserProfile | null): boolean => {
  return isAdmin(userProfile);
};
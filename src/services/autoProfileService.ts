import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  DocumentReference,
  DocumentSnapshot
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';

/**
 * Service for automatically creating and managing user profile documents in Firestore
 * after Firebase Authentication. Follows best practices for performance and security.
 */
export class AutoProfileService {
  private static readonly USERS_COLLECTION = 'users';
  
  /**
   * Interface for user profile document structure
   */
  interface UserProfileDocument {
    uid: string;
    email: string;
    full_name: string;
    user_type: 'admin' | 'designer_verified' | 'designer_unverified' | 'service_requester';
    designer_verification_status: 'verified' | 'unverified' | null;
    created_at: any; // Firestore serverTimestamp
    updated_at: any; // Firestore serverTimestamp
    is_active: boolean;
  }

  /**
   * Cache to avoid unnecessary Firestore reads for the same user
   * Key: user UID, Value: boolean (document exists)
   */
  private static documentExistsCache = new Map<string, boolean>();

  /**
   * Set to track users currently being processed to prevent duplicate operations
   */
  private static processingUsers = new Set<string>();

  /**
   * Main function to handle user profile creation after authentication
   * This should be called from onAuthStateChanged listener
   * 
   * @param user - Firebase Auth User object or null
   * @returns Promise<boolean> - true if profile exists/was created, false if user is null
   */
  static async handleUserProfileCreation(user: User | null): Promise<boolean> {
    try {
      // If no user is authenticated, return false
      if (!user) {
        console.log('AutoProfileService: No authenticated user');
        return false;
      }

      // Check if we're already processing this user to avoid duplicate operations
      if (this.processingUsers.has(user.uid)) {
        console.log(`AutoProfileService: Already processing user ${user.uid}`);
        return true;
      }

      // Add user to processing set
      this.processingUsers.add(user.uid);

      try {
        // Check if profile document already exists (with caching)
        const profileExists = await this.checkProfileExists(user.uid);
        
        if (profileExists) {
          console.log(`AutoProfileService: Profile already exists for user ${user.uid}`);
          return true;
        }

        // Create new profile document
        const profileCreated = await this.createUserProfile(user);
        
        if (profileCreated) {
          console.log(`AutoProfileService: Successfully created profile for user ${user.uid}`);
          // Update cache
          this.documentExistsCache.set(user.uid, true);
        }

        return profileCreated;

      } finally {
        // Always remove user from processing set
        this.processingUsers.delete(user.uid);
      }

    } catch (error) {
      console.error('AutoProfileService: Error in handleUserProfileCreation:', error);
      return false;
    }
  }

  /**
   * Check if a user profile document exists in Firestore
   * Uses caching to avoid unnecessary reads
   * 
   * @param uid - Firebase Auth User UID
   * @returns Promise<boolean> - true if document exists
   */
  private static async checkProfileExists(uid: string): Promise<boolean> {
    try {
      // Check cache first
      const cachedResult = this.documentExistsCache.get(uid);
      if (cachedResult !== undefined) {
        console.log(`AutoProfileService: Cache hit for user ${uid}: ${cachedResult}`);
        return cachedResult;
      }

      // If not in cache, check Firestore
      const userDocRef: DocumentReference = doc(db, this.USERS_COLLECTION, uid);
      const docSnapshot: DocumentSnapshot = await getDoc(userDocRef);
      const exists = docSnapshot.exists();

      // Cache the result
      this.documentExistsCache.set(uid, exists);

      console.log(`AutoProfileService: Document existence check for ${uid}: ${exists}`);
      return exists;

    } catch (error) {
      console.error(`AutoProfileService: Error checking profile existence for ${uid}:`, error);
      // On error, assume document doesn't exist to trigger creation attempt
      return false;
    }
  }

  /**
   * Create a new user profile document in Firestore
   * 
   * @param user - Firebase Auth User object
   * @returns Promise<boolean> - true if creation was successful
   */
  private static async createUserProfile(user: User): Promise<boolean> {
    try {
      // Determine user type based on email domain or other logic
      const userType = this.determineUserType(user);
      
      // Set designer verification status based on user type
      const designerVerificationStatus = this.getDesignerVerificationStatus(userType);

      // Create user profile document
      const userProfile: UserProfileDocument = {
        uid: user.uid,
        email: user.email || '',
        full_name: user.displayName || this.extractNameFromEmail(user.email || ''),
        user_type: userType,
        designer_verification_status: designerVerificationStatus,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_active: true
      };

      // Create document reference
      const userDocRef: DocumentReference = doc(db, this.USERS_COLLECTION, user.uid);

      // Set document in Firestore
      await setDoc(userDocRef, userProfile);

      console.log(`AutoProfileService: Created profile document for user ${user.uid}`);
      return true;

    } catch (error) {
      console.error(`AutoProfileService: Error creating profile for ${user.uid}:`, error);
      return false;
    }
  }

  /**
   * Determine user type based on business logic
   * You can customize this logic based on your requirements
   * 
   * @param user - Firebase Auth User object
   * @returns UserType - determined user type
   */
  private static determineUserType(user: User): 'admin' | 'designer_verified' | 'designer_unverified' | 'service_requester' {
    // Example logic - customize based on your needs
    
    // Check if email belongs to admin domain
    if (user.email && this.isAdminEmail(user.email)) {
      return 'admin';
    }

    // Check if email belongs to verified designer domain
    if (user.email && this.isVerifiedDesignerEmail(user.email)) {
      return 'designer_verified';
    }

    // Default logic: if user has certain patterns, make them unverified designer
    // Otherwise, make them service requester
    if (user.email && this.hasDesignerIndicators(user.email, user.displayName)) {
      return 'designer_unverified';
    }

    // Default to service requester
    return 'service_requester';
  }

  /**
   * Get designer verification status based on user type
   * 
   * @param userType - User type
   * @returns Designer verification status or null
   */
  private static getDesignerVerificationStatus(userType: string): 'verified' | 'unverified' | null {
    switch (userType) {
      case 'designer_verified':
        return 'verified';
      case 'designer_unverified':
        return 'unverified';
      default:
        return null;
    }
  }

  /**
   * Check if email belongs to admin domain
   * Customize this method based on your admin identification logic
   */
  private static isAdminEmail(email: string): boolean {
    const adminDomains = ['admin.archiwork.com', 'company.com']; // Add your admin domains
    const adminEmails = ['admin@archiwork.com']; // Add specific admin emails
    
    const domain = email.split('@')[1];
    return adminDomains.includes(domain) || adminEmails.includes(email);
  }

  /**
   * Check if email belongs to verified designer domain
   * Customize this method based on your verification logic
   */
  private static isVerifiedDesignerEmail(email: string): boolean {
    const verifiedDomains = ['verified-studio.com', 'architect-firm.com']; // Add verified domains
    const domain = email.split('@')[1];
    return verifiedDomains.includes(domain);
  }

  /**
   * Check if user has indicators suggesting they are a designer
   * Customize this method based on your business logic
   */
  private static hasDesignerIndicators(email: string, displayName: string | null): boolean {
    const designerKeywords = ['architect', 'designer', 'studio', 'design'];
    const emailLower = email.toLowerCase();
    const nameLower = (displayName || '').toLowerCase();
    
    return designerKeywords.some(keyword => 
      emailLower.includes(keyword) || nameLower.includes(keyword)
    );
  }

  /**
   * Extract a reasonable name from email address
   * Fallback when displayName is not available
   */
  private static extractNameFromEmail(email: string): string {
    try {
      const localPart = email.split('@')[0];
      // Replace dots and underscores with spaces, capitalize words
      return localPart
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      return 'User';
    }
  }

  /**
   * Clear the cache (useful for testing or when needed)
   */
  static clearCache(): void {
    this.documentExistsCache.clear();
    console.log('AutoProfileService: Cache cleared');
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.documentExistsCache.size,
      entries: Array.from(this.documentExistsCache.keys())
    };
  }

  /**
   * Force refresh a user's profile existence status
   * Useful when you know a profile was created externally
   */
  static async refreshProfileStatus(uid: string): Promise<boolean> {
    // Remove from cache to force fresh check
    this.documentExistsCache.delete(uid);
    return await this.checkProfileExists(uid);
  }
}

/**
 * Convenience function for React components or other parts of the app
 * to trigger profile creation
 */
export const ensureUserProfile = AutoProfileService.handleUserProfileCreation;

/**
 * Export types for use in other parts of the application
 */
export type UserType = 'admin' | 'designer_verified' | 'designer_unverified' | 'service_requester';
export type DesignerVerificationStatus = 'verified' | 'unverified' | null;
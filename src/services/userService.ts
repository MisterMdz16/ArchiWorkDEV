import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, CreateUserProfileData, UserType, DesignerVerificationStatus } from '../types/user';

/**
 * Service for managing user profiles in Firestore
 * Handles role-based user data operations with proper validation
 */
export class UserService {
  private static readonly USERS_COLLECTION = 'users';

  /**
   * Creates a new user profile in Firestore
   * @param uid - Firebase Auth user ID
   * @param profileData - User profile data
   * @returns Promise<UserProfile> - Created user profile
   */
  static async createUserProfile(uid: string, profileData: CreateUserProfileData): Promise<UserProfile> {
    try {
      console.log('🔄 UserService: Creating profile for UID:', uid);
      console.log('📋 Profile data:', profileData);
      
      // Validate user type
      if (!this.isValidUserType(profileData.user_type)) {
        throw new Error(`Invalid user type: ${profileData.user_type}`);
      }

      // Validate designer verification status if user is a designer
      if (profileData.user_type === 'designer' && profileData.designer_verification_status) {
        if (!this.isValidDesignerVerificationStatus(profileData.designer_verification_status)) {
          throw new Error(`Invalid designer verification status: ${profileData.designer_verification_status}`);
        }
      }

      // SOLUTION 1: Clean undefined values and use proper defaults
      const baseProfileData = {
        uid,
        email: profileData.email,
        full_name: profileData.full_name,
        user_type: profileData.user_type,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      // Only add designer_verification_status if user is a designer
      const cleanedProfileData = profileData.user_type === 'designer'
        ? {
            ...baseProfileData,
            designer_verification_status: profileData.designer_verification_status || 'unverified'
          }
        : baseProfileData;

      const userRef = doc(db, this.USERS_COLLECTION, uid);
      
      // SOLUTION 2: Transform data for Firestore compatibility
      const firestoreData = this.cleanUndefinedValues({
        ...cleanedProfileData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      console.log('💾 Saving to Firestore:', firestoreData);
      // Use merge: true to avoid overwriting if document exists
      await setDoc(userRef, firestoreData, { merge: true });
      
      console.log('✅ UserService: Profile created successfully for UID:', uid);

      return cleanedProfileData as UserProfile;
    } catch (error) {
      console.error('❌ UserService: Error creating profile:', error);
      throw new Error(`Failed to create user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a user profile by UID
   * @param uid - Firebase Auth user ID
   * @returns Promise<UserProfile | null> - User profile or null if not found
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 UserService: Fetching profile for UID:', uid);
      
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        console.log('✅ UserService: Profile found for UID:', uid);
        return {
          ...data,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as UserProfile;
      }

      console.log('⚠️ UserService: No profile found for UID:', uid);
      return null;
    } catch (error) {
      console.error('❌ UserService: Error fetching profile:', error);
      throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates a user profile
   * @param uid - Firebase Auth user ID
   * @param updates - Partial user profile updates
   * @returns Promise<void>
   */
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      // Validate user type if being updated
      if (updates.user_type && !this.isValidUserType(updates.user_type)) {
        throw new Error(`Invalid user type: ${updates.user_type}`);
      }

      // Validate designer verification status if being updated
      if (updates.designer_verification_status && !this.isValidDesignerVerificationStatus(updates.designer_verification_status)) {
        throw new Error(`Invalid designer verification status: ${updates.designer_verification_status}`);
      }

      // SOLUTION 3: Clean updates object before sending to Firestore
      const cleanedUpdates = this.cleanUndefinedValues(updates);
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        ...cleanedUpdates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates designer verification status (Admin only)
   * @param uid - Designer user ID
   * @param status - New verification status
   * @returns Promise<void>
   */
  static async updateDesignerVerificationStatus(uid: string, status: DesignerVerificationStatus): Promise<void> {
    try {
      if (!this.isValidDesignerVerificationStatus(status)) {
        throw new Error(`Invalid designer verification status: ${status}`);
      }

      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      if (userData.user_type !== 'designer') {
        throw new Error('User is not a designer');
      }

      await updateDoc(userRef, {
        designer_verification_status: status,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating designer verification status:', error);
      throw new Error(`Failed to update designer verification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets all users by type (Admin only)
   * @param userType - User type to filter by
   * @returns Promise<UserProfile[]> - Array of user profiles
   */
  static async getUsersByType(userType: UserType): Promise<UserProfile[]> {
    try {
      if (!this.isValidUserType(userType)) {
        throw new Error(`Invalid user type: ${userType}`);
      }

      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where('user_type', '==', userType));
      const querySnapshot = await getDocs(q);

      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as UserProfile);
      });

      return users;
    } catch (error) {
      console.error('Error fetching users by type:', error);
      throw new Error(`Failed to fetch users by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates user type
   * @param userType - User type to validate
   * @returns boolean - True if valid
   */
  private static isValidUserType(userType: string): userType is UserType {
    return ['admin', 'designer', 'service_requester'].includes(userType);
  }

  /**
   * Validates designer verification status
   * @param status - Status to validate
   * @returns boolean - True if valid
   */
  private static isValidDesignerVerificationStatus(status: string): status is DesignerVerificationStatus {
    return ['verified', 'unverified'].includes(status);
  }

  /**
   * SOLUTION 1: Clean undefined values from an object
   * Firestore doesn't support undefined values, only null
   * @param obj - Object to clean
   * @returns Object with undefined values removed or converted to null
   */
  private static cleanUndefinedValues<T extends Record<string, any>>(obj: T): T {
    const cleaned = {} as T;
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key as keyof T] = value;
      }
      // Note: We explicitly exclude undefined values
      // If you want to convert undefined to null, use:
      // cleaned[key as keyof T] = value === undefined ? null : value;
    }
    
    return cleaned;
  }

  /**
   * SOLUTION 3: Validate and transform data before Firestore operations
   * @param data - Data to validate and transform
   * @returns Firestore-compatible data
   */
  private static prepareForFirestore<T extends Record<string, any>>(data: T): T {
    const prepared = {} as T;
    
    for (const [key, value] of Object.entries(data)) {
      // Convert undefined to null for optional fields
      if (value === undefined) {
        // Only include null for fields that should exist
        if (this.isOptionalField(key)) {
          prepared[key as keyof T] = null as any;
        }
        // Skip undefined values for truly optional fields
      } else {
        prepared[key as keyof T] = value;
      }
    }
    
    return prepared;
  }

  /**
   * Helper to identify optional fields that should be null instead of omitted
   * @param fieldName - Field name to check
   * @returns boolean - True if field should be null when undefined
   */
  private static isOptionalField(fieldName: string): boolean {
    const optionalFieldsAsNull = [
      'designer_verification_status',
      'profile_picture_url'
    ];
    return optionalFieldsAsNull.includes(fieldName);
  }
}
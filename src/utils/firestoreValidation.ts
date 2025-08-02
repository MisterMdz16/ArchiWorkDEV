/**
 * SOLUTION 4: Utility functions for Firestore data validation and cleaning
 * Comprehensive validation to prevent undefined value errors
 */

/**
 * Firestore Data Validation and Cleaning Utilities
 */
export class FirestoreDataValidator {
  
  /**
   * Clean undefined values from any object before Firestore operations
   * @param data - Object to clean
   * @param convertUndefinedToNull - Whether to convert undefined to null
   * @returns Cleaned object safe for Firestore
   */
  static cleanForFirestore<T extends Record<string, any>>(
    data: T, 
    convertUndefinedToNull: boolean = false
  ): Partial<T> {
    const cleaned: Partial<T> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        if (convertUndefinedToNull) {
          cleaned[key as keyof T] = null as any;
        }
        // Otherwise skip undefined values entirely
      } else if (value === null) {
        // Keep null values (Firestore supports null)
        cleaned[key as keyof T] = value;
      } else if (typeof value === 'object' && value !== null) {
        // Recursively clean nested objects
        if (Array.isArray(value)) {
          cleaned[key as keyof T] = value.filter(item => item !== undefined) as any;
        } else if (value.constructor === Object) {
          cleaned[key as keyof T] = this.cleanForFirestore(value, convertUndefinedToNull) as any;
        } else {
          // Keep other object types (Date, etc.)
          cleaned[key as keyof T] = value;
        }
      } else {
        // Keep primitive values (string, number, boolean)
        cleaned[key as keyof T] = value;
      }
    }
    
    return cleaned;
  }

  /**
   * Validate data before Firestore operations
   * @param data - Data to validate
   * @param fieldRules - Optional field validation rules
   * @returns Validation result
   */
  static validateData(
    data: Record<string, any>, 
    fieldRules?: Record<string, (value: any) => boolean>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for undefined values
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        errors.push(`Field '${key}' has undefined value. Use null or omit the field.`);
      }
    }

    // Apply custom field rules if provided
    if (fieldRules) {
      for (const [field, validator] of Object.entries(fieldRules)) {
        if (data[field] !== undefined && !validator(data[field])) {
          errors.push(`Field '${field}' failed validation.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Safe setDoc wrapper that automatically cleans data
   * @param docRef - Firestore document reference
   * @param data - Data to set
   * @param options - SetOptions
   */
  static async safeSetDoc(
    docRef: any, 
    data: Record<string, any>, 
    options?: any
  ): Promise<void> {
    const cleanedData = this.cleanForFirestore(data);
    const validation = this.validateData(cleanedData);
    
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Dynamic import to avoid issues if not using Firebase v9+
    const { setDoc } = await import('firebase/firestore');
    return setDoc(docRef, cleanedData, options);
  }

  /**
   * Safe updateDoc wrapper that automatically cleans data
   * @param docRef - Firestore document reference  
   * @param data - Data to update
   */
  static async safeUpdateDoc(
    docRef: any, 
    data: Record<string, any>
  ): Promise<void> {
    const cleanedData = this.cleanForFirestore(data);
    const validation = this.validateData(cleanedData);
    
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    const { updateDoc } = await import('firebase/firestore');
    return updateDoc(docRef, cleanedData);
  }
}

/**
 * Type-safe user profile data preparation
 */
export const prepareUserProfileForFirestore = (profileData: any) => {
  return FirestoreDataValidator.cleanForFirestore({
    ...profileData,
    // Ensure designer_verification_status is properly handled
    designer_verification_status: profileData.user_type === 'designer' 
      ? (profileData.designer_verification_status || 'unverified')
      : null
  }, true); // Convert undefined to null for consistency
};

/**
 * Validation rules for user profile fields
 */
export const USER_PROFILE_VALIDATION_RULES = {
  user_type: (value: string) => ['admin', 'designer', 'service_requester'].includes(value),
  designer_verification_status: (value: string) => value === null || ['verified', 'unverified'].includes(value),
  email: (value: string) => typeof value === 'string' && value.includes('@'),
  full_name: (value: string) => typeof value === 'string' && value.trim().length > 0
};
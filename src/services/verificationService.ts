/**
 * Verification Service
 * 
 * Handles Firebase operations for user verification submissions
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Types for verification data
export interface VerificationSubmission {
  userId: string;
  userEmail: string;
  
  // Personal Information
  full_name: string;
  detailed_address: string;
  phone_number: string;
  
  // Professional Information
  specialization: string;
  specialization_description: string;
  software_proficiency: string[];
  experience_years: string;
  portfolio_url: string;
  
  // Additional Information
  certifications: string;
  education: string;
  additional_info: string;
  project_description: string;
  
  // File URLs (after upload)
  national_id_url?: string;
  sample_project_url?: string;
  
  // Metadata
  status: 'pending' | 'approved' | 'rejected' | 'requires_more_info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_at: Timestamp;
  updated_at: Timestamp;
  
  // Terms
  terms_accepted: boolean;
}

export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
}

class VerificationService {
  
  /**
   * Check if user is authenticated
   */
  private isUserAuthenticated(): boolean {
    const { auth } = require('../config/firebase');
    return auth.currentUser !== null;
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | null {
    const { auth } = require('../config/firebase');
    return auth.currentUser?.uid || null;
  }

  /**
   * Upload file to Firebase Storage
   */
  async uploadFile(file: File, userId: string, fileType: 'national_id' | 'sample_project'): Promise<FileUploadResult> {
    try {
      // Check authentication
      if (!this.isUserAuthenticated()) {
        throw new Error('User must be authenticated to upload files');
      }

      // Verify user ID matches current user
      const currentUserId = this.getCurrentUserId();
      if (currentUserId !== userId) {
        throw new Error('User ID mismatch - cannot upload files for another user');
      }

      console.log(`📤 Starting ${fileType} upload for user:`, userId);
      console.log('📁 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Sanitize filename - remove spaces, special characters, and normalize
      const sanitizedOriginalName = file.name
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters except dots, underscores, and hyphens
        .toLowerCase(); // Convert to lowercase for consistency
      
      // Create unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = this.getFileExtension(sanitizedOriginalName);
      const filename = `${fileType}_${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `verification/${userId}/${filename}`;
      
      console.log('🗂️ Upload path:', filePath);
      console.log('📝 Sanitized filename:', filename);
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      console.log('⬆️ Uploading to Firebase Storage...');
      
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      
      console.log('✅ File uploaded successfully, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('🔗 Download URL generated:', downloadURL);
      
      return {
        url: downloadURL,
        filename: filename,
        size: file.size
      };
    } catch (error) {
      console.error(`❌ Error uploading ${fileType}:`, error);
      console.error('📋 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        serverResponse: (error as any)?.serverResponse
      });
      throw new Error(`Failed to upload ${fileType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit verification request to Firestore
   */
  async submitVerificationRequest(
    formData: any, 
    userId: string, 
    userEmail: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('🔄 Starting verification submission for user:', userId);
      console.log('📋 Form data received:', {
        full_name: formData.full_name,
        email: userEmail,
        specialization: formData.specialization,
        hasNationalId: formData.national_id instanceof File,
        hasSampleProject: formData.sample_project instanceof File,
        softwareProficiency: formData.software_proficiency?.length || 0
      });
      
      // Upload files first
      let national_id_url = '';
      let sample_project_url = '';
      
      if (formData.national_id instanceof File) {
        console.log('📤 Uploading national ID file:', {
          name: formData.national_id.name,
          size: formData.national_id.size,
          type: formData.national_id.type
        });
        const nationalIdResult = await this.uploadFile(formData.national_id, userId, 'national_id');
        national_id_url = nationalIdResult.url;
        console.log('✅ National ID uploaded successfully:', national_id_url);
      }
      
      if (formData.sample_project instanceof File) {
        console.log('📤 Uploading sample project file:', {
          name: formData.sample_project.name,
          size: formData.sample_project.size,
          type: formData.sample_project.type
        });
        const sampleProjectResult = await this.uploadFile(formData.sample_project, userId, 'sample_project');
        sample_project_url = sampleProjectResult.url;
        console.log('✅ Sample project uploaded successfully:', sample_project_url);
      }
      
      // Prepare verification data
      const verificationData: VerificationSubmission = {
        userId,
        userEmail,
        
        // Personal Information
        full_name: formData.full_name || '',
        detailed_address: formData.detailed_address || '',
        phone_number: formData.phone_number || '',
        
        // Professional Information
        specialization: formData.specialization || '',
        specialization_description: formData.specialization_description || '',
        software_proficiency: Array.isArray(formData.software_proficiency) ? formData.software_proficiency : [],
        experience_years: formData.experience_years || '',
        portfolio_url: formData.portfolio_url || '',
        
        // Additional Information
        certifications: formData.certifications || '',
        education: formData.education || '',
        additional_info: formData.additional_info || '',
        project_description: formData.project_description || '',
        
        // File URLs
        national_id_url,
        sample_project_url,
        
        // Metadata
        status: 'pending',
        priority: 'medium',
        submitted_at: serverTimestamp() as Timestamp,
        updated_at: serverTimestamp() as Timestamp,
        
        // Terms
        terms_accepted: formData.terms_accepted || false
      };
      
      console.log('💾 Saving verification data to Firestore...');
      console.log('📋 Verification data to save:', {
        userId: verificationData.userId,
        userEmail: verificationData.userEmail,
        full_name: verificationData.full_name,
        specialization: verificationData.specialization,
        status: verificationData.status,
        hasNationalIdUrl: !!verificationData.national_id_url,
        hasSampleProjectUrl: !!verificationData.sample_project_url,
        softwareProficiencyCount: verificationData.software_proficiency.length
      });
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'verification_requests'), verificationData);
      
      console.log('✅ Verification request saved successfully with ID:', docRef.id);
      console.log('📊 Document saved to collection: verification_requests');
      
      // Also update user profile to indicate verification is pending
      await this.updateUserVerificationStatus(userId, 'pending');
      
      return {
        success: true,
        id: docRef.id
      };
      
    } catch (error) {
      console.error('❌ Error submitting verification request:', error);
      
      // Clean up uploaded files if document creation failed
      // Note: We can't clean up files here because we don't have the exact filenames
      // that were generated during upload. The cleanup will be handled by Firebase
      // Storage lifecycle rules or manual admin cleanup if needed.
      console.log('⚠️ Document creation failed, uploaded files may need manual cleanup');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit verification request'
      };
    }
  }

  /**
   * Update user's verification status in their profile
   */
  async updateUserVerificationStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        designer_verification_status: status,
        verification_updated_at: serverTimestamp()
      });
      console.log('✅ User verification status updated to:', status);
    } catch (error) {
      console.error('❌ Error updating user verification status:', error);
      // Don't throw error here as the main verification was successful
    }
  }

  /**
   * Get verification request by user ID
   */
  async getVerificationByUserId(userId: string): Promise<VerificationSubmission | null> {
    try {
      console.log('🔍 Searching for verification request for user:', userId);
      
      // First try without orderBy to avoid index issues
      const q = query(
        collection(db, 'verification_requests'),
        where('userId', '==', userId)
      );
      
      console.log('📋 Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('📊 Query results:', querySnapshot.size, 'documents found');
      
      if (!querySnapshot.empty) {
        // Sort manually by submitted_at if multiple documents
        const docs = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as (VerificationSubmission & { id: string })[];
        
        // Sort by submitted_at descending (most recent first)
        docs.sort((a, b) => {
          const aTime = a.submitted_at?.toMillis() || 0;
          const bTime = b.submitted_at?.toMillis() || 0;
          return bTime - aTime;
        });
        
        console.log('✅ Found verification request:', docs[0].id);
        return docs[0] as VerificationSubmission & { id: string };
      }
      
      console.log('❌ No verification request found for user');
      return null;
    } catch (error) {
      console.error('❌ Error fetching verification request:', error);
      // Don't throw error, return null to allow submission to continue
      return null;
    }
  }

  /**
   * Get all verification requests (admin only)
   */
  async getAllVerificationRequests(): Promise<VerificationSubmission[]> {
    try {
      const q = query(
        collection(db, 'verification_requests'),
        orderBy('submitted_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
                id: doc.id
      })) as (VerificationSubmission & { id: string })[];
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      throw error;
    }
  }

  /**
   * Update verification status (admin only)
   */
  async updateVerificationStatus(
    verificationId: string, 
    status: 'approved' | 'rejected' | 'requires_more_info',
    reviewNotes?: string
  ): Promise<void> {
    try {
      const verificationRef = doc(db, 'verification_requests', verificationId);
      
      await updateDoc(verificationRef, {
        status,
        review_notes: reviewNotes || '',
        reviewed_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      // Also update user's profile
      const verificationDoc = await getDoc(verificationRef);
      if (verificationDoc.exists()) {
        const data = verificationDoc.data();
        await this.updateUserVerificationStatus(data.userId, status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending');
      }
      
      console.log('✅ Verification status updated to:', status);
    } catch (error) {
      console.error('❌ Error updating verification status:', error);
      throw error;
    }
  }

  /**
   * Check if user has pending verification
   */
  async hasExistingVerification(userId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking for existing verification for user:', userId);
      const verification = await this.getVerificationByUserId(userId);
      
      if (verification) {
        console.log('📋 Found existing verification with status:', verification.status);
        const hasPending = verification.status === 'pending';
        console.log('⚠️ Has pending verification:', hasPending);
        return hasPending;
      }
      
      console.log('✅ No existing verification found, user can submit');
      return false;
    } catch (error) {
      console.error('❌ Error checking existing verification:', error);
      // Return false to allow submission if check fails
      return false;
    }
  }

  /**
   * Delete uploaded files (cleanup utility)
   */
  async deleteUploadedFiles(userId: string, fileType: 'national_id' | 'sample_project', filename: string): Promise<void> {
    try {
      const filePath = `verification/${userId}/${filename}`;
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log(`✅ Deleted ${fileType} file: ${filename}`);
    } catch (error) {
      console.error(`❌ Error deleting ${fileType} file:`, error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Get verification statistics (admin only)
   */
  async getVerificationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    requiresMoreInfo: number;
  }> {
    try {
      const q = query(collection(db, 'verification_requests'));
      const querySnapshot = await getDocs(q);
      
      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        requiresMoreInfo: 0
      };
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        stats.total++;
        
        switch (data.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'approved':
            stats.approved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
          case 'requires_more_info':
            stats.requiresMoreInfo++;
            break;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Error fetching verification stats:', error);
      throw error;
    }
  }

  /**
   * Search verification requests (admin only)
   */
  async searchVerificationRequests(searchTerm: string): Promise<VerificationSubmission[]> {
    try {
      const q = query(
        collection(db, 'verification_requests'),
        orderBy('submitted_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const allRequests = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as (VerificationSubmission & { id: string })[];
      
      // Filter results based on search term
      const filteredRequests = allRequests.filter(request => 
        request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredRequests;
    } catch (error) {
      console.error('❌ Error searching verification requests:', error);
      throw error;
    }
  }

  /**
   * Get verification requests by status (admin only)
   */
  async getVerificationRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'requires_more_info'): Promise<VerificationSubmission[]> {
    try {
      const q = query(
        collection(db, 'verification_requests'),
        where('status', '==', status),
        orderBy('submitted_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as (VerificationSubmission & { id: string })[];
    } catch (error) {
      console.error('❌ Error fetching verification requests by status:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, fileType: 'national_id' | 'sample_project'): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    // Check file type
    const allowedTypes = {
      national_id: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      sample_project: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/zip', 'application/x-zip-compressed']
    };

    if (!allowedTypes[fileType].includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes[fileType].join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName: string, fileType: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(originalName);
    return `${fileType}_${timestamp}_${randomString}.${extension}`;
  }
}

// Export singleton instance
export const verificationService = new VerificationService();
export default verificationService;
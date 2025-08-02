import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Utility functions for common Firestore operations
 * These helpers make it easier to work with user profiles and other collections
 */

/**
 * Generic function to get a document from any collection
 */
export async function getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
  try {
    const docRef: DocumentReference = doc(db, collectionName, documentId);
    const docSnap: DocumentSnapshot = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to set/create a document in any collection
 */
export async function setDocument<T>(
  collectionName: string, 
  documentId: string, 
  data: T,
  merge: boolean = false
): Promise<void> {
  try {
    const docRef: DocumentReference = doc(db, collectionName, documentId);
    await setDoc(docRef, { ...data, updated_at: serverTimestamp() }, { merge });
    console.log(`Document ${documentId} successfully written to ${collectionName}`);
  } catch (error) {
    console.error(`Error setting document ${documentId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document in any collection
 */
export async function updateDocument<T extends Record<string, any>>(
  collectionName: string, 
  documentId: string, 
  updates: Partial<T>
): Promise<void> {
  try {
    const docRef: DocumentReference = doc(db, collectionName, documentId);
    await updateDoc(docRef, { ...updates, updated_at: serverTimestamp() });
    console.log(`Document ${documentId} successfully updated in ${collectionName}`);
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document from any collection
 */
export async function deleteDocument(collectionName: string, documentId: string): Promise<void> {
  try {
    const docRef: DocumentReference = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    console.log(`Document ${documentId} successfully deleted from ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to query documents with a where clause
 */
export async function queryDocuments<T>(
  collectionName: string,
  field: string,
  operator: any,
  value: any
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const querySnapshot: QuerySnapshot = await getDocs(q);
    
    const documents: T[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return documents;
  } catch (error) {
    console.error(`Error querying ${collectionName} where ${field} ${operator} ${value}:`, error);
    throw error;
  }
}

/**
 * Check if a document exists in a collection
 */
export async function documentExists(collectionName: string, documentId: string): Promise<boolean> {
  try {
    const docRef: DocumentReference = doc(db, collectionName, documentId);
    const docSnap: DocumentSnapshot = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`Error checking if document ${documentId} exists in ${collectionName}:`, error);
    return false;
  }
}

/**
 * Specific helper for user profiles
 */
export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'designer_verified' | 'designer_unverified' | 'service_requester';
  designer_verification_status: 'verified' | 'unverified' | null;
  created_at: any;
  updated_at: any;
  is_active: boolean;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return await getDocument<UserProfile>('users', uid);
}

/**
 * Create or update user profile in Firestore
 */
export async function setUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  await setDocument('users', uid, profile, true);
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  await updateDocument('users', uid, updates);
}

/**
 * Check if user profile exists in Firestore
 */
export async function userProfileExists(uid: string): Promise<boolean> {
  return await documentExists('users', uid);
}

/**
 * Get users by type
 */
export async function getUsersByType(userType: string): Promise<UserProfile[]> {
  return await queryDocuments<UserProfile>('users', 'user_type', '==', userType);
}

/**
 * Get all active users
 */
export async function getActiveUsers(): Promise<UserProfile[]> {
  return await queryDocuments<UserProfile>('users', 'is_active', '==', true);
}

/**
 * Batch operations helper (for future use)
 */
export class FirestoreBatch {
  private operations: Array<() => Promise<void>> = [];

  add(operation: () => Promise<void>) {
    this.operations.push(operation);
  }

  async execute(): Promise<void> {
    try {
      await Promise.all(this.operations.map(op => op()));
      console.log(`Successfully executed ${this.operations.length} batch operations`);
    } catch (error) {
      console.error('Error executing batch operations:', error);
      throw error;
    }
  }
}

/**
 * Utility to convert Firestore timestamp to Date
 */
export function timestampToDate(timestamp: any): Date {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date();
}
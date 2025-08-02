import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTimeline: string;
  deliverables: string;
  meetingsCount: number;
  revisionsCount: number;
  customTags: string[];
  primaryImageUrl: string;
  additionalImageUrls: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'completed';
  viewCount: number;
  favoriteCount: number;
}

export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTimeline: string;
  deliverables: string;
  meetingsCount: number;
  revisionsCount: number;
  customTags: string[];
  primaryImage: File;
  additionalImages: File[];
}

/**
 * Service for managing projects in Firestore and Firebase Storage
 */
export class ProjectService {
  private static readonly PROJECTS_COLLECTION = 'projects';
  private static readonly STORAGE_PATH = 'project-images';

  /**
   * Creates a new project with image uploads
   * @param projectData - Project data including images
   * @param userId - ID of the user creating the project
   * @returns Promise<Project> - Created project
   */
  static async createProject(projectData: CreateProjectData, userId: string): Promise<Project> {
    try {
      console.log('🔄 ProjectService: Creating project for user:', userId);
      
      // Generate unique project ID
      const projectId = doc(collection(db, this.PROJECTS_COLLECTION)).id;
      
      // Upload primary image
      console.log('📤 Uploading primary image...');
      const primaryImageUrl = await this.uploadImage(
        projectData.primaryImage, 
        `${projectId}/primary`
      );
      
      // Upload additional images
      console.log('📤 Uploading additional images...');
      const additionalImageUrls: string[] = [];
      for (let i = 0; i < projectData.additionalImages.length; i++) {
        const imageUrl = await this.uploadImage(
          projectData.additionalImages[i], 
          `${projectId}/additional-${i}`
        );
        additionalImageUrls.push(imageUrl);
      }
      
      // Prepare project document
      const projectDoc: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        price: projectData.price,
        deliveryTimeline: projectData.deliveryTimeline,
        deliverables: projectData.deliverables,
        meetingsCount: projectData.meetingsCount,
        revisionsCount: projectData.revisionsCount,
        customTags: projectData.customTags,
        primaryImageUrl,
        additionalImageUrls,
        createdBy: userId,
        status: 'active',
        viewCount: 0,
        favoriteCount: 0
      };
      
      // Save to Firestore
      console.log('💾 Saving project to Firestore...');
      const projectRef = doc(db, this.PROJECTS_COLLECTION, projectId);
      await setDoc(projectRef, {
        ...projectDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ ProjectService: Project created successfully with ID:', projectId);
      
      // Return the created project
      return {
        id: projectId,
        ...projectDoc,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ ProjectService: Error creating project:', error);
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Uploads an image to Firebase Storage
   * @param file - Image file to upload
   * @param path - Storage path for the image
   * @returns Promise<string> - Download URL of uploaded image
   */
  private static async uploadImage(file: File, path: string): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }
      
      // Create storage reference
      const imageRef = ref(storage, `${this.STORAGE_PATH}/${path}-${Date.now()}`);
      
      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Image uploaded successfully:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets a project by ID
   * @param projectId - Project ID
   * @returns Promise<Project | null> - Project or null if not found
   */
  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const projectRef = doc(db, this.PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        return {
          id: projectSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets projects by user ID
   * @param userId - User ID
   * @returns Promise<Project[]> - Array of user's projects
   */
  static async getProjectsByUser(userId: string): Promise<Project[]> {
    try {
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const q = query(
        projectsRef, 
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project);
      });
      
      return projects;
    } catch (error) {
      console.error('❌ Error fetching user projects:', error);
      throw new Error(`Failed to fetch user projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets all active projects
   * @param limitCount - Number of projects to fetch (default: 20)
   * @returns Promise<Project[]> - Array of active projects
   */
  static async getActiveProjects(limitCount: number = 20): Promise<Project[]> {
    try {
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const q = query(
        projectsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project);
      });
      
      return projects;
    } catch (error) {
      console.error('❌ Error fetching active projects:', error);
      throw new Error(`Failed to fetch active projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets projects by category
   * @param category - Project category
   * @param limitCount - Number of projects to fetch (default: 20)
   * @returns Promise<Project[]> - Array of projects in category
   */
  static async getProjectsByCategory(category: string, limitCount: number = 20): Promise<Project[]> {
    try {
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const q = query(
        projectsRef,
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Project);
      });
      
      return projects;
    } catch (error) {
      console.error('❌ Error fetching projects by category:', error);
      throw new Error(`Failed to fetch projects by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a project and its associated images
   * @param projectId - Project ID
   * @param userId - User ID (for authorization)
   * @returns Promise<void>
   */
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      // First, get the project to verify ownership and get image URLs
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (project.createdBy !== userId) {
        throw new Error('Unauthorized: You can only delete your own projects');
      }
      
      // Delete images from storage
      try {
        // Delete primary image
        if (project.primaryImageUrl) {
          const primaryImageRef = ref(storage, project.primaryImageUrl);
          await deleteObject(primaryImageRef);
        }
        
        // Delete additional images
        for (const imageUrl of project.additionalImageUrls) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }
      } catch (storageError) {
        console.warn('⚠️ Some images could not be deleted from storage:', storageError);
        // Continue with project deletion even if image deletion fails
      }
      
      // Delete project document
      const projectRef = doc(db, this.PROJECTS_COLLECTION, projectId);
      await setDoc(projectRef, { status: 'inactive', updatedAt: serverTimestamp() }, { merge: true });
      
      console.log('✅ Project deleted successfully:', projectId);
      
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
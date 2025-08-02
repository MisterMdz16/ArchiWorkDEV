import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Analytics Service for fetching real dashboard statistics
 */
export class AnalyticsService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly PROJECTS_COLLECTION = 'projects';
  private static readonly ANALYTICS_COLLECTION = 'analytics';
  private static readonly PROFILE_VIEWS_DOC = 'profile_views';

  /**
   * Get total number of users in the platform
   */
  static async getTotalUsers(): Promise<number> {
    try {
      console.log('📊 Fetching total users count...');
      const usersRef = collection(db, this.USERS_COLLECTION);
      const snapshot = await getCountFromServer(usersRef);
      const count = snapshot.data().count;
      console.log('✅ Total users:', count);
      return count;
    } catch (error) {
      console.error('❌ Error fetching total users:', error);
      return 0;
    }
  }

  /**
   * Get number of active users (users who logged in recently)
   */
  static async getActiveUsers(): Promise<number> {
    try {
      console.log('📊 Fetching active users count...');
      const usersRef = collection(db, this.USERS_COLLECTION);
      const activeQuery = query(usersRef, where('is_active', '==', true));
      const snapshot = await getCountFromServer(activeQuery);
      const count = snapshot.data().count;
      console.log('✅ Active users:', count);
      return count;
    } catch (error) {
      console.error('❌ Error fetching active users:', error);
      return 0;
    }
  }

  /**
   * Get users by type
   */
  static async getUsersByType(): Promise<{
    admins: number;
    designers: number;
    serviceRequesters: number;
    verifiedDesigners: number;
    unverifiedDesigners: number;
  }> {
    try {
      console.log('📊 Fetching users by type...');
      const usersRef = collection(db, this.USERS_COLLECTION);
      
      // Get all users and categorize them
      const allUsersSnapshot = await getDocs(usersRef);
      const stats = {
        admins: 0,
        designers: 0,
        serviceRequesters: 0,
        verifiedDesigners: 0,
        unverifiedDesigners: 0
      };

      allUsersSnapshot.forEach((doc) => {
        const userData = doc.data();
        switch (userData.user_type) {
          case 'admin':
            stats.admins++;
            break;
          case 'designer':
            stats.designers++;
            if (userData.designer_verification_status === 'verified') {
              stats.verifiedDesigners++;
            } else {
              stats.unverifiedDesigners++;
            }
            break;
          case 'service_requester':
            stats.serviceRequesters++;
            break;
        }
      });

      console.log('✅ Users by type:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching users by type:', error);
      return {
        admins: 0,
        designers: 0,
        serviceRequesters: 0,
        verifiedDesigners: 0,
        unverifiedDesigners: 0
      };
    }
  }

  /**
   * Get total number of projects (placeholder for future implementation)
   */
  static async getTotalProjects(): Promise<number> {
    try {
      console.log('📊 Fetching total projects count...');
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const snapshot = await getCountFromServer(projectsRef);
      const count = snapshot.data().count;
      console.log('✅ Total projects:', count);
      return count;
    } catch (error) {
      console.error('❌ Error fetching total projects (collection may not exist yet):', error);
      // Return 0 if projects collection doesn't exist yet
      return 0;
    }
  }

  /**
   * Get active projects count
   */
  static async getActiveProjects(): Promise<number> {
    try {
      console.log('📊 Fetching active projects count...');
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const activeQuery = query(projectsRef, where('status', '==', 'active'));
      const snapshot = await getCountFromServer(activeQuery);
      const count = snapshot.data().count;
      console.log('✅ Active projects:', count);
      return count;
    } catch (error) {
      console.error('❌ Error fetching active projects (collection may not exist yet):', error);
      return 0;
    }
  }

  /**
   * Get total profile views
   */
  static async getTotalProfileViews(): Promise<number> {
    try {
      console.log('📊 Fetching total profile views...');
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, this.PROFILE_VIEWS_DOC);
      const docSnap = await getDoc(analyticsRef);
      
      if (docSnap.exists()) {
        const views = docSnap.data().total_views || 0;
        console.log('✅ Total profile views:', views);
        return views;
      } else {
        // Initialize profile views document if it doesn't exist
        await setDoc(analyticsRef, {
          total_views: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        console.log('✅ Initialized profile views document');
        return 0;
      }
    } catch (error) {
      console.error('❌ Error fetching profile views:', error);
      return 0;
    }
  }

  /**
   * Increment profile views count
   */
  static async incrementProfileViews(userId?: string): Promise<void> {
    try {
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, this.PROFILE_VIEWS_DOC);
      await updateDoc(analyticsRef, {
        total_views: increment(1),
        updated_at: serverTimestamp()
      });
      
      // Track individual user views if userId provided
      if (userId) {
        const userViewsRef = doc(db, this.ANALYTICS_COLLECTION, `user_views_${userId}`);
        await setDoc(userViewsRef, {
          user_id: userId,
          views: increment(1),
          last_viewed: serverTimestamp()
        }, { merge: true });
      }
      
      console.log('✅ Profile views incremented');
    } catch (error) {
      console.error('❌ Error incrementing profile views:', error);
    }
  }

  /**
   * Get dashboard statistics summary
   */
  static async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalProfileViews: number;
    usersByType: {
      admins: number;
      designers: number;
      serviceRequesters: number;
      verifiedDesigners: number;
      unverifiedDesigners: number;
    };
  }> {
    try {
      console.log('📊 Fetching complete dashboard statistics...');
      
      const [
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalProfileViews,
        usersByType
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalProjects(),
        this.getActiveProjects(),
        this.getTotalProfileViews(),
        this.getUsersByType()
      ]);

      const stats = {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalProfileViews,
        usersByType
      };

      console.log('✅ Complete dashboard stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        activeProjects: 0,
        totalProfileViews: 0,
        usersByType: {
          admins: 0,
          designers: 0,
          serviceRequesters: 0,
          verifiedDesigners: 0,
          unverifiedDesigners: 0
        }
      };
    }
  }

  /**
   * Get monthly growth statistics (placeholder for future implementation)
   */
  static async getMonthlyGrowth(): Promise<{
    usersGrowth: number;
    projectsGrowth: number;
    revenueGrowth: number;
  }> {
    // This would require historical data tracking
    // For now, return mock data with a note
    console.log('📊 Monthly growth stats (mock data - implement historical tracking)');
    return {
      usersGrowth: 12, // 12% growth
      projectsGrowth: 5,  // 5% growth
      revenueGrowth: 23   // 23% growth
    };
  }
}
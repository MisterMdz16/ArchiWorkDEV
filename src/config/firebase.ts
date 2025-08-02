import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Firebase configuration is incomplete!');
  console.error('Missing environment variables:', missingVars);
  console.error('Please check your .env file and add the missing variables.');
  throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Analytics (only in production and in browser)
export const analytics = typeof window !== 'undefined' && import.meta.env.PROD ? getAnalytics(app) : null;

// Configure Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Facebook OAuth Provider  
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup'
});

// Development mode setup
if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized in development mode');
  console.log('📦 Project ID:', firebaseConfig.projectId);
  
  // Connect to Firestore emulator if running locally (optional)
  // Uncomment the following lines if you want to use Firestore emulator
  // if (!db._delegate._databaseId.projectId.includes('demo-')) {
  //   connectFirestoreEmulator(db, 'localhost', 8080);
  //   console.log('🔧 Connected to Firestore emulator');
  // }
}

// Test Firebase connection
auth.onAuthStateChanged((user) => {
  if (import.meta.env.DEV) {
    console.log('🔐 Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
  }
});

export default app;
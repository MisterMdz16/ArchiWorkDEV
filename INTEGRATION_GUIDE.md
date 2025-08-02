# Firebase Firestore Auto Profile Creation - Integration Guide

## 🚀 Quick Start Integration

This guide will help you integrate the automatic Firestore profile creation system into your Firebase Authentication application.

## 📋 Prerequisites

- Firebase project set up with Authentication and Firestore enabled
- Firebase SDK v9+ installed
- React application (or vanilla JavaScript)

## 🔧 Step-by-Step Integration

### Step 1: Update Firebase Configuration

Ensure your Firebase configuration includes Firestore:

```javascript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add this

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
```

### Step 2: Deploy Firestore Security Rules

1. Create a file named `firestore.rules` in your project root
2. Copy the security rules from the provided `firestore.rules` file
3. Deploy the rules:

```bash
firebase deploy --only firestore:rules
```

### Step 3: Choose Your Integration Method

#### Option A: React Hook Integration (Recommended)

Replace your existing authentication hook with the enhanced version:

**Before:**
```javascript
import { useAuth } from './hooks/useAuth';
```

**After:**
```javascript
import { useAuthWithAutoProfile } from './hooks/useAuthWithAutoProfile';

function App() {
  const { user, loading, profileReady, signIn, signUp } = useAuthWithAutoProfile();
  
  // Wait for both authentication and profile to be ready
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <SignInPage />;
  }
  
  if (user && !profileReady) {
    return <ProfileSetupLoading />;
  }
  
  return <Dashboard />;
}
```

#### Option B: AuthWrapper Component Integration

Wrap your entire app with the AuthWrapper component:

```javascript
// src/App.tsx
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import SignInPage from './components/SignInPage';

function App() {
  return (
    <AuthWrapper fallback={<SignInPage />}>
      <Dashboard />
    </AuthWrapper>
  );
}
```

#### Option C: Manual Integration

If you prefer to integrate manually with your existing authentication:

```javascript
import { AutoProfileService } from './services/autoProfileService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// In your authentication setup
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Ensure profile exists
    const profileReady = await AutoProfileService.handleUserProfileCreation(user);
    
    if (profileReady) {
      // User and profile are ready
      console.log('User authenticated and profile ready');
    } else {
      // Handle profile creation failure
      console.error('Profile creation failed');
    }
  }
});
```

### Step 4: Customize User Type Logic

Update the user type determination logic in `AutoProfileService`:

```javascript
// src/services/autoProfileService.ts
private static determineUserType(user: User): UserType {
  // Customize this logic for your application
  
  // Example: Check email domain
  if (user.email?.endsWith('@youradmindomain.com')) {
    return 'admin';
  }
  
  // Example: Check for designer keywords
  if (user.displayName?.toLowerCase().includes('architect')) {
    return 'designer_unverified';
  }
  
  // Default to service requester
  return 'service_requester';
}
```

### Step 5: Test the Integration

#### Test Checklist:

✅ **New User Registration**
- [ ] Register with email/password → Profile created automatically
- [ ] Register with Google OAuth → Profile created automatically
- [ ] Register with Facebook OAuth → Profile created automatically
- [ ] Check Firestore console → User document exists with correct fields

✅ **Existing User Login**
- [ ] Login with existing user → No duplicate profile creation
- [ ] Profile existence check works → Fast login experience
- [ ] Cache prevents unnecessary Firestore reads

✅ **Error Handling**
- [ ] Network error during profile creation → Graceful handling
- [ ] Firestore permission denied → Proper error message
- [ ] Invalid user data → Validation errors shown

✅ **Security Rules**
- [ ] User can read own profile → ✅
- [ ] User cannot read other profiles → ❌ (unless admin/designer)
- [ ] User can update own profile → ✅ (limited fields)
- [ ] Admin can update any profile → ✅

## 🔒 Security Considerations

### Environment Variables

Ensure your Firebase configuration is properly secured:

```bash
# .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### Security Rules Testing

Test your security rules in the Firebase console:

1. Go to Firestore → Rules → Simulator
2. Test different scenarios:
   - Authenticated user reading own profile
   - Unauthenticated user trying to read profiles
   - Admin user accessing all profiles
   - Designer accessing other designer profiles

## 🛠️ Troubleshooting

### Common Issues

#### Issue: "Missing or insufficient permissions"
**Solution:** Check Firestore security rules are deployed correctly

#### Issue: "Profile creation loop"
**Solution:** Ensure `processingUsers` Set is working correctly

#### Issue: "Slow profile loading"
**Solution:** Check if caching is enabled and working

#### Issue: "User type not set correctly"
**Solution:** Review `determineUserType()` logic

### Debug Tools

Enable detailed logging:

```javascript
// Add to your app initialization
if (process.env.NODE_ENV === 'development') {
  // Enable Firestore debug logging
  // Note: This is for debugging only
}
```

### Performance Monitoring

Monitor profile creation performance:

```javascript
// Add performance tracking
const startTime = performance.now();
await AutoProfileService.handleUserProfileCreation(user);
const endTime = performance.now();
console.log(`Profile creation took ${endTime - startTime}ms`);
```

## 🚀 Advanced Features

### Custom Profile Fields

Add custom fields to user profiles:

```javascript
// Extend the UserProfileDocument interface
interface CustomUserProfile extends UserProfileDocument {
  company?: string;
  phone?: string;
  location?: string;
}
```

### Batch Profile Creation

For migrating existing users:

```javascript
import { getUsersByType } from './utils/firestoreHelpers';

async function migrateExistingUsers() {
  // Get all authenticated users without profiles
  // Create profiles in batches
}
```

### Real-time Profile Updates

Listen to profile changes in real-time:

```javascript
import { onSnapshot } from 'firebase/firestore';

const unsubscribe = onSnapshot(
  doc(db, 'users', user.uid),
  (doc) => {
    if (doc.exists()) {
      setUserProfile(doc.data());
    }
  }
);
```

## 📊 Monitoring & Analytics

### Profile Creation Metrics

Track important metrics:

- Profile creation success rate
- Average profile creation time
- User type distribution
- Authentication method usage

### Error Monitoring

Set up error tracking:

```javascript
// Example with Sentry
import * as Sentry from '@sentry/react';

try {
  await AutoProfileService.handleUserProfileCreation(user);
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## 🔄 Migration Guide

### From Existing Auth System

If you already have users without profiles:

1. **Backup existing data**
2. **Run migration script** to create profiles for existing users
3. **Update authentication flows** to use new system
4. **Test thoroughly** before deploying to production

### Migration Script Example

```javascript
async function migrateExistingUsers() {
  // This should be run as a one-time Cloud Function
  // or administrative script
  
  const users = await admin.auth().listUsers();
  
  for (const user of users.users) {
    await AutoProfileService.handleUserProfileCreation(user);
  }
}
```

## 📝 Best Practices

1. **Always handle errors gracefully**
2. **Use caching to improve performance**
3. **Monitor profile creation success rates**
4. **Keep security rules up to date**
5. **Test with different user scenarios**
6. **Document any customizations made**

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration
3. Test security rules in Firebase console
4. Review integration steps
5. Check network connectivity

---

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase SDK Reference](https://firebase.google.com/docs/reference/js)

This integration guide provides everything you need to implement automatic Firestore profile creation in your Firebase Authentication application. The system is production-ready and follows Firebase best practices for security, performance, and maintainability.
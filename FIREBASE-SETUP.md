# Firebase Authentication Setup

**Date:** 2025-12-30
**Status:** Code complete, needs Google OAuth enabled in Firebase Console

---

## What's Done

### Firebase Project Created
- **Project ID:** `ideaforge-app`
- **App ID:** `1:470269501322:web:c5051b0eae296b1976b273`
- **Firestore:** Initialized in `nam5` region
- **Hosting:** Configured for `dist/` folder

### Files Modified/Created

| File | Purpose |
|------|---------|
| `src/lib/firebase.js` | Firebase client initialization (Auth, Firestore) |
| `src/stores/useAuthStore.js` | Auth state (Firebase email/password + Google OAuth) |
| `src/services/projectService.js` | Project CRUD using Firestore |
| `src/components/auth/AuthCallback.jsx` | Updated for Firebase |
| `src/components/layout/Header.jsx` | Updated imports from supabase to firebase |
| `firestore.rules` | Security rules (users can only access own data) |
| `firestore.indexes.json` | Composite index for projects query |
| `.env` | Firebase configuration variables |
| `.env.example` | Updated with Firebase vars |

### Files Removed
| File | Reason |
|------|--------|
| `src/lib/supabase.js` | Replaced by Firebase |
| `HANDOFF-SUPABASE-AUTH.md` | No longer needed |

---

## One Manual Step Required

### Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/ideaforge-app/authentication/providers)
2. Click "Google" under Sign-in providers
3. Toggle "Enable"
4. Select a support email from the dropdown
5. Click "Save"

That's it! No OAuth credentials needed - Firebase handles everything.

---

## Firestore Data Structure

### `profiles/{userId}`
```javascript
{
  email: "user@example.com",
  fullName: "John Doe",
  avatarUrl: "https://...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `projects/{projectId}`
```javascript
{
  userId: "firebase-uid",
  name: "My Project",
  description: "Project description",
  appState: { /* IdeaForge main store state */ },
  designState: { /* Design studio store state */ },
  version: 1,
  sizeBytes: 12345,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastSavedAt: Timestamp
}
```

---

## Security Rules

Users can only read/write their own data:

```javascript
// profiles - users own their profile document (doc ID = userId)
match /profiles/{userId} {
  allow read, write: if auth.uid == userId;
}

// projects - users own projects where userId field matches
match /projects/{projectId} {
  allow read, write: if auth.uid == resource.data.userId;
}
```

---

## Testing

1. Run `npm run dev`
2. Open http://localhost:8000
3. Click "Sign In"
4. Test email/password signup
5. Test Google sign-in (after enabling in console)
6. Create/save/load projects

---

## Environment Variables

```env
VITE_FIREBASE_API_KEY=AIzaSyBnyhqKjib4_X8lYVWabaifxfjzNspqsWc
VITE_FIREBASE_AUTH_DOMAIN=ideaforge-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ideaforge-app
VITE_FIREBASE_STORAGE_BUCKET=ideaforge-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=470269501322
VITE_FIREBASE_APP_ID=1:470269501322:web:c5051b0eae296b1976b273
```

---

## Deployment

To deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore
```

To deploy to Firebase Hosting:
```bash
npm run build
firebase deploy --only hosting
```

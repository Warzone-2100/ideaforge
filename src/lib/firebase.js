import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigured) {
  console.warn(
    'Firebase credentials not found. Cloud features will be disabled.\n' +
    'To enable cloud features, add Firebase env vars to your .env file.'
  );
}

// Initialize Firebase only if configured
export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

// Configure Google provider for better UX
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

export const isFirebaseConfigured = () => !!app;

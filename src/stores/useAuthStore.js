import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isLoading: true,
  error: null,

  // Actions
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearError: () => set({ error: null }),

  // Initialize auth state
  initialize: async () => {
    if (!isFirebaseConfigured()) {
      set({ isLoading: false });
      return;
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure profile exists in Firestore
        await get()._ensureProfile(user);
      }
      set({
        user,
        isLoading: false,
      });
    });

    return () => unsubscribe();
  },

  // Create or update user profile in Firestore
  _ensureProfile: async (user) => {
    if (!db) return;

    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      // Create new profile
      await setDoc(profileRef, {
        email: user.email,
        fullName: user.displayName || '',
        avatarUrl: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Sign in with email/password
  signInWithEmail: async (email, password) => {
    if (!isFirebaseConfigured()) {
      set({ error: 'Cloud features not configured' });
      return { error: { message: 'Cloud features not configured' } };
    }

    set({ isLoading: true, error: null });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      set({ user: result.user, isLoading: false });
      return { data: result };
    } catch (error) {
      const message = get()._getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
      return { error: { message } };
    }
  },

  // Sign up with email/password
  signUpWithEmail: async (email, password, fullName = '') => {
    if (!isFirebaseConfigured()) {
      set({ error: 'Cloud features not configured' });
      return { error: { message: 'Cloud features not configured' } };
    }

    set({ isLoading: true, error: null });

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      if (fullName) {
        await updateProfile(result.user, { displayName: fullName });
      }

      // Create profile in Firestore
      await get()._ensureProfile(result.user);

      set({ user: result.user, isLoading: false });
      return { data: result };
    } catch (error) {
      const message = get()._getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
      return { error: { message } };
    }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    if (!isFirebaseConfigured()) {
      set({ error: 'Cloud features not configured' });
      return { error: { message: 'Cloud features not configured' } };
    }

    set({ isLoading: true, error: null });

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Create/update profile in Firestore
      await get()._ensureProfile(result.user);

      set({ user: result.user, isLoading: false });
      return { data: result };
    } catch (error) {
      const message = get()._getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
      return { error: { message } };
    }
  },

  // Sign out
  signOut: async () => {
    if (!isFirebaseConfigured()) return;

    set({ isLoading: true });

    try {
      await firebaseSignOut(auth);
      set({ user: null, isLoading: false, error: null });
    } catch (error) {
      const message = get()._getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
    }
  },

  // Password reset
  resetPassword: async (email) => {
    if (!isFirebaseConfigured()) {
      return { error: { message: 'Cloud features not configured' } };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      const message = get()._getFirebaseErrorMessage(error);
      return { error: { message } };
    }
  },

  // Computed helpers
  isAuthenticated: () => !!get().user,
  getUserDisplayName: () => {
    const user = get().user;
    if (!user) return null;
    return user.displayName || user.email?.split('@')[0] || 'User';
  },
  getUserAvatar: () => {
    const user = get().user;
    return user?.photoURL || null;
  },
  getUserEmail: () => {
    return get().user?.email || null;
  },
  getUserId: () => {
    return get().user?.uid || null;
  },

  // Helper to convert Firebase error codes to user-friendly messages
  _getFirebaseErrorMessage: (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign in was cancelled.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    return errorMessages[error.code] || error.message;
  },
}));

export default useAuthStore;

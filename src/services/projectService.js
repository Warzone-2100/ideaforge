import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import useAppStore from '../stores/useAppStore';
import useDesignStudioStore from '../stores/useDesignStudioStore';

const MAX_PROJECT_SIZE_MB = 5; // 5MB per project
const MAX_PROJECT_SIZE_BYTES = MAX_PROJECT_SIZE_MB * 1024 * 1024;

class ProjectService {
  /**
   * Get all projects for the current user
   */
  async listProjects() {
    if (!isFirebaseConfigured()) {
      return { data: [], error: { message: 'Cloud features not configured' } };
    }

    const user = auth.currentUser;
    if (!user) {
      return { data: [], error: { message: 'Not authenticated' } };
    }

    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        lastSavedAt: doc.data().lastSavedAt?.toDate?.()?.toISOString() || null,
      }));

      return { data, error: null };
    } catch (error) {
      console.error('Error listing projects:', error);
      return { data: [], error: { message: error.message } };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId) {
    if (!isFirebaseConfigured()) {
      return { data: null, error: { message: 'Cloud features not configured' } };
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      const snapshot = await getDoc(projectRef);

      if (!snapshot.exists()) {
        return { data: null, error: { message: 'Project not found' } };
      }

      const data = {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: snapshot.data().updatedAt?.toDate?.()?.toISOString() || null,
        lastSavedAt: snapshot.data().lastSavedAt?.toDate?.()?.toISOString() || null,
      };

      return { data, error: null };
    } catch (error) {
      console.error('Error getting project:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  /**
   * Create a new project from current state
   */
  async createProject(name, description = '') {
    if (!isFirebaseConfigured()) {
      return { data: null, error: { message: 'Cloud features not configured' } };
    }

    const user = auth.currentUser;
    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const appState = this._getAppStateForSave();
    const designState = this._getDesignStateForSave();

    // Check size
    const totalSize = JSON.stringify(appState).length + JSON.stringify(designState).length;
    if (totalSize > MAX_PROJECT_SIZE_BYTES) {
      return {
        data: null,
        error: { message: `Project too large (${(totalSize / 1024 / 1024).toFixed(2)}MB). Maximum ${MAX_PROJECT_SIZE_MB}MB.` }
      };
    }

    try {
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        userId: user.uid,
        name,
        description,
        appState,
        designState,
        version: 1,
        sizeBytes: totalSize,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      });

      // Fetch the created document to return
      const snapshot = await getDoc(docRef);
      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      };

      return { data, error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  /**
   * Update an existing project with current state
   */
  async saveProject(projectId, name = null) {
    if (!isFirebaseConfigured()) {
      return { data: null, error: { message: 'Cloud features not configured' } };
    }

    const appState = this._getAppStateForSave();
    const designState = this._getDesignStateForSave();

    // Check size
    const totalSize = JSON.stringify(appState).length + JSON.stringify(designState).length;
    if (totalSize > MAX_PROJECT_SIZE_BYTES) {
      return {
        data: null,
        error: { message: `Project too large (${(totalSize / 1024 / 1024).toFixed(2)}MB). Maximum ${MAX_PROJECT_SIZE_MB}MB.` }
      };
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      const updates = {
        appState,
        designState,
        sizeBytes: totalSize,
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      };

      if (name) {
        updates.name = name;
      }

      await updateDoc(projectRef, updates);

      // Fetch updated document
      const snapshot = await getDoc(projectRef);
      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      };

      return { data, error: null };
    } catch (error) {
      console.error('Error saving project:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  /**
   * Load a project into the stores
   */
  async loadProject(projectId) {
    const { data: project, error } = await this.getProject(projectId);

    if (error) {
      return { error };
    }

    // Load into app store
    if (project.appState) {
      this._loadAppState(project.appState);
    }

    // Load into design studio store
    if (project.designState) {
      this._loadDesignState(project.designState);
    }

    return { data: project };
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    if (!isFirebaseConfigured()) {
      return { error: { message: 'Cloud features not configured' } };
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      return { error: null };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { error: { message: error.message } };
    }
  }

  /**
   * Duplicate a project
   */
  async duplicateProject(projectId, newName) {
    const { data: original, error: fetchError } = await this.getProject(projectId);

    if (fetchError) {
      return { error: fetchError };
    }

    const user = auth.currentUser;
    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    try {
      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        userId: user.uid,
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        appState: original.appState,
        designState: original.designState,
        version: 1,
        sizeBytes: original.sizeBytes || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSavedAt: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      };

      return { data, error: null };
    } catch (error) {
      console.error('Error duplicating project:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  _getAppStateForSave() {
    const state = useAppStore.getState();
    // Extract only persistable data (exclude functions and transient state)
    return {
      research: state.research,
      insights: state.insights,
      features: state.features,
      prd: state.prd,
      databaseSchema: state.databaseSchema,
      apiEndpoints: state.apiEndpoints,
      componentTree: state.componentTree,
      currentStep: state.currentStep,
      designPreferences: state.designPreferences,
      designVariations: state.designVariations,
      agentPrompts: state.agentPrompts,
      storyFiles: state.storyFiles,
      chatMessages: state.chatMessages,
      exportFormat: state.exportFormat,
    };
  }

  _getDesignStateForSave() {
    const state = useDesignStudioStore.getState();
    // Extract only persistable data
    return {
      currentStep: state.currentStep,
      importedContext: state.importedContext,
      designApproach: state.designApproach,
      designLanguage: state.designLanguage,
      isLanguageFinalized: state.isLanguageFinalized,
      layouts: state.layouts,
      isLayoutsFinalized: state.isLayoutsFinalized,
      generations: state.generations,
      selectedVariations: state.selectedVariations,
      chatMessages: state.chatMessages,
      designTemplates: state.designTemplates,
      codeTemplate: state.codeTemplate,
      designIntent: state.designIntent,
      templateSelection: state.templateSelection,
      contentGeneration: state.contentGeneration,
      originalBrief: state.originalBrief,
      editedBrief: state.editedBrief,
      briefChatMessages: state.briefChatMessages,
      pagesData: state.pagesData,
      customTemplates: state.customTemplates,
      selectedTemplateId: state.selectedTemplateId,
      savedDesigns: state.savedDesigns,
      generatedVariations: state.generatedVariations,
    };
  }

  _loadAppState(savedState) {
    // Use Zustand's setState to merge the saved state
    useAppStore.setState(savedState);
  }

  _loadDesignState(savedState) {
    // Use Zustand's setState to merge the saved state
    useDesignStudioStore.setState(savedState);
  }
}

export const projectService = new ProjectService();

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBuiltInTemplates } from '../data/templates/builtInTemplates';

/**
 * Default page data structure
 */
const defaultPageData = {
  variations: [],
  selectedId: null,
  fullPage: null,
  isGenerating: false,
  isExpanding: false,
};

/**
 * Default page types
 */
const DEFAULT_PAGE_TYPES = [
  {
    id: 'landing',
    label: 'Landing Page',
    description: 'Marketing homepage with hero, features, and CTA',
    icon: 'Home',
    defaultSections: ['hero', 'features', 'pricing', 'testimonials', 'cta', 'footer'],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'App interface with data visualization and controls',
    icon: 'LayoutDashboard',
    defaultSections: ['header', 'sidebar', 'data-cards', 'charts', 'tables', 'filters'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'User preferences and configuration options',
    icon: 'Settings',
    defaultSections: ['header', 'nav', 'form-sections', 'toggles', 'save-actions'],
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'User identity, activity, and personal information',
    icon: 'User',
    defaultSections: ['header', 'avatar', 'bio', 'stats', 'activity-feed', 'edit-actions'],
  },
];

/**
 * Initial state with flat structure
 */
const initialState = {
  // === TEMPLATES ===
  customTemplates: [], // User-uploaded templates (built-in loaded via getBuiltInTemplates)
  selectedTemplateId: null,
  isUploadingTemplate: false,

  // === DESIGN BRIEF ===
  originalBrief: null, // AI-generated brief (immutable reference)
  editedBrief: null, // User-modified brief
  isEditingBrief: false, // Modal open state
  briefChatMessages: [], // Chat history for refinements

  // === PAGES ===
  currentPageId: 'landing',
  pageTypes: DEFAULT_PAGE_TYPES,
  pagesData: {
    landing: { ...defaultPageData },
    dashboard: { ...defaultPageData },
    settings: { ...defaultPageData },
    profile: { ...defaultPageData },
  },

  // === PREFERENCES ===
  sharedPreferences: {
    palette: null,
    style: null,
    references: [],
    mood: [],
  },
  pageOverrides: {
    landing: null,
    dashboard: null,
    settings: null,
    profile: null,
  },

  // === UI STATE ===
  activePanel: 'templates', // 'templates' | 'preferences' | 'variations'
  error: null,

  // === IMPORTED CONTEXT (from main flow) ===
  importedContext: null, // { research, insights, features, prd, importedAt }
};

/**
 * Design Studio Store
 *
 * Flat structure for easy state management and debugging.
 * Persists to separate localStorage key: 'ideaforge-design-studio'
 */
const useDesignStudioStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // TEMPLATE ACTIONS
      // ============================================

      /**
       * Select a template by ID (works for both built-in and custom)
       */
      selectTemplate: (templateId) => set({ selectedTemplateId: templateId }),

      /**
       * Clear template selection
       */
      clearTemplateSelection: () => set({ selectedTemplateId: null }),

      /**
       * Add a custom template to the library
       */
      addCustomTemplate: (template) => set((state) => ({
        customTemplates: [
          {
            id: crypto.randomUUID(),
            name: template.name,
            category: template.category,
            source: 'screenshot',
            uploadedAt: new Date().toISOString(),
            analysis: template.analysis,
            thumbnail: template.thumbnail,
            notes: template.notes || '',
            cost: template.cost || 0,
            model: template.model || 'gemini-3-flash',
            tokens: template.tokens || 0,
          },
          ...state.customTemplates,
        ],
        isUploadingTemplate: false,
      })),

      /**
       * Remove a custom template (cannot remove built-in)
       */
      removeCustomTemplate: (id) => set((state) => ({
        customTemplates: state.customTemplates.filter((t) => t.id !== id),
        selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId,
      })),

      /**
       * Set uploading state
       */
      setUploadingTemplate: (isUploading) => set({ isUploadingTemplate: isUploading }),

      /**
       * Get all templates (built-in + custom)
       */
      getAllTemplates: () => {
        const { customTemplates } = get();
        const builtIn = getBuiltInTemplates();
        return [...builtIn, ...customTemplates];
      },

      /**
       * Get currently selected template
       */
      getSelectedTemplate: () => {
        const { selectedTemplateId } = get();
        if (!selectedTemplateId) return null;
        const allTemplates = get().getAllTemplates();
        return allTemplates.find((t) => t.id === selectedTemplateId) || null;
      },

      // ============================================
      // DESIGN BRIEF ACTIONS
      // ============================================

      /**
       * Set the original AI-generated brief
       */
      setOriginalBrief: (brief) => set({ originalBrief: brief }),

      /**
       * Set the user-edited brief
       */
      setEditedBrief: (brief) => set({ editedBrief: brief }),

      /**
       * Reset edited brief to original
       */
      resetBriefToOriginal: () => set({ editedBrief: null }),

      /**
       * Toggle brief editor modal
       */
      toggleBriefEditor: () => set((state) => ({ isEditingBrief: !state.isEditingBrief })),

      /**
       * Set brief editor state explicitly
       */
      setEditingBrief: (isEditing) => set({ isEditingBrief: isEditing }),

      /**
       * Add a chat message to brief refinement history
       */
      addBriefChatMessage: (content, role = 'user') => set((state) => ({
        briefChatMessages: [
          ...state.briefChatMessages,
          { role, content, timestamp: new Date().toISOString() },
        ],
      })),

      /**
       * Clear brief chat history
       */
      clearBriefChat: () => set({ briefChatMessages: [] }),

      /**
       * Get the active design brief (edited or original)
       */
      getActiveDesignBrief: () => {
        const { editedBrief, originalBrief } = get();
        return editedBrief || originalBrief;
      },

      // ============================================
      // PAGE ACTIONS
      // ============================================

      /**
       * Set current active page
       */
      setCurrentPage: (pageId) => set({ currentPageId: pageId }),

      /**
       * Set variations for a specific page
       */
      setPageVariations: (pageId, variations) => set((state) => ({
        pagesData: {
          ...state.pagesData,
          [pageId]: {
            ...(state.pagesData[pageId] || defaultPageData),
            variations,
            isGenerating: false,
          },
        },
      })),

      /**
       * Select a variation for a page
       */
      selectPageVariation: (pageId, variationId) => set((state) => ({
        pagesData: {
          ...state.pagesData,
          [pageId]: {
            ...(state.pagesData[pageId] || defaultPageData),
            selectedId: variationId,
            fullPage: null, // Clear full page when selecting new variation
          },
        },
      })),

      /**
       * Set full page HTML for a page
       */
      setPageFullPage: (pageId, fullPage) => set((state) => ({
        pagesData: {
          ...state.pagesData,
          [pageId]: {
            ...(state.pagesData[pageId] || defaultPageData),
            fullPage,
            isExpanding: false,
          },
        },
      })),

      /**
       * Set generating state for a page
       */
      setPageGenerating: (pageId, isGenerating) => set((state) => ({
        pagesData: {
          ...state.pagesData,
          [pageId]: {
            ...(state.pagesData[pageId] || defaultPageData),
            isGenerating,
          },
        },
      })),

      /**
       * Set expanding state for a page
       */
      setPageExpanding: (pageId, isExpanding) => set((state) => ({
        pagesData: {
          ...state.pagesData,
          [pageId]: {
            ...(state.pagesData[pageId] || defaultPageData),
            isExpanding,
          },
        },
      })),

      /**
       * Get current page data
       */
      getCurrentPageData: () => {
        const { currentPageId, pagesData } = get();
        return pagesData[currentPageId] || defaultPageData;
      },

      /**
       * Get selected variation for current page
       */
      getSelectedVariation: () => {
        const pageData = get().getCurrentPageData();
        if (!pageData.selectedId || !pageData.variations.length) return null;
        return pageData.variations.find((v) => v.id === pageData.selectedId) || null;
      },

      // ============================================
      // PREFERENCES ACTIONS
      // ============================================

      /**
       * Set shared preferences
       */
      setSharedPreferences: (preferences) => set((state) => ({
        sharedPreferences: { ...state.sharedPreferences, ...preferences },
      })),

      /**
       * Set page-specific override preferences
       */
      setPageOverride: (pageId, preferences) => set((state) => ({
        pageOverrides: { ...state.pageOverrides, [pageId]: preferences },
      })),

      /**
       * Clear page-specific override
       */
      clearPageOverride: (pageId) => set((state) => ({
        pageOverrides: { ...state.pageOverrides, [pageId]: null },
      })),

      /**
       * Get effective preferences for a page (override or shared)
       */
      getEffectivePreferences: (pageId) => {
        const { sharedPreferences, pageOverrides } = get();
        return pageOverrides[pageId] || sharedPreferences;
      },

      // ============================================
      // UI ACTIONS
      // ============================================

      /**
       * Set active panel
       */
      setActivePanel: (panel) => set({ activePanel: panel }),

      /**
       * Set error state
       */
      setError: (error) => set({ error }),

      /**
       * Clear error
       */
      clearError: () => set({ error: null }),

      // ============================================
      // IMPORT/EXPORT ACTIONS
      // ============================================

      /**
       * Import context from main flow
       */
      importContext: (context) => set({
        importedContext: {
          ...context,
          importedAt: new Date().toISOString(),
        },
      }),

      /**
       * Clear imported context
       */
      clearImportedContext: () => set({ importedContext: null }),

      /**
       * Export current design data for main flow
       */
      exportDesignData: () => {
        const state = get();
        return {
          designBrief: state.getActiveDesignBrief(),
          pages: Object.entries(state.pagesData)
            .filter(([_, page]) => page.fullPage)
            .map(([pageId, page]) => ({
              pageId,
              fullPage: page.fullPage,
              selectedVariation: page.variations.find((v) => v.id === page.selectedId),
            })),
          preferences: state.sharedPreferences,
          exportedAt: new Date().toISOString(),
        };
      },

      // ============================================
      // RESET ACTIONS
      // ============================================

      /**
       * Reset all design data (keep templates)
       */
      resetDesignData: () => set({
        originalBrief: null,
        editedBrief: null,
        isEditingBrief: false,
        briefChatMessages: [],
        currentPageId: 'landing',
        pagesData: {
          landing: { ...defaultPageData },
          dashboard: { ...defaultPageData },
          settings: { ...defaultPageData },
          profile: { ...defaultPageData },
        },
        sharedPreferences: {
          palette: null,
          style: null,
          references: [],
          mood: [],
        },
        pageOverrides: {
          landing: null,
          dashboard: null,
          settings: null,
          profile: null,
        },
        error: null,
      }),

      /**
       * Full reset (including templates)
       */
      resetAll: () => set(initialState),
    }),
    {
      name: 'ideaforge-design-studio',
      version: 1,
      partialize: (state) => ({
        // Persist everything except UI state
        customTemplates: state.customTemplates,
        selectedTemplateId: state.selectedTemplateId,
        originalBrief: state.originalBrief,
        editedBrief: state.editedBrief,
        briefChatMessages: state.briefChatMessages,
        currentPageId: state.currentPageId,
        pagesData: state.pagesData,
        sharedPreferences: state.sharedPreferences,
        pageOverrides: state.pageOverrides,
        importedContext: state.importedContext,
        // Don't persist: isUploadingTemplate, isEditingBrief, activePanel, error, pageTypes
      }),
      onRehydrateStorage: () => (state) => {
        // Auto-migrate from old store if this store is empty
        if (state && !state.originalBrief && !state.customTemplates?.length) {
          try {
            const oldStorage = localStorage.getItem('ideaforge-storage');
            if (oldStorage) {
              const oldData = JSON.parse(oldStorage);
              const oldDesign = oldData?.state?.designVariations;

              if (oldDesign && (oldDesign.designBrief || oldDesign.templateLibrary?.length)) {
                console.log('[Design Studio] Migrating from old store format...');

                // Transform old nested structure to new flat structure
                const migratedState = migrateFromOldFormat(oldDesign);

                // Apply migrated state
                Object.assign(state, migratedState);

                console.log('[Design Studio] Migration complete');
              }
            }
          } catch (error) {
            console.error('[Design Studio] Migration failed:', error);
          }
        }
      },
    }
  )
);

/**
 * Migrate from old nested designVariations format to new flat format
 */
function migrateFromOldFormat(oldDesign) {
  const migrated = {};

  // Templates
  migrated.customTemplates = oldDesign.templateLibrary || [];
  migrated.selectedTemplateId = oldDesign.selectedTemplateId || null;

  // Brief
  migrated.originalBrief = oldDesign.designBrief || null;
  migrated.editedBrief = oldDesign.editedDesignBrief || null;
  migrated.briefChatMessages = oldDesign.briefChatMessages || [];

  // Pages
  migrated.currentPageId = oldDesign.currentPage || 'landing';

  // Transform pages data
  const oldPages = oldDesign.pages || {};
  migrated.pagesData = {
    landing: transformPageData(oldPages.landing),
    dashboard: transformPageData(oldPages.dashboard),
    settings: transformPageData(oldPages.settings),
    profile: transformPageData(oldPages.profile),
  };

  // Handle legacy single-page format (pre-multi-page)
  if (!oldPages.landing?.variations?.length && oldDesign.variations?.length) {
    migrated.pagesData.landing = {
      variations: oldDesign.variations,
      selectedId: oldDesign.selected?.id || null,
      fullPage: oldDesign.homepage || null,
      isGenerating: false,
      isExpanding: false,
    };
  }

  // Preferences
  migrated.sharedPreferences = oldDesign.sharedPreferences || {
    palette: null,
    style: null,
    references: [],
    mood: [],
  };

  // Page overrides
  migrated.pageOverrides = {
    landing: oldPages.landing?.overridePreferences || null,
    dashboard: oldPages.dashboard?.overridePreferences || null,
    settings: oldPages.settings?.overridePreferences || null,
    profile: oldPages.profile?.overridePreferences || null,
  };

  return migrated;
}

/**
 * Transform old page data to new format
 */
function transformPageData(oldPage) {
  if (!oldPage) return { ...defaultPageData };

  return {
    variations: oldPage.variations || [],
    selectedId: oldPage.selected?.id || null,
    fullPage: oldPage.fullPage || null,
    isGenerating: false,
    isExpanding: false,
  };
}

export default useDesignStudioStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Current step in the workflow
      currentStep: 'research', // 'research' | 'analysis' | 'features' | 'prd' | 'prompts' | 'design' | 'stories' | 'export'

      // Research data
      research: {
        content: '',
        fileName: null,
        uploadedAt: null,
      },

      // AI-extracted insights
      insights: {
        marketInsights: [],
        competitorGaps: [],
        painPoints: [],
        technicalRequirements: [],
        successMetrics: [],
        isAnalyzed: false,
        isAnalyzing: false,
      },

      // Generated features
      features: {
        items: [],
        isGenerating: false,
      },

      // Product Requirements Document
      prd: {
        content: null,
        sections: {
          overview: '',
          userPersonas: '',
          features: '',
          technicalRequirements: '',
          uiGuidelines: '',
          outOfScope: '',
        },
        isGenerating: false,
      },

      // NEW: Database Schema Specification
      databaseSchema: {
        content: null,
        isGenerating: false,
      },

      // NEW: API Endpoints Specification
      apiEndpoints: {
        content: null,
        isGenerating: false,
      },

      // NEW: Component Tree Specification
      componentTree: {
        content: null,
        isGenerating: false,
      },

      // Export settings
      exportFormat: 'claude', // 'claude' | 'cursor' | 'gemini' | 'universal'

      // Chat messages for refinement
      chatMessages: [],

      // Design Preferences (Step 6 - before generating design brief)
      designPreferences: {
        palette: null,        // 'warm' | 'cool' | 'neutral' | 'vibrant' | { hex1, hex2, ... }
        style: null,          // 'minimal' | 'modern' | 'playful' | 'professional' | 'bold'
        references: [],       // ['Linear', 'Notion', 'Stripe', ...] product references
        mood: [],             // ['calm', 'energetic', 'luxurious', ...]
      },

      // Design Variations (Step 6) - Multi-Page Architecture
      designVariations: {
        designBrief: null,    // AI-generated design brief (shared across pages)
        editedDesignBrief: null,  // User-refined design brief (NEW)
        isEditingBrief: false,    // Toggle for design system editor modal (NEW)
        briefChatMessages: [],    // Chat history for design system edits (NEW)
        sharedPreferences: {  // Shared design preferences
          palette: null,
          style: null,
          references: [],
          mood: [],
        },
        currentPage: 'landing', // Active page type
        pages: {              // Page-specific data
          landing: {
            variations: [],
            selected: null,
            fullPage: null,
            isGenerating: false,
            isExpanding: false,
            overridePreferences: null, // null = use shared preferences
          },
          dashboard: {
            variations: [],
            selected: null,
            fullPage: null,
            isGenerating: false,
            isExpanding: false,
            overridePreferences: null,
          },
          settings: {
            variations: [],
            selected: null,
            fullPage: null,
            isGenerating: false,
            isExpanding: false,
            overridePreferences: null,
          },
          profile: {
            variations: [],
            selected: null,
            fullPage: null,
            isGenerating: false,
            isExpanding: false,
            overridePreferences: null,
          },
        },
        pageTypes: [
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
            description: 'Main app interface with data visualization',
            icon: 'LayoutDashboard',
            defaultSections: ['header', 'sidebar', 'main-content', 'data-cards', 'charts'],
          },
          {
            id: 'settings',
            label: 'Settings',
            description: 'User preferences and configuration',
            icon: 'Settings',
            defaultSections: ['header', 'sidebar-nav', 'form-sections', 'save-actions'],
          },
          {
            id: 'profile',
            label: 'Profile',
            description: 'User profile and activity',
            icon: 'User',
            defaultSections: ['header', 'avatar', 'info-cards', 'activity-feed', 'stats'],
          },
        ],
        // Legacy fields for backward compatibility
        variations: [],
        selected: null,
        homepage: null,
        isGenerating: false,
        isExpanding: false,
      },

      // Agent Prompts (Step 5)
      agentPrompts: {
        claude: null,         // CLAUDE.md content
        cursor: null,         // .cursorrules content
        gemini: null,         // GEMINI.md content
        universal: null,      // AGENTS.md content
        isGenerating: false,  // Loading state
      },

      // Story Files (Step 7)
      storyFiles: {
        files: [],            // Array of story file objects
        isGenerating: false,  // Loading state
      },

      // Usage tracking (for development/monitoring)
      usageTracking: {
        enabled: true,
        sessionTotal: {
          requests: 0,
          tokens: 0,
          cost: 0,
        },
        byTask: {
          analysis: { requests: 0, tokens: 0, cost: 0 },
          features: { requests: 0, tokens: 0, cost: 0 },
          refineFeatures: { requests: 0, tokens: 0, cost: 0 },
          prd: { requests: 0, tokens: 0, cost: 0 },
          databaseSchema: { requests: 0, tokens: 0, cost: 0 },
          apiEndpoints: { requests: 0, tokens: 0, cost: 0 },
          componentTree: { requests: 0, tokens: 0, cost: 0 },
          storyFiles: { requests: 0, tokens: 0, cost: 0 },
          designBrief: { requests: 0, tokens: 0, cost: 0 },
          designVariations: { requests: 0, tokens: 0, cost: 0 },
          expandHomepage: { requests: 0, tokens: 0, cost: 0 },
          chatWithExport: { requests: 0, tokens: 0, cost: 0 },
          export: { requests: 0, tokens: 0, cost: 0 },
        },
        history: [], // Last 20 requests with details
      },

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      setResearch: (content, fileName = null) => set({
        research: {
          content,
          fileName,
          uploadedAt: new Date().toISOString(),
        },
        // Reset downstream data when research changes
        insights: {
          marketInsights: [],
          competitorGaps: [],
          painPoints: [],
          technicalRequirements: [],
          successMetrics: [],
          isAnalyzed: false,
          isAnalyzing: false,
        },
        features: { items: [], isGenerating: false },
        prd: {
          content: null,
          sections: {
            overview: '',
            userPersonas: '',
            features: '',
            technicalRequirements: '',
            uiGuidelines: '',
            outOfScope: '',
          },
          isGenerating: false,
        },
      }),

      clearResearch: () => set({
        research: { content: '', fileName: null, uploadedAt: null },
        insights: {
          marketInsights: [],
          competitorGaps: [],
          painPoints: [],
          technicalRequirements: [],
          successMetrics: [],
          isAnalyzed: false,
          isAnalyzing: false,
        },
        features: { items: [], isGenerating: false },
        prd: {
          content: null,
          sections: {
            overview: '',
            userPersonas: '',
            features: '',
            technicalRequirements: '',
            uiGuidelines: '',
            outOfScope: '',
          },
          isGenerating: false,
        },
        // Clear new steps (Agent Prompts, Design Studio, Story Files)
        agentPrompts: {
          claude: null,
          cursor: null,
          gemini: null,
          universal: null,
          isGenerating: false,
        },
        designPreferences: {
          palette: 'cool',
          style: 'minimal',
          references: [],
          mood: [],
        },
        designVariations: {
          designBrief: null,
          variations: [],
          selected: null,
          homepage: null,
          isGenerating: false,
          isExpanding: false,
        },
        storyFiles: {
          files: [],
          isGenerating: false,
        },
        chatMessages: [],
        currentStep: 'research',
      }),

      setInsights: (insights) => set((state) => ({
        insights: { ...state.insights, ...insights, isAnalyzed: true, isAnalyzing: false },
      })),

      setAnalyzing: (isAnalyzing) => set((state) => ({
        insights: { ...state.insights, isAnalyzing },
      })),

      setFeatures: (items) => set((state) => ({
        features: { ...state.features, items, isGenerating: false },
      })),

      updateFeature: (id, updates) => set((state) => ({
        features: {
          ...state.features,
          items: state.features.items.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        },
      })),

      addFeature: (feature) => set((state) => ({
        features: {
          ...state.features,
          items: [...state.features.items, { ...feature, id: crypto.randomUUID() }],
        },
      })),

      removeFeature: (id) => set((state) => ({
        features: {
          ...state.features,
          items: state.features.items.filter((f) => f.id !== id),
        },
      })),

      setFeaturesGenerating: (isGenerating) => set((state) => ({
        features: { ...state.features, isGenerating },
      })),

      setPRD: (prd) => set((state) => ({
        prd: { ...state.prd, ...prd, isGenerating: false },
      })),

      updatePRDSection: (section, content) => set((state) => ({
        prd: {
          ...state.prd,
          sections: { ...state.prd.sections, [section]: content },
        },
      })),

      // NEW: Setters for specification documents
      setDatabaseSchema: (content) => set((state) => ({
        databaseSchema: { ...state.databaseSchema, content, isGenerating: false },
      })),

      setApiEndpoints: (content) => set((state) => ({
        apiEndpoints: { ...state.apiEndpoints, content, isGenerating: false },
      })),

      setComponentTree: (content) => set((state) => ({
        componentTree: { ...state.componentTree, content, isGenerating: false },
      })),

      setDatabaseSchemaGenerating: (isGenerating) => set((state) => ({
        databaseSchema: { ...state.databaseSchema, isGenerating },
      })),

      setApiEndpointsGenerating: (isGenerating) => set((state) => ({
        apiEndpoints: { ...state.apiEndpoints, isGenerating },
      })),

      setComponentTreeGenerating: (isGenerating) => set((state) => ({
        componentTree: { ...state.componentTree, isGenerating },
      })),

      setPRDGenerating: (isGenerating) => set((state) => ({
        prd: { ...state.prd, isGenerating },
      })),

      setExportFormat: (format) => set({ exportFormat: format }),

      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        }],
      })),

      clearChatMessages: () => set({ chatMessages: [] }),

      // Design Variations actions
      setDesignBrief: (designBrief) => set((state) => ({
        designVariations: { ...state.designVariations, designBrief },
      })),

      // Design System Editor Actions (NEW)
      setEditedDesignBrief: (editedDesignBrief) => set((state) => ({
        designVariations: { ...state.designVariations, editedDesignBrief },
      })),

      toggleBriefEditor: () => set((state) => ({
        designVariations: {
          ...state.designVariations,
          isEditingBrief: !state.designVariations.isEditingBrief
        },
      })),

      setEditingBrief: (isEditing) => set((state) => ({
        designVariations: { ...state.designVariations, isEditingBrief: isEditing },
      })),

      addBriefChatMessage: (message, role = 'user') => set((state) => ({
        designVariations: {
          ...state.designVariations,
          briefChatMessages: [
            ...(state.designVariations.briefChatMessages || []),
            { role, content: message, timestamp: new Date().toISOString() },
          ],
        },
      })),

      clearBriefChat: () => set((state) => ({
        designVariations: { ...state.designVariations, briefChatMessages: [] },
      })),

      resetEditedBrief: () => set((state) => ({
        designVariations: { ...state.designVariations, editedDesignBrief: null },
      })),

      getActiveDesignBrief: () => {
        const { designVariations } = get();
        return designVariations.editedDesignBrief || designVariations.designBrief;
      },

      // Multi-Page Design Actions
      setCurrentPage: (pageId) => set((state) => ({
        designVariations: { ...state.designVariations, currentPage: pageId },
      })),

      setPageVariations: (pageId, variations) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          pages: {
            ...state.designVariations.pages,
            [pageId]: {
              ...state.designVariations.pages[pageId],
              variations,
              isGenerating: false,
            },
          },
        },
      })),

      setPageGenerating: (pageId, isGenerating) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          pages: {
            ...state.designVariations.pages,
            [pageId]: {
              ...state.designVariations.pages[pageId],
              isGenerating,
            },
          },
        },
      })),

      selectPageVariation: (pageId, variation) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          pages: {
            ...state.designVariations.pages,
            [pageId]: {
              ...state.designVariations.pages[pageId],
              selected: variation,
              fullPage: null, // Clear full page when selecting new variation
            },
          },
        },
      })),

      setPageFullPage: (pageId, fullPage) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          pages: {
            ...state.designVariations.pages,
            [pageId]: {
              ...state.designVariations.pages[pageId],
              fullPage,
              isExpanding: false,
            },
          },
        },
      })),

      setPageExpanding: (pageId, isExpanding) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          pages: {
            ...state.designVariations.pages,
            [pageId]: {
              ...state.designVariations.pages[pageId],
              isExpanding,
            },
          },
        },
      })),

      setPageOverridePreferences: (pageId, preferences) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          pages: {
            ...state.designVariations.pages,
            [pageId]: {
              ...state.designVariations.pages[pageId],
              overridePreferences: preferences,
            },
          },
        },
      })),

      setSharedPreferences: (preferences) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          sharedPreferences: { ...state.designVariations.sharedPreferences, ...preferences },
        },
      })),

      getEffectivePreferences: (pageId) => {
        const { designVariations } = get();
        const pages = designVariations?.pages || {};
        const sharedPreferences = designVariations?.sharedPreferences || { palette: null, style: null, references: [], mood: [] };
        const page = pages[pageId];
        return page?.overridePreferences || sharedPreferences;
      },

      // Legacy actions for backward compatibility
      setDesignVariations: (variations) => set((state) => {
        const currentPage = state.designVariations.currentPage;
        return {
          designVariations: {
            ...state.designVariations,
            variations,
            isGenerating: false,
            pages: {
              ...state.designVariations.pages,
              [currentPage]: {
                ...state.designVariations.pages[currentPage],
                variations,
                isGenerating: false,
              },
            },
          },
        };
      }),

      setGeneratingVariations: (isGenerating) => set((state) => {
        const currentPage = state.designVariations.currentPage;
        return {
          designVariations: {
            ...state.designVariations,
            isGenerating,
            pages: {
              ...state.designVariations.pages,
              [currentPage]: {
                ...state.designVariations.pages[currentPage],
                isGenerating,
              },
            },
          },
        };
      }),

      selectVariation: (variation) => set((state) => {
        const currentPage = state.designVariations.currentPage;
        return {
          designVariations: {
            ...state.designVariations,
            selected: variation,
            homepage: null,
            pages: {
              ...state.designVariations.pages,
              [currentPage]: {
                ...state.designVariations.pages[currentPage],
                selected: variation,
                fullPage: null,
              },
            },
          },
        };
      }),

      setHomepage: (homepage) => set((state) => {
        const currentPage = state.designVariations.currentPage;
        return {
          designVariations: {
            ...state.designVariations,
            homepage,
            isExpanding: false,
            pages: {
              ...state.designVariations.pages,
              [currentPage]: {
                ...state.designVariations.pages[currentPage],
                fullPage: homepage,
                isExpanding: false,
              },
            },
          },
        };
      }),

      setExpandingHomepage: (isExpanding) => set((state) => {
        const currentPage = state.designVariations.currentPage;
        return {
          designVariations: {
            ...state.designVariations,
            isExpanding,
            pages: {
              ...state.designVariations.pages,
              [currentPage]: {
                ...state.designVariations.pages[currentPage],
                isExpanding,
              },
            },
          },
        };
      }),

      clearDesignVariations: () => set((state) => ({
        designVariations: {
          variations: [],
          selected: null,
          homepage: null,
          designBrief: null,
          editedDesignBrief: null,  // NEW
          isEditingBrief: false,     // NEW
          briefChatMessages: [],      // NEW
          isGenerating: false,
          isExpanding: false,
          sharedPreferences: {
            palette: null,
            style: null,
            references: [],
            mood: [],
          },
          currentPage: 'landing',
          pages: {
            landing: {
              variations: [],
              selected: null,
              fullPage: null,
              isGenerating: false,
              isExpanding: false,
              overridePreferences: null,
            },
            dashboard: {
              variations: [],
              selected: null,
              fullPage: null,
              isGenerating: false,
              isExpanding: false,
              overridePreferences: null,
            },
            settings: {
              variations: [],
              selected: null,
              fullPage: null,
              isGenerating: false,
              isExpanding: false,
              overridePreferences: null,
            },
            profile: {
              variations: [],
              selected: null,
              fullPage: null,
              isGenerating: false,
              isExpanding: false,
              overridePreferences: null,
            },
          },
          pageTypes: state.designVariations.pageTypes,
        },
      })),

      // Design Preferences actions
      setDesignPreferences: (preferences) => set((state) => ({
        designPreferences: { ...state.designPreferences, ...preferences },
      })),

      clearDesignPreferences: () => set({
        designPreferences: {
          palette: null,
          style: null,
          references: [],
          mood: [],
        },
      }),

      // Agent Prompts actions
      setAgentPrompt: (format, content) => set((state) => ({
        agentPrompts: {
          ...state.agentPrompts,
          [format]: content,
        },
      })),

      setAgentPrompts: (prompts) => set((state) => ({
        agentPrompts: {
          ...state.agentPrompts,
          ...prompts,
          isGenerating: false,
        },
      })),

      setGeneratingAgentPrompts: (isGenerating) => set((state) => ({
        agentPrompts: { ...state.agentPrompts, isGenerating },
      })),

      clearAgentPrompts: () => set({
        agentPrompts: {
          claude: null,
          cursor: null,
          gemini: null,
          universal: null,
          isGenerating: false,
        },
      }),

      // Story Files actions
      setStoryFiles: (files) => set((state) => ({
        storyFiles: {
          ...state.storyFiles,
          files,
          isGenerating: false,
        },
      })),

      setGeneratingStoryFiles: (isGenerating) => set((state) => ({
        storyFiles: { ...state.storyFiles, isGenerating },
      })),

      clearStoryFiles: () => set({
        storyFiles: {
          files: [],
          isGenerating: false,
        },
      }),

      // Usage tracking actions
      addUsageRecord: (taskName, meta) => set((state) => {
        if (!state.usageTracking.enabled || !meta) return {};

        const { model, tokens, cost } = meta;

        // Update by-task stats
        const taskStats = state.usageTracking.byTask[taskName] || { requests: 0, tokens: 0, cost: 0 };
        const updatedTaskStats = {
          requests: taskStats.requests + 1,
          tokens: taskStats.tokens + tokens,
          cost: taskStats.cost + cost,
        };

        // Update session total
        const updatedSessionTotal = {
          requests: state.usageTracking.sessionTotal.requests + 1,
          tokens: state.usageTracking.sessionTotal.tokens + tokens,
          cost: state.usageTracking.sessionTotal.cost + cost,
        };

        // Add to history (keep last 20)
        const newRecord = {
          id: crypto.randomUUID(),
          task: taskName,
          model,
          tokens,
          cost,
          timestamp: meta.timestamp || new Date().toISOString(),
        };
        const updatedHistory = [newRecord, ...state.usageTracking.history].slice(0, 20);

        return {
          usageTracking: {
            ...state.usageTracking,
            sessionTotal: updatedSessionTotal,
            byTask: {
              ...state.usageTracking.byTask,
              [taskName]: updatedTaskStats,
            },
            history: updatedHistory,
          },
        };
      }),

      clearUsageTracking: () => set((state) => ({
        usageTracking: {
          ...state.usageTracking,
          sessionTotal: { requests: 0, tokens: 0, cost: 0 },
          byTask: {
            analysis: { requests: 0, tokens: 0, cost: 0 },
            features: { requests: 0, tokens: 0, cost: 0 },
            refineFeatures: { requests: 0, tokens: 0, cost: 0 },
            prd: { requests: 0, tokens: 0, cost: 0 },
            storyFiles: { requests: 0, tokens: 0, cost: 0 },
            designBrief: { requests: 0, tokens: 0, cost: 0 },
            designVariations: { requests: 0, tokens: 0, cost: 0 },
            expandHomepage: { requests: 0, tokens: 0, cost: 0 },
            chatWithExport: { requests: 0, tokens: 0, cost: 0 },
            export: { requests: 0, tokens: 0, cost: 0 },
          },
          history: [],
        },
      })),

      toggleUsageTracking: () => set((state) => ({
        usageTracking: {
          ...state.usageTracking,
          enabled: !state.usageTracking.enabled,
        },
      })),

      // Computed helpers
      canProceedToAnalysis: () => {
        const { research } = get();
        return research.content.trim().length > 100;
      },

      canProceedToFeatures: () => {
        const { insights } = get();
        return insights.isAnalyzed;
      },

      canProceedToPRD: () => {
        const { features } = get();
        return features.items.some((f) => f.status === 'accepted');
      },

      canProceedToPrompts: () => {
        const { prd } = get();
        return prd.content || Object.values(prd.sections).some((s) => s.trim());
      },

      canProceedToDesign: () => {
        // Can proceed to design after prompts (prompts are optional)
        return true;
      },

      canProceedToStories: () => {
        // Can proceed to stories after design (design is optional)
        return true;
      },

      canProceedToExport: () => {
        // Can always export (all previous steps optional)
        return true;
      },

      // Get accepted features
      getAcceptedFeatures: () => {
        const { features } = get();
        return features.items.filter((f) => f.status === 'accepted');
      },
    }),
    {
      name: 'ideaforge-storage',
      version: 2, // Increment when state structure changes
      partialize: (state) => ({
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
      }),
      // Migrate old state structure to new multi-page structure
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Migrate from old single-page to new multi-page structure
          const oldDesign = persistedState.designVariations || {};
          const defaultPage = {
            variations: [],
            selected: null,
            fullPage: null,
            isGenerating: false,
            isExpanding: false,
            overridePreferences: null,
          };

          persistedState.designVariations = {
            designBrief: oldDesign.designBrief || null,
            editedDesignBrief: null,  // NEW
            isEditingBrief: false,     // NEW
            briefChatMessages: [],      // NEW
            sharedPreferences: {
              palette: null,
              style: null,
              references: [],
              mood: [],
            },
            currentPage: 'landing',
            pages: {
              landing: {
                ...defaultPage,
                variations: oldDesign.variations || [],
                selected: oldDesign.selected || null,
                fullPage: oldDesign.homepage || null,
              },
              dashboard: { ...defaultPage },
              settings: { ...defaultPage },
              profile: { ...defaultPage },
            },
            pageTypes: [
              { id: 'landing', label: 'Landing Page', description: 'Marketing homepage with hero, features, and CTA', icon: 'Home', defaultSections: ['hero', 'features', 'pricing', 'testimonials', 'cta', 'footer'] },
              { id: 'dashboard', label: 'Dashboard', description: 'App interface with data visualization and controls', icon: 'LayoutDashboard', defaultSections: ['header', 'sidebar', 'data-cards', 'charts', 'tables', 'filters'] },
              { id: 'settings', label: 'Settings', description: 'User preferences and configuration options', icon: 'Settings', defaultSections: ['header', 'nav', 'form-sections', 'toggles', 'save-actions'] },
              { id: 'profile', label: 'Profile', description: 'User identity, activity, and personal information', icon: 'User', defaultSections: ['header', 'avatar', 'bio', 'stats', 'activity-feed', 'edit-actions'] },
            ],
          };
        }
        return persistedState;
      },
    }
  )
);

export default useAppStore;

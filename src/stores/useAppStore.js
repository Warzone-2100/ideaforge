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

      // Design Variations (Step 6)
      designVariations: {
        variations: [],       // Array of 3 generated variations
        selected: null,       // Selected variation object
        homepage: null,       // Expanded homepage HTML/CSS/JS
        designBrief: null,    // Stored design brief for variations
        isGenerating: false,  // Loading state for variations
        isExpanding: false,   // Loading state for expansion
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

      setDesignVariations: (variations) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          variations,
          isGenerating: false,
        },
      })),

      setGeneratingVariations: (isGenerating) => set((state) => ({
        designVariations: { ...state.designVariations, isGenerating },
      })),

      selectVariation: (variation) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          selected: variation,
          homepage: null, // Clear homepage when selecting new variation
        },
      })),

      setHomepage: (homepage) => set((state) => ({
        designVariations: {
          ...state.designVariations,
          homepage,
          isExpanding: false,
        },
      })),

      setExpandingHomepage: (isExpanding) => set((state) => ({
        designVariations: { ...state.designVariations, isExpanding },
      })),

      clearDesignVariations: () => set((state) => ({
        designVariations: {
          variations: [],
          selected: null,
          homepage: null,
          designBrief: null,
          isGenerating: false,
          isExpanding: false,
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
      partialize: (state) => ({
        research: state.research,
        insights: state.insights,
        features: state.features,
        prd: state.prd,
        currentStep: state.currentStep,
        designPreferences: state.designPreferences,
        designVariations: state.designVariations,
        agentPrompts: state.agentPrompts,
        storyFiles: state.storyFiles,
      }),
    }
  )
);

export default useAppStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TOKENS } from '../data/design/designPresets';
import { LAYOUT_TEMPLATES } from '../data/design/layoutTemplates';

// ============================================================================
// DESIGN STUDIO STORE - V2.1 (PRD-First Architecture)
// ============================================================================
//
// Key principle: PRD is ALWAYS the foundation. Design approach is how you STYLE it.
//
// 4-Step Workflow:
//   Step 1: CONTEXT    - Import PRD context (REQUIRED)
//   Step 2: LANGUAGE   - Choose approach + define design tokens
//   Step 3: LAYOUTS    - Pick structural layouts per page type
//   Step 4: GENERATE   - Generate variations and export
//
// Design Approach Options (Step 2):
//   - "generate"  → AI creates tokens based on PRD analysis
//   - "template"  → Use template as starting point, AI adapts to PRD
//   - "manual"    → Start with defaults, customize yourself
//
// Two Independent Axes:
// - Design Language = HOW things look (the "skin")
// - Layouts = WHERE things go (the "skeleton")
// ============================================================================

const initialState = {
  // === WORKFLOW ===
  currentStep: 'context', // 'context' | 'intent' | 'template' | 'content' | 'export'

  // === STEP 1: IMPORTED CONTEXT (from main app) - REQUIRED ===
  importedContext: null, // { research, insights, features, prd, importedAt }

  // === STEP 2: DESIGN APPROACH + LANGUAGE ===
  designApproach: {
    type: null,        // 'generate' | 'template' | 'manual'
    templateId: null,  // ID of selected template (if type === 'template')
    templateName: null,
  },

  designLanguage: {
    colors: {
      primary: '#6366F1',
      primaryHover: '#818CF8',
      secondary: '#8B5CF6',
      secondaryHover: '#A78BFA',
      accent: '#F59E0B',
      accentHover: '#FBBF24',
      background: '#09090B',
      surface: '#18181B',
      surfaceHover: '#27272A',
      surfaceActive: '#3F3F46',
      text: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      border: '#27272A',
      borderHover: '#3F3F46',
      error: '#EF4444',
      errorHover: '#F87171',
      success: '#22C55E',
      successHover: '#4ADE80',
      warning: '#F59E0B',
      warningHover: '#FBBF24',
      info: '#3B82F6',
      infoHover: '#60A5FA',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      monoFont: 'JetBrains Mono',
      baseSize: 16,
      scaleRatio: 1.25,
      lineHeight: 1.5,
      headingLineHeight: 1.2,
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    spacing: {
      base: 4,
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
    },
    radii: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      full: 9999,
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    },
    transitions: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    mood: [],        // e.g., ['minimal', 'dark', 'professional']
    references: [],  // e.g., ['Linear', 'Vercel', 'Stripe']
  },
  isLanguageFinalized: false,

  // === STEP 3: LAYOUTS ===
  layouts: {
    landing: null,    // layout template ID
    dashboard: null,
    settings: null,
    profile: null,
  },
  isLayoutsFinalized: false,

  // === STEP 4: GENERATIONS ===
  generations: {
    landing: [],      // [{ id, html, code, timestamp, layoutId }]
    dashboard: [],
    settings: [],
    profile: [],
  },
  selectedVariations: {
    landing: null,    // ID of selected variation
    dashboard: null,
    settings: null,
    profile: null,
  },

  // === UI STATE ===
  activePageType: 'landing',
  isGenerating: false,
  generatingPageType: null,

  // === CHAT (for design language refinement) ===
  chatMessages: [],   // [{ role: 'user'|'assistant', content, timestamp }]

  // === TEMPLATE LIBRARY (for inspiration/extraction) ===
  designTemplates: [], // User-uploaded designs: [{ id, name, thumbnail, tokens, uploadedAt }]
  customTemplates: [], // Custom user templates (alias for adapter compatibility)
  selectedTemplateId: null, // Currently selected template ID
  isUploadingTemplate: false, // Template upload in progress

  // === CODE TEMPLATE (pre-built HTML templates with content slots) ===
  codeTemplate: {
    selected: null,       // Selected code template object
    filledContent: null,  // { slot_id: value } - AI-filled or user-edited content
    isAdapting: false,    // Loading state during AI adaptation
  },

  // === ERROR STATE ===
  error: null,

  // === DESIGN BRIEF STATE (for DesignChatPanel) ===
  originalBrief: null,     // Original design brief from AI
  editedBrief: null,       // User-edited version
  isEditingBrief: false,   // Whether user is in edit mode
  briefChatMessages: [],   // [{ role, content, timestamp }]

  // === PAGES STATE (legacy compatibility) ===
  currentPageId: 'landing',
  pageTypes: ['landing', 'dashboard', 'settings', 'profile'],
  pagesData: {
    landing: { variations: [], selectedId: null, fullPage: null, isGenerating: false, isExpanding: false },
    dashboard: { variations: [], selectedId: null, fullPage: null, isGenerating: false, isExpanding: false },
    settings: { variations: [], selectedId: null, fullPage: null, isGenerating: false, isExpanding: false },
    profile: { variations: [], selectedId: null, fullPage: null, isGenerating: false, isExpanding: false },
  },
  pageOverrides: {},       // Page-specific preference overrides
  sharedPreferences: {},   // Shared design preferences

  // =========================================
  // DESIGN STUDIO V3: Intent-Driven Architecture
  // =========================================

  // STEP 2: Design Intent (extracted from PRD)
  designIntent: {
    archetype: null, // 'enterprise-technical' | 'creator-aspirational' | 'consumer-premium' | 'startup-velocity'
    archetypeConfidence: null, // 0-100
    archetypeReasoning: null,

    audience: {
      primary: null, // 'developers' | 'creators' | 'consumers' | 'teams' | 'enterprise'
      sophistication: null, // 'beginner' | 'intermediate' | 'expert'
      buyingPower: null, // 'individual' | 'team' | 'enterprise'
    },

    positioning: {
      category: null,
      versus: [],
      uniqueAngle: null,
    },

    trustSignals: [], // [{ type, value, priority }]

    tone: {
      primary: null,
      secondary: null,
      avoid: [],
    },

    keyMessages: [], // [{ priority, message }]

    isExtracted: false,
    isExtracting: false,
    isFinalized: false,
    error: null,
  },

  // STEP 3: Template Selection (enhanced with matching)
  templateSelection: {
    selectedTemplate: null,
    matchScore: null, // 0-100
    matchBreakdown: null, // { archetype, audience, tone, content }
    recommendation: null, // 'Excellent Match' | 'Good Match' | etc
    rankedTemplates: [], // Templates sorted by match score
    isFinalized: false,
  },

  // STEP 4: Content Generation (enhanced)
  contentGeneration: {
    filledContent: null, // { slotId: value, ... }
    isGenerating: false,
    isComplete: false,
    editedSlots: [], // Track which slots user edited
    error: null,
  },

  // =========================================
  // SAVED DESIGNS HISTORY
  // =========================================
  // Persisted history of generated designs for the sidebar
  savedDesigns: [], // [{ id, name, templateName, html, thumbnail, savedAt, archetype }]
  generatedVariations: [], // Current session's generated variations (persisted)
};

const useDesignStudioStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // WORKFLOW NAVIGATION (V3: 5-Step Intent-Driven Flow)
      // ========================================================================

      setCurrentStep: (step) => {
        const validSteps = ['context', 'intent', 'template', 'content', 'export'];
        if (validSteps.includes(step)) {
          set({ currentStep: step, error: null });
        }
      },

      canProceedToStep: (step) => {
        const state = get();
        switch (step) {
          case 'context':
            return true;
          case 'intent':
            // REQUIRES context to be imported
            return state.importedContext !== null;
          case 'template':
            // REQUIRES design intent to be finalized
            return state.designIntent?.isFinalized === true;
          case 'content':
            // REQUIRES template to be selected and finalized
            return state.templateSelection?.isFinalized === true;
          case 'export':
            // REQUIRES content generation to be complete
            return state.contentGeneration?.isComplete === true;
          default:
            return false;
        }
      },

      goToNextStep: () => {
        const state = get();
        const steps = ['context', 'intent', 'template', 'content', 'export'];
        const currentIndex = steps.indexOf(state.currentStep);
        const nextStep = steps[currentIndex + 1];
        if (nextStep && state.canProceedToStep(nextStep)) {
          set({ currentStep: nextStep, error: null });
        }
      },

      goToPreviousStep: () => {
        const state = get();
        const steps = ['context', 'intent', 'template', 'content', 'export'];
        const currentIndex = steps.indexOf(state.currentStep);
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1], error: null });
        }
      },

      // ========================================================================
      // STEP 1: CONTEXT IMPORT (REQUIRED)
      // ========================================================================

      importContext: (context) => {
        set({
          importedContext: {
            research: context.research || null,
            insights: context.insights || null,
            features: context.features || [],
            prd: context.prd || null,
            importedAt: Date.now(),
          },
          error: null,
        });
      },

      clearImportedContext: () => {
        set({
          importedContext: null,
          // Reset entire workflow when context is cleared
          designApproach: initialState.designApproach,
          designLanguage: initialState.designLanguage,
          isLanguageFinalized: false,
          layouts: initialState.layouts,
          isLayoutsFinalized: false,
          generations: initialState.generations,
          selectedVariations: initialState.selectedVariations,
          currentStep: 'context',
        });
      },

      // ========================================================================
      // STEP 2: DESIGN APPROACH + LANGUAGE
      // ========================================================================

      setDesignApproach: (type, templateId = null, templateName = null) => {
        set({
          designApproach: { type, templateId, templateName },
          // Reset downstream when approach changes
          isLanguageFinalized: false,
          isLayoutsFinalized: false,
          generations: initialState.generations,
          selectedVariations: initialState.selectedVariations,
          error: null,
        });
      },

      setDesignLanguage: (language) => {
        set({
          designLanguage: { ...get().designLanguage, ...language },
          // Unfinalize if editing after finalization
          isLanguageFinalized: false,
          error: null,
        });
      },

      setColors: (colors) => {
        set({
          designLanguage: {
            ...get().designLanguage,
            colors: { ...get().designLanguage.colors, ...colors },
          },
          isLanguageFinalized: false,
        });
      },

      setTypography: (typography) => {
        set({
          designLanguage: {
            ...get().designLanguage,
            typography: { ...get().designLanguage.typography, ...typography },
          },
          isLanguageFinalized: false,
        });
      },

      setSpacing: (spacing) => {
        set({
          designLanguage: {
            ...get().designLanguage,
            spacing: { ...get().designLanguage.spacing, ...spacing },
          },
          isLanguageFinalized: false,
        });
      },

      setRadii: (radii) => {
        set({
          designLanguage: {
            ...get().designLanguage,
            radii: { ...get().designLanguage.radii, ...radii },
          },
          isLanguageFinalized: false,
        });
      },

      setShadows: (shadows) => {
        set({
          designLanguage: {
            ...get().designLanguage,
            shadows: { ...get().designLanguage.shadows, ...shadows },
          },
          isLanguageFinalized: false,
        });
      },

      setMood: (mood) => {
        set({
          designLanguage: { ...get().designLanguage, mood },
          isLanguageFinalized: false,
        });
      },

      setReferences: (references) => {
        set({
          designLanguage: { ...get().designLanguage, references },
          isLanguageFinalized: false,
        });
      },

      finalizeDesignLanguage: () => {
        const state = get();
        if (!state.designApproach.type) {
          set({ error: 'Please select a design approach first' });
          return;
        }
        set({ isLanguageFinalized: true, error: null });
      },

      unfinalizeDesignLanguage: () => {
        set({
          isLanguageFinalized: false,
          // Reset downstream
          isLayoutsFinalized: false,
          generations: initialState.generations,
          selectedVariations: initialState.selectedVariations,
        });
      },

      // Apply tokens from a template (AI will adapt based on PRD)
      applyTemplateTokens: (tokens) => {
        const current = get().designLanguage;
        set({
          designLanguage: {
            ...current,
            colors: { ...current.colors, ...(tokens.colors || {}) },
            typography: { ...current.typography, ...(tokens.typography || {}) },
            spacing: tokens.spacing || current.spacing,
            radii: tokens.radii || current.radii,
            shadows: tokens.shadows || current.shadows,
            mood: tokens.mood || current.mood,
            references: tokens.references || current.references,
          },
          isLanguageFinalized: false,
        });
      },

      // Reset to defaults
      resetDesignLanguage: () => {
        set({
          designLanguage: initialState.designLanguage,
          isLanguageFinalized: false,
        });
      },

      // ========================================================================
      // STEP 3: LAYOUTS
      // ========================================================================

      setLayout: (pageType, layoutId) => {
        set({
          layouts: { ...get().layouts, [pageType]: layoutId },
          isLayoutsFinalized: false,
          // Clear generations for this page type
          generations: {
            ...get().generations,
            [pageType]: [],
          },
          selectedVariations: {
            ...get().selectedVariations,
            [pageType]: null,
          },
        });
      },

      finalizeLayouts: () => {
        const layouts = get().layouts;
        // Require at least one layout selected
        const hasAnyLayout = Object.values(layouts).some(l => l !== null);
        if (hasAnyLayout) {
          set({ isLayoutsFinalized: true, error: null });
        } else {
          set({ error: 'Please select at least one layout' });
        }
      },

      unfinalizeLayouts: () => {
        set({
          isLayoutsFinalized: false,
          generations: initialState.generations,
          selectedVariations: initialState.selectedVariations,
        });
      },

      // ========================================================================
      // STEP 4: GENERATION
      // ========================================================================

      setActivePageType: (pageType) => {
        set({ activePageType: pageType });
      },

      setGenerating: (isGenerating, pageType = null) => {
        set({ isGenerating, generatingPageType: pageType });
      },

      addVariation: (pageType, variation) => {
        const generations = get().generations;
        set({
          generations: {
            ...generations,
            [pageType]: [
              ...generations[pageType],
              {
                id: crypto.randomUUID(),
                ...variation,
                timestamp: Date.now(),
                layoutId: get().layouts[pageType],
              },
            ],
          },
        });
      },

      removeVariation: (pageType, variationId) => {
        const generations = get().generations;
        const selectedVariations = get().selectedVariations;
        set({
          generations: {
            ...generations,
            [pageType]: generations[pageType].filter(v => v.id !== variationId),
          },
          // Deselect if this was selected
          selectedVariations: {
            ...selectedVariations,
            [pageType]: selectedVariations[pageType] === variationId ? null : selectedVariations[pageType],
          },
        });
      },

      selectVariation: (pageType, variationId) => {
        set({
          selectedVariations: {
            ...get().selectedVariations,
            [pageType]: variationId,
          },
        });
      },

      clearVariations: (pageType) => {
        set({
          generations: {
            ...get().generations,
            [pageType]: [],
          },
          selectedVariations: {
            ...get().selectedVariations,
            [pageType]: null,
          },
        });
      },

      // ========================================================================
      // CHAT
      // ========================================================================

      addChatMessage: (role, content) => {
        set({
          chatMessages: [
            ...get().chatMessages,
            { role, content, timestamp: Date.now() },
          ],
        });
      },

      clearChat: () => {
        set({ chatMessages: [] });
      },

      // ========================================================================
      // DESIGN BRIEF (for DesignChatPanel)
      // ========================================================================

      setOriginalBrief: (brief) => {
        set({ originalBrief: brief, editedBrief: brief });
      },

      setEditedBrief: (brief) => {
        set({ editedBrief: brief });
      },

      resetBriefToOriginal: () => {
        set((state) => ({ editedBrief: state.originalBrief }));
      },

      toggleBriefEditor: () => {
        set((state) => ({ isEditingBrief: !state.isEditingBrief }));
      },

      setEditingBrief: (isEditing) => {
        set({ isEditingBrief: isEditing });
      },

      addBriefChatMessage: (content, role) => {
        set((state) => ({
          briefChatMessages: [
            ...state.briefChatMessages,
            { role, content, timestamp: Date.now() },
          ],
        }));
      },

      clearBriefChat: () => {
        set({ briefChatMessages: [] });
      },

      getActiveDesignBrief: () => {
        const state = get();
        return state.editedBrief || state.originalBrief;
      },

      // ========================================================================
      // PAGES (legacy compatibility for adapter)
      // ========================================================================

      setCurrentPage: (pageId) => {
        set({ currentPageId: pageId });
      },

      setPageVariations: (pageId, variations) => {
        set((state) => ({
          pagesData: {
            ...state.pagesData,
            [pageId]: { ...state.pagesData[pageId], variations },
          },
        }));
      },

      selectPageVariation: (pageId, variationId) => {
        set((state) => ({
          pagesData: {
            ...state.pagesData,
            [pageId]: { ...state.pagesData[pageId], selectedId: variationId },
          },
        }));
      },

      setPageFullPage: (pageId, fullPage) => {
        set((state) => ({
          pagesData: {
            ...state.pagesData,
            [pageId]: { ...state.pagesData[pageId], fullPage },
          },
        }));
      },

      setPageGenerating: (pageId, isGenerating) => {
        set((state) => ({
          pagesData: {
            ...state.pagesData,
            [pageId]: { ...state.pagesData[pageId], isGenerating },
          },
        }));
      },

      setPageExpanding: (pageId, isExpanding) => {
        set((state) => ({
          pagesData: {
            ...state.pagesData,
            [pageId]: { ...state.pagesData[pageId], isExpanding },
          },
        }));
      },

      setPageOverride: (pageId, preferences) => {
        set((state) => ({
          pageOverrides: { ...state.pageOverrides, [pageId]: preferences },
        }));
      },

      clearPageOverride: (pageId) => {
        set((state) => {
          const { [pageId]: _, ...rest } = state.pageOverrides;
          return { pageOverrides: rest };
        });
      },

      setSharedPreferences: (preferences) => {
        set({ sharedPreferences: preferences });
      },

      getEffectivePreferences: (pageId) => {
        const state = get();
        return { ...state.sharedPreferences, ...(state.pageOverrides[pageId] || {}) };
      },

      // ========================================================================
      // TEMPLATE LIBRARY
      // ========================================================================

      addDesignTemplate: (template) => {
        set({
          designTemplates: [
            ...get().designTemplates,
            {
              id: crypto.randomUUID(),
              ...template,
              uploadedAt: Date.now(),
            },
          ],
        });
      },

      removeDesignTemplate: (templateId) => {
        set({
          designTemplates: get().designTemplates.filter(t => t.id !== templateId),
        });
      },

      // Custom templates (adapter compatibility)
      addCustomTemplate: (template) => {
        const id = crypto.randomUUID();
        set((state) => ({
          customTemplates: [...state.customTemplates, { id, ...template, uploadedAt: Date.now() }],
        }));
        return id;
      },

      removeCustomTemplate: (templateId) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter(t => t.id !== templateId),
          selectedTemplateId: state.selectedTemplateId === templateId ? null : state.selectedTemplateId,
        }));
      },

      setUploadingTemplate: (isUploading) => {
        set({ isUploadingTemplate: isUploading });
      },

      getAllTemplates: () => {
        return get().customTemplates;
      },

      getSelectedTemplate: () => {
        const state = get();
        return state.customTemplates.find(t => t.id === state.selectedTemplateId) || null;
      },

      // ========================================================================
      // CODE TEMPLATE (PRE-BUILT HTML TEMPLATES)
      // ========================================================================

      setCodeTemplate: (template, filledContent = null) => {
        set({
          codeTemplate: {
            selected: template,
            filledContent,
            isAdapting: false,
          },
        });
      },

      setCodeTemplateFilledContent: (filledContent) => {
        set({
          codeTemplate: {
            ...get().codeTemplate,
            filledContent,
          },
        });
      },

      updateCodeTemplateSlot: (slotId, value) => {
        const current = get().codeTemplate.filledContent || {};
        set({
          codeTemplate: {
            ...get().codeTemplate,
            filledContent: {
              ...current,
              [slotId]: value,
            },
          },
        });
      },

      setCodeTemplateAdapting: (isAdapting) => {
        set({
          codeTemplate: {
            ...get().codeTemplate,
            isAdapting,
          },
        });
      },

      clearCodeTemplate: () => {
        set({
          codeTemplate: initialState.codeTemplate,
        });
      },

      // =========================================
      // DESIGN INTENT ACTIONS (V3)
      // =========================================

      setDesignIntent: (intent) =>
        set((state) => ({
          designIntent: {
            ...state.designIntent,
            ...intent,
            isExtracted: true,
            isExtracting: false,
            error: null,
          },
        })),

      setDesignIntentExtracting: (isExtracting) =>
        set((state) => ({
          designIntent: {
            ...state.designIntent,
            isExtracting,
            error: isExtracting ? null : state.designIntent.error,
          },
        })),

      setDesignIntentError: (error) =>
        set((state) => ({
          designIntent: {
            ...state.designIntent,
            isExtracting: false,
            error,
          },
        })),

      updateDesignIntent: (updates) =>
        set((state) => ({
          designIntent: {
            ...state.designIntent,
            ...updates,
          },
        })),

      finalizeDesignIntent: () =>
        set((state) => ({
          designIntent: {
            ...state.designIntent,
            isFinalized: true,
          },
        })),

      resetDesignIntent: () =>
        set(() => ({
          designIntent: {
            archetype: null,
            archetypeConfidence: null,
            archetypeReasoning: null,
            audience: { primary: null, sophistication: null, buyingPower: null },
            positioning: { category: null, versus: [], uniqueAngle: null },
            trustSignals: [],
            tone: { primary: null, secondary: null, avoid: [] },
            keyMessages: [],
            isExtracted: false,
            isExtracting: false,
            isFinalized: false,
            error: null,
          },
        })),

      // =========================================
      // TEMPLATE SELECTION ACTIONS (V3)
      // =========================================

      setTemplateSelection: (selection) =>
        set((state) => ({
          templateSelection: {
            ...state.templateSelection,
            ...selection,
          },
        })),

      setRankedTemplates: (rankedTemplates) =>
        set((state) => ({
          templateSelection: {
            ...state.templateSelection,
            rankedTemplates,
          },
        })),

      selectTemplate: (template, matchData) =>
        set((state) => ({
          templateSelection: {
            ...state.templateSelection,
            selectedTemplate: template,
            matchScore: matchData?.score || null,
            matchBreakdown: matchData?.breakdown || null,
            recommendation: matchData?.recommendation || null,
          },
        })),

      finalizeTemplateSelection: () =>
        set((state) => ({
          templateSelection: {
            ...state.templateSelection,
            isFinalized: true,
          },
        })),

      resetTemplateSelection: () =>
        set(() => ({
          templateSelection: {
            selectedTemplate: null,
            matchScore: null,
            matchBreakdown: null,
            recommendation: null,
            rankedTemplates: [],
            isFinalized: false,
          },
        })),

      // =========================================
      // CONTENT GENERATION ACTIONS (V3)
      // =========================================

      setContentGeneration: (content) =>
        set((state) => ({
          contentGeneration: {
            ...state.contentGeneration,
            filledContent: content,
            isComplete: true,
            isGenerating: false,
            error: null,
          },
        })),

      setContentGenerating: (isGenerating) =>
        set((state) => ({
          contentGeneration: {
            ...state.contentGeneration,
            isGenerating,
            error: isGenerating ? null : state.contentGeneration.error,
          },
        })),

      setContentError: (error) =>
        set((state) => ({
          contentGeneration: {
            ...state.contentGeneration,
            isGenerating: false,
            error,
          },
        })),

      updateSlotContent: (slotId, value) =>
        set((state) => ({
          contentGeneration: {
            ...state.contentGeneration,
            filledContent: {
              ...state.contentGeneration.filledContent,
              [slotId]: value,
            },
            editedSlots: state.contentGeneration.editedSlots.includes(slotId)
              ? state.contentGeneration.editedSlots
              : [...state.contentGeneration.editedSlots, slotId],
          },
        })),

      resetContentGeneration: () =>
        set(() => ({
          contentGeneration: {
            filledContent: null,
            isGenerating: false,
            isComplete: false,
            editedSlots: [],
            error: null,
          },
        })),

      // =========================================
      // SAVED DESIGNS & GENERATED VARIATIONS
      // =========================================

      // Save a design to history (persisted)
      saveDesign: (design) =>
        set((state) => ({
          savedDesigns: [
            {
              id: crypto.randomUUID(),
              savedAt: Date.now(),
              ...design,
            },
            ...state.savedDesigns,
          ].slice(0, 20), // Keep max 20 designs
        })),

      // Remove a saved design
      removeSavedDesign: (designId) =>
        set((state) => ({
          savedDesigns: state.savedDesigns.filter((d) => d.id !== designId),
        })),

      // Clear all saved designs
      clearSavedDesigns: () =>
        set(() => ({
          savedDesigns: [],
        })),

      // Add a generated variation (persisted for current session)
      addGeneratedVariation: (variation) =>
        set((state) => ({
          generatedVariations: [
            ...state.generatedVariations,
            {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              ...variation,
            },
          ],
        })),

      // Set all generated variations
      setGeneratedVariations: (variations) =>
        set(() => ({
          generatedVariations: variations.map((v) => ({
            id: v.id || crypto.randomUUID(),
            createdAt: v.createdAt || Date.now(),
            ...v,
          })),
        })),

      // Select a variation (marks it as the current one)
      selectGeneratedVariation: (variationId) =>
        set((state) => ({
          generatedVariations: state.generatedVariations.map((v) => ({
            ...v,
            isSelected: v.id === variationId,
          })),
        })),

      // Remove a generated variation
      removeGeneratedVariation: (variationId) =>
        set((state) => ({
          generatedVariations: state.generatedVariations.filter((v) => v.id !== variationId),
        })),

      // Clear generated variations
      clearGeneratedVariations: () =>
        set(() => ({
          generatedVariations: [],
        })),

      // Get the selected variation
      getSelectedVariation: () => {
        const state = get();
        return state.generatedVariations.find((v) => v.isSelected) || null;
      },

      // ========================================================================
      // ERROR HANDLING
      // ========================================================================

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // ========================================================================
      // RESET
      // ========================================================================

      resetWorkflow: () => {
        set({
          ...initialState,
          // Preserve templates but reset context and workflow
          designTemplates: get().designTemplates,
        });
      },

      resetAll: () => {
        set(initialState);
      },

      // ========================================================================
      // GETTERS / COMPUTED
      // ========================================================================

      getLayoutTemplates: (pageType) => {
        return LAYOUT_TEMPLATES[pageType] || [];
      },

      getSelectedLayout: (pageType) => {
        const layoutId = get().layouts[pageType];
        if (!layoutId) return null;
        const templates = LAYOUT_TEMPLATES[pageType] || [];
        return templates.find(t => t.id === layoutId) || null;
      },

      getVariations: (pageType) => {
        return get().generations[pageType] || [];
      },

      getSelectedVariation: (pageType) => {
        const selectedId = get().selectedVariations[pageType];
        if (!selectedId) return null;
        const variations = get().generations[pageType] || [];
        return variations.find(v => v.id === selectedId) || null;
      },

      // Check if context has meaningful data
      hasValidContext: () => {
        const ctx = get().importedContext;
        if (!ctx) return false;
        // At minimum, need research OR features OR prd
        return !!(ctx.research || ctx.features?.length > 0 || ctx.prd);
      },

      // Get complete export data
      getExportData: () => {
        const state = get();
        return {
          designLanguage: state.designLanguage,
          layouts: state.layouts,
          selectedVariations: Object.entries(state.selectedVariations)
            .filter(([_, id]) => id !== null)
            .reduce((acc, [pageType, id]) => {
              const variation = state.generations[pageType].find(v => v.id === id);
              if (variation) {
                acc[pageType] = variation;
              }
              return acc;
            }, {}),
          context: {
            approach: state.designApproach,
            prdImported: !!state.importedContext?.prd,
            featuresCount: state.importedContext?.features?.length || 0,
          },
          exportedAt: Date.now(),
        };
      },

      // Get workflow progress (V3: 5-Step Intent-Driven Flow)
      getProgress: () => {
        const state = get();
        const steps = [
          { id: 'context', complete: state.importedContext !== null },
          { id: 'intent', complete: state.designIntent?.isFinalized === true },
          { id: 'template', complete: state.templateSelection?.isFinalized === true },
          { id: 'content', complete: state.contentGeneration?.isComplete === true },
          { id: 'export', complete: false }, // Export is terminal step, tracked separately
        ];
        const completed = steps.filter(s => s.complete).length;
        return {
          steps,
          completed,
          total: steps.length,
          percentage: Math.round((completed / steps.length) * 100),
        };
      },
    }),
    {
      name: 'ideaforge-design-studio-v2',
      version: 5, // Bumped for saved designs history
      partialize: (state) => ({
        // Persist everything except transient UI state
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
        // Design Studio V3 state
        designIntent: state.designIntent,
        templateSelection: state.templateSelection,
        contentGeneration: state.contentGeneration,
        // Brief and page state (adapter compatibility)
        originalBrief: state.originalBrief,
        editedBrief: state.editedBrief,
        briefChatMessages: state.briefChatMessages,
        pagesData: state.pagesData,
        customTemplates: state.customTemplates,
        selectedTemplateId: state.selectedTemplateId,
        // Saved designs history (new in v5)
        savedDesigns: state.savedDesigns,
        generatedVariations: state.generatedVariations,
      }),
    }
  )
);

export default useDesignStudioStore;

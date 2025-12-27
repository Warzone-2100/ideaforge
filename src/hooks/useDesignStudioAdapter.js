/**
 * useDesignStudioAdapter
 *
 * Provides backward compatibility for existing Design Studio components.
 * Maps the new flat useDesignStudioStore to the old nested interface
 * that components expect from useAppStore.
 *
 * Usage:
 *   // In component that previously used useAppStore for design data:
 *   const { designVariations, setDesignBrief, ... } = useDesignStudioAdapter();
 */

import { useCallback } from 'react';
import useDesignStudioStore from '../stores/useDesignStudioStore';
import useAppStore from '../stores/useAppStore';

/**
 * Adapter hook that provides the old useAppStore interface
 * while using the new useDesignStudioStore under the hood
 */
export function useDesignStudioAdapter() {
  // Get state from new store
  const {
    // Templates
    customTemplates,
    selectedTemplateId,
    isUploadingTemplate,
    getAllTemplates,
    getSelectedTemplate,
    selectTemplate,
    addCustomTemplate,
    removeCustomTemplate,
    setUploadingTemplate,

    // Brief
    originalBrief,
    editedBrief,
    isEditingBrief,
    briefChatMessages,
    setOriginalBrief,
    setEditedBrief,
    resetBriefToOriginal,
    toggleBriefEditor,
    setEditingBrief,
    addBriefChatMessage,
    clearBriefChat,
    getActiveDesignBrief,

    // Pages
    currentPageId,
    pageTypes,
    pagesData,
    setCurrentPage,
    setPageVariations,
    selectPageVariation,
    setPageFullPage,
    setPageGenerating,
    setPageExpanding,

    // Preferences
    sharedPreferences,
    pageOverrides,
    setSharedPreferences,
    setPageOverride,
    clearPageOverride,
    getEffectivePreferences,

    // Reset
    resetDesignData,
  } = useDesignStudioStore();

  // Get main flow data from useAppStore (research, insights, etc.)
  const {
    research,
    insights,
    prd,
    features,
    setCurrentStep,
    getAcceptedFeatures,
    designPreferences,
    setDesignPreferences,
  } = useAppStore();

  // ============================================
  // TRANSFORM NEW STORE → OLD INTERFACE
  // ============================================

  /**
   * Transform pagesData to old pages format
   */
  const transformPagesToOldFormat = useCallback(() => {
    const oldPages = {};

    for (const [pageId, pageData] of Object.entries(pagesData)) {
      // Find selected variation object from ID
      const selectedVariation = pageData.selectedId
        ? pageData.variations.find((v) => v.id === pageData.selectedId)
        : null;

      oldPages[pageId] = {
        variations: pageData.variations || [],
        selected: selectedVariation,
        fullPage: pageData.fullPage || null,
        isGenerating: pageData.isGenerating || false,
        isExpanding: pageData.isExpanding || false,
        overridePreferences: pageOverrides[pageId] || null,
      };
    }

    return oldPages;
  }, [pagesData, pageOverrides]);

  /**
   * Create the old designVariations shape
   */
  const designVariations = {
    // Brief
    designBrief: originalBrief,
    editedDesignBrief: editedBrief,
    isEditingBrief: isEditingBrief,
    briefChatMessages: briefChatMessages,

    // Templates
    templateLibrary: customTemplates,
    selectedTemplateId: selectedTemplateId,
    isUploadingTemplate: isUploadingTemplate,

    // Pages
    currentPage: currentPageId,
    pages: transformPagesToOldFormat(),
    pageTypes: pageTypes,

    // Preferences
    sharedPreferences: sharedPreferences,

    // Legacy fields for backward compatibility
    variations: pagesData[currentPageId]?.variations || [],
    selected: pagesData[currentPageId]?.selectedId
      ? pagesData[currentPageId]?.variations.find(
          (v) => v.id === pagesData[currentPageId]?.selectedId
        )
      : null,
    homepage: pagesData[currentPageId]?.fullPage || null,
    isGenerating: pagesData[currentPageId]?.isGenerating || false,
    isExpanding: pagesData[currentPageId]?.isExpanding || false,
  };

  // ============================================
  // ADAPTED ACTIONS
  // ============================================

  /**
   * Set design brief (maps to setOriginalBrief)
   */
  const setDesignBrief = useCallback((brief) => {
    setOriginalBrief(brief);
  }, [setOriginalBrief]);

  /**
   * Add template to library (maps to addCustomTemplate)
   */
  const addTemplateToLibrary = useCallback((template) => {
    addCustomTemplate(template);
  }, [addCustomTemplate]);

  /**
   * Remove template from library (maps to removeCustomTemplate)
   */
  const removeTemplateFromLibrary = useCallback((id) => {
    removeCustomTemplate(id);
  }, [removeCustomTemplate]);

  /**
   * Set selected template ID
   */
  const setSelectedTemplateId = useCallback((id) => {
    selectTemplate(id);
  }, [selectTemplate]);

  /**
   * Set page variations (adapts variation selection)
   */
  const setPageVariationsAdapter = useCallback((pageId, variations) => {
    setPageVariations(pageId, variations);
  }, [setPageVariations]);

  /**
   * Select page variation (adapts from object to ID)
   */
  const selectPageVariationAdapter = useCallback((pageId, variation) => {
    // Old format passes full variation object, new format uses ID
    const variationId = variation?.id || variation;
    selectPageVariation(pageId, variationId);
  }, [selectPageVariation]);

  /**
   * Legacy: Set design variations for current page
   */
  const setDesignVariations = useCallback((variations) => {
    setPageVariations(currentPageId, variations);
  }, [currentPageId, setPageVariations]);

  /**
   * Legacy: Set generating variations state
   */
  const setGeneratingVariations = useCallback((isGenerating) => {
    setPageGenerating(currentPageId, isGenerating);
  }, [currentPageId, setPageGenerating]);

  /**
   * Legacy: Select variation for current page
   */
  const selectVariation = useCallback((variation) => {
    const variationId = variation?.id || variation;
    selectPageVariation(currentPageId, variationId);
  }, [currentPageId, selectPageVariation]);

  /**
   * Legacy: Set homepage (full page) for current page
   */
  const setHomepage = useCallback((homepage) => {
    setPageFullPage(currentPageId, homepage);
  }, [currentPageId, setPageFullPage]);

  /**
   * Legacy: Set expanding homepage state
   */
  const setExpandingHomepage = useCallback((isExpanding) => {
    setPageExpanding(currentPageId, isExpanding);
  }, [currentPageId, setPageExpanding]);

  /**
   * Clear design variations
   */
  const clearDesignVariations = useCallback(() => {
    resetDesignData();
  }, [resetDesignData]);

  /**
   * Adapted getEffectivePreferences
   */
  const getEffectivePreferencesAdapter = useCallback((pageId) => {
    return getEffectivePreferences(pageId);
  }, [getEffectivePreferences]);

  // ============================================
  // RETURN COMBINED INTERFACE
  // ============================================

  return {
    // Main flow data (from useAppStore)
    research,
    insights,
    prd,
    features,
    setCurrentStep,
    getAcceptedFeatures,
    designPreferences,
    setDesignPreferences,

    // Design variations (adapted)
    designVariations,

    // Brief actions
    setDesignBrief,
    setEditedDesignBrief: setEditedBrief,
    toggleBriefEditor,
    setEditingBrief,
    addBriefChatMessage,
    clearBriefChat,
    resetEditedBrief: resetBriefToOriginal,
    getActiveDesignBrief,

    // Template actions
    addTemplateToLibrary,
    removeTemplateFromLibrary,
    setUploadingTemplate,
    setSelectedTemplateId,
    getSelectedTemplate,
    getAllTemplates,

    // Page actions
    setCurrentPage,
    setPageVariations: setPageVariationsAdapter,
    setPageGenerating,
    selectPageVariation: selectPageVariationAdapter,
    setPageFullPage,
    setPageExpanding,

    // Preferences actions
    setSharedPreferences,
    setPageOverridePreferences: setPageOverride,
    getEffectivePreferences: getEffectivePreferencesAdapter,

    // Legacy actions
    setDesignVariations,
    setGeneratingVariations,
    selectVariation,
    setHomepage,
    setExpandingHomepage,
    clearDesignVariations,
  };
}

/**
 * Hook that determines which store to use based on context
 *
 * When on /design-studio route: use new store via adapter
 * When in main flow: use old store (until Phase 5 cleanup)
 */
export function useDesignStore() {
  // For now, always return the adapter
  // After Phase 5, this will be the only option
  return useDesignStudioAdapter();
}

export default useDesignStudioAdapter;

/**
 * Design Studio Migration Utilities
 *
 * Handles migration from the old nested designVariations format
 * in useAppStore to the new flat format in useDesignStudioStore.
 */

const OLD_STORAGE_KEY = 'ideaforge-storage';
const NEW_STORAGE_KEY = 'ideaforge-design-studio';

/**
 * Check if old localStorage has designVariations data that needs migration
 */
export function detectOldFormat() {
  try {
    const oldStorage = localStorage.getItem(OLD_STORAGE_KEY);
    if (!oldStorage) return { hasOldData: false };

    const oldData = JSON.parse(oldStorage);
    const oldDesign = oldData?.state?.designVariations;

    if (!oldDesign) return { hasOldData: false };

    // Check if there's meaningful data to migrate
    const hasTemplates = oldDesign.templateLibrary?.length > 0;
    const hasBrief = !!oldDesign.designBrief;
    const hasVariations = oldDesign.variations?.length > 0 ||
      Object.values(oldDesign.pages || {}).some(p => p?.variations?.length > 0);
    const hasChatHistory = oldDesign.briefChatMessages?.length > 0;

    return {
      hasOldData: hasTemplates || hasBrief || hasVariations || hasChatHistory,
      summary: {
        templates: oldDesign.templateLibrary?.length || 0,
        hasBrief,
        variationCount: countVariations(oldDesign),
        chatMessages: oldDesign.briefChatMessages?.length || 0,
      },
    };
  } catch (error) {
    console.error('[Migration] Error detecting old format:', error);
    return { hasOldData: false, error: error.message };
  }
}

/**
 * Count total variations across all pages
 */
function countVariations(oldDesign) {
  let count = oldDesign.variations?.length || 0;

  if (oldDesign.pages) {
    count += Object.values(oldDesign.pages).reduce(
      (sum, page) => sum + (page?.variations?.length || 0),
      0
    );
  }

  return count;
}

/**
 * Check if new store already has data (migration not needed)
 */
export function hasNewStoreData() {
  try {
    const newStorage = localStorage.getItem(NEW_STORAGE_KEY);
    if (!newStorage) return false;

    const newData = JSON.parse(newStorage);
    const state = newData?.state;

    return !!(
      state?.originalBrief ||
      state?.customTemplates?.length > 0 ||
      Object.values(state?.pagesData || {}).some(p => p?.variations?.length > 0)
    );
  } catch {
    return false;
  }
}

/**
 * Migrate old designVariations to new format
 * Returns the migrated state object
 */
export function migrateToNewFormat(oldDesign) {
  if (!oldDesign) return null;

  const defaultPageData = {
    variations: [],
    selectedId: null,
    fullPage: null,
    isGenerating: false,
    isExpanding: false,
  };

  const migrated = {
    // Templates
    customTemplates: (oldDesign.templateLibrary || []).map(normalizeTemplate),
    selectedTemplateId: oldDesign.selectedTemplateId || null,
    isUploadingTemplate: false,

    // Brief
    originalBrief: oldDesign.designBrief || null,
    editedBrief: oldDesign.editedDesignBrief || null,
    isEditingBrief: false,
    briefChatMessages: (oldDesign.briefChatMessages || []).map(normalizeMessage),

    // Pages
    currentPageId: oldDesign.currentPage || 'landing',
    pagesData: {
      landing: transformPageData(oldDesign.pages?.landing, defaultPageData),
      dashboard: transformPageData(oldDesign.pages?.dashboard, defaultPageData),
      settings: transformPageData(oldDesign.pages?.settings, defaultPageData),
      profile: transformPageData(oldDesign.pages?.profile, defaultPageData),
    },

    // Preferences
    sharedPreferences: normalizePreferences(oldDesign.sharedPreferences),
    pageOverrides: {
      landing: oldDesign.pages?.landing?.overridePreferences || null,
      dashboard: oldDesign.pages?.dashboard?.overridePreferences || null,
      settings: oldDesign.pages?.settings?.overridePreferences || null,
      profile: oldDesign.pages?.profile?.overridePreferences || null,
    },

    // UI state (reset)
    activePanel: 'templates',
    error: null,

    // No imported context from migration
    importedContext: null,
  };

  // Handle legacy single-page format (pre-multi-page)
  if (!migrated.pagesData.landing.variations.length && oldDesign.variations?.length) {
    migrated.pagesData.landing = {
      variations: oldDesign.variations.map(normalizeVariation),
      selectedId: oldDesign.selected?.id || null,
      fullPage: oldDesign.homepage || null,
      isGenerating: false,
      isExpanding: false,
    };
  }

  return migrated;
}

/**
 * Transform old page data to new format
 */
function transformPageData(oldPage, defaultPageData) {
  if (!oldPage) return { ...defaultPageData };

  return {
    variations: (oldPage.variations || []).map(normalizeVariation),
    selectedId: oldPage.selected?.id || null,
    fullPage: oldPage.fullPage || null,
    isGenerating: false,
    isExpanding: false,
  };
}

/**
 * Normalize template object
 */
function normalizeTemplate(template) {
  return {
    id: template.id || crypto.randomUUID(),
    name: template.name || 'Untitled Template',
    category: template.category || 'landing',
    source: template.source || 'screenshot',
    uploadedAt: template.uploadedAt || new Date().toISOString(),
    analysis: template.analysis || null,
    thumbnail: template.thumbnail || null,
    notes: template.notes || '',
    cost: template.cost || 0,
    model: template.model || 'unknown',
    tokens: template.tokens || 0,
  };
}

/**
 * Normalize variation object
 */
function normalizeVariation(variation) {
  return {
    id: variation.id || crypto.randomUUID(),
    html: variation.html || '',
    model: variation.model || 'unknown',
    cost: variation.cost || 0,
    templateUsed: variation.templateUsed || null,
  };
}

/**
 * Normalize chat message
 */
function normalizeMessage(msg) {
  return {
    role: msg.role || 'user',
    content: msg.content || '',
    timestamp: msg.timestamp || new Date().toISOString(),
  };
}

/**
 * Normalize preferences
 */
function normalizePreferences(prefs) {
  return {
    palette: prefs?.palette || null,
    style: prefs?.style || null,
    references: prefs?.references || [],
    mood: prefs?.mood || [],
  };
}

/**
 * Validate migrated data structure
 */
export function validateMigration(migratedData) {
  const errors = [];

  // Check required top-level properties
  const requiredProps = [
    'customTemplates',
    'originalBrief',
    'currentPageId',
    'pagesData',
    'sharedPreferences',
  ];

  for (const prop of requiredProps) {
    if (!(prop in migratedData)) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Check pagesData structure
  const requiredPages = ['landing', 'dashboard', 'settings', 'profile'];
  for (const pageId of requiredPages) {
    if (!migratedData.pagesData?.[pageId]) {
      errors.push(`Missing page data for: ${pageId}`);
    }
  }

  // Check arrays are arrays
  if (!Array.isArray(migratedData.customTemplates)) {
    errors.push('customTemplates should be an array');
  }
  if (!Array.isArray(migratedData.briefChatMessages)) {
    errors.push('briefChatMessages should be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Perform full migration from old to new store
 * Returns migration result with status
 */
export function performMigration() {
  const detection = detectOldFormat();

  if (!detection.hasOldData) {
    return { success: true, status: 'no-data', message: 'No old data to migrate' };
  }

  if (hasNewStoreData()) {
    return { success: true, status: 'already-migrated', message: 'New store already has data' };
  }

  try {
    const oldStorage = localStorage.getItem(OLD_STORAGE_KEY);
    const oldData = JSON.parse(oldStorage);
    const oldDesign = oldData?.state?.designVariations;

    const migratedData = migrateToNewFormat(oldDesign);
    const validation = validateMigration(migratedData);

    if (!validation.isValid) {
      return {
        success: false,
        status: 'validation-failed',
        errors: validation.errors,
      };
    }

    // Save to new store format
    const newStorageData = {
      state: migratedData,
      version: 1,
    };
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(newStorageData));

    return {
      success: true,
      status: 'migrated',
      summary: detection.summary,
      message: `Migrated ${detection.summary.templates} templates, ${detection.summary.variationCount} variations`,
    };
  } catch (error) {
    return {
      success: false,
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Clean up old designVariations from the main store
 * (Optional - call after confirming migration success)
 */
export function cleanupOldData() {
  try {
    const oldStorage = localStorage.getItem(OLD_STORAGE_KEY);
    if (!oldStorage) return { success: true };

    const oldData = JSON.parse(oldStorage);

    // Remove designVariations but keep other data
    if (oldData.state?.designVariations) {
      // Replace with minimal stub for backward compatibility
      oldData.state.designVariations = {
        designBrief: null,
        variations: [],
        selected: null,
        homepage: null,
        isGenerating: false,
        isExpanding: false,
        templateLibrary: [],
        briefChatMessages: [],
        currentPage: 'landing',
        pages: {},
        pageTypes: [],
        sharedPreferences: {},
      };

      localStorage.setItem(OLD_STORAGE_KEY, JSON.stringify(oldData));
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

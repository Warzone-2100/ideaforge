// ============================================================================
// CONTENT MAP SCHEMA
// ============================================================================
//
// Defines the structure for mapping PRD content to template slots.
// Used by code templates to identify replaceable content.
//
// ============================================================================

/**
 * Slot types for content mapping
 */
export const SLOT_TYPES = {
  TEXT: 'text',           // Simple string replacement
  RICH_TEXT: 'rich_text', // HTML-safe text with basic formatting
  IMAGE: 'image',         // Image URL or placeholder
  LINK: 'link',           // URL with optional text
  LIST: 'list',           // Array of items (features, testimonials)
};

/**
 * Common PRD field mappings
 * These help the AI understand where to pull content from
 */
export const PRD_FIELD_MAPPINGS = {
  product_name: 'prd.productName',
  tagline: 'insights.marketInsights[0]',
  hero_headline: null, // AI generates from full context
  hero_subheadline: 'prd.valueProposition',
  cta_primary: null, // AI generates
  cta_secondary: null, // AI generates
  features: 'features', // Maps to accepted features array
  pain_points: 'insights.painPoints',
  benefits: 'insights.marketInsights',
};

/**
 * Validation rules for slots
 */
export const createValidation = ({
  required = false,
  maxLength = null,
  minLength = null,
  pattern = null,
} = {}) => ({
  required,
  maxLength,
  minLength,
  pattern,
});

/**
 * Create a text slot definition
 */
export const createTextSlot = ({
  id,
  selector,
  label,
  description = '',
  prdMapping = null,
  fallback = '',
  validation = {},
}) => ({
  id,
  type: SLOT_TYPES.TEXT,
  selector,
  label,
  description,
  prdMapping,
  fallback,
  validation: createValidation(validation),
});

/**
 * Create a rich text slot definition
 */
export const createRichTextSlot = ({
  id,
  selector,
  label,
  description = '',
  prdMapping = null,
  fallback = '',
  validation = {},
}) => ({
  id,
  type: SLOT_TYPES.RICH_TEXT,
  selector,
  label,
  description,
  prdMapping,
  fallback,
  validation: createValidation(validation),
});

/**
 * Create a list slot definition
 */
export const createListSlot = ({
  id,
  selector,
  label,
  description = '',
  prdMapping = null,
  fallback = [],
  itemSchema = { fields: [] },
  validation = {},
}) => ({
  id,
  type: SLOT_TYPES.LIST,
  selector,
  label,
  description,
  prdMapping,
  fallback,
  itemSchema,
  validation: createValidation(validation),
});

/**
 * Create a complete content map for a template
 */
export const createContentMap = ({
  templateId,
  version = '1.0.0',
  slots = [],
  sections = {},
  designTokenOverrides = {},
}) => ({
  templateId,
  version,
  slots,
  sections,
  designTokenOverrides,
});

/**
 * Default design token CSS variable mappings
 */
export const DEFAULT_TOKEN_OVERRIDES = {
  '--token-primary': 'colors.primary',
  '--token-primary-hover': 'colors.primaryHover',
  '--token-secondary': 'colors.secondary',
  '--token-accent': 'colors.accent',
  '--token-background': 'colors.background',
  '--token-surface': 'colors.surface',
  '--token-surface-hover': 'colors.surfaceHover',
  '--token-text': 'colors.text',
  '--token-text-secondary': 'colors.textSecondary',
  '--token-text-muted': 'colors.textMuted',
  '--token-border': 'colors.border',
  '--token-success': 'colors.success',
  '--token-error': 'colors.error',
  '--token-warning': 'colors.warning',
  '--token-font': 'typography.fontFamily',
  '--token-font-heading': 'typography.headingFont',
  '--token-font-mono': 'typography.monoFont',
  '--token-radius-sm': 'radii.sm',
  '--token-radius-md': 'radii.md',
  '--token-radius-lg': 'radii.lg',
};

/**
 * Lucide icon suggestions for different feature types
 */
export const ICON_SUGGESTIONS = {
  ai: ['brain', 'sparkles', 'cpu', 'wand-2', 'bot'],
  data: ['database', 'chart-bar', 'pie-chart', 'trending-up', 'table'],
  security: ['shield', 'lock', 'key', 'fingerprint', 'shield-check'],
  speed: ['zap', 'rocket', 'timer', 'gauge', 'fast-forward'],
  communication: ['message-circle', 'mail', 'phone', 'video', 'users'],
  integration: ['plug', 'puzzle', 'link', 'git-merge', 'webhook'],
  storage: ['cloud', 'hard-drive', 'folder', 'file', 'archive'],
  search: ['search', 'filter', 'scan', 'eye', 'radar'],
  money: ['dollar-sign', 'credit-card', 'wallet', 'coins', 'banknote'],
  default: ['star', 'check-circle', 'arrow-right', 'box', 'layers'],
};

export default {
  SLOT_TYPES,
  PRD_FIELD_MAPPINGS,
  DEFAULT_TOKEN_OVERRIDES,
  ICON_SUGGESTIONS,
  createTextSlot,
  createRichTextSlot,
  createListSlot,
  createContentMap,
  createValidation,
};

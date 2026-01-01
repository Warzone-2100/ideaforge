// ============================================================================
// CODE TEMPLATES REGISTRY
// ============================================================================
//
// Central registry for all code-based templates.
// Templates are full HTML/CSS files with data-slot attributes for content.
//
// ============================================================================

import { EMPIRE_BUILDER_TEMPLATE } from './landing/empire-builder';
import { IDEAFORGE_WORKFLOW_TEMPLATE } from './landing/ideaforge-workflow';
import { DESIGN_STUDIO_TEMPLATE } from './dashboard/design-studio';
import { NEXUS_ENTERPRISE_TEMPLATE } from './landing/nexus-enterprise';

/**
 * All available code templates
 */
export const CODE_TEMPLATES = [
  EMPIRE_BUILDER_TEMPLATE,
  IDEAFORGE_WORKFLOW_TEMPLATE,
  DESIGN_STUDIO_TEMPLATE,
  NEXUS_ENTERPRISE_TEMPLATE,
];

/**
 * Get all code templates
 */
export function getCodeTemplates() {
  return CODE_TEMPLATES;
}

/**
 * Get a code template by ID
 */
export function getCodeTemplateById(id) {
  return CODE_TEMPLATES.find((t) => t.id === id) || null;
}

/**
 * Get code templates by category
 */
export function getCodeTemplatesByCategory(category) {
  return CODE_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Search code templates by tags
 */
export function searchCodeTemplates(searchTags) {
  if (!searchTags || searchTags.length === 0) return CODE_TEMPLATES;

  const normalizedSearch = searchTags.map((t) => t.toLowerCase());

  return CODE_TEMPLATES.filter((template) => {
    const templateTags = (template.meta?.tags || []).map((t) => t.toLowerCase());
    return normalizedSearch.some((tag) => templateTags.includes(tag));
  });
}

/**
 * Get template categories with counts
 */
export function getTemplateCategories() {
  const categories = {};

  CODE_TEMPLATES.forEach((template) => {
    const cat = template.category || 'other';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return Object.entries(categories).map(([name, count]) => ({
    name,
    count,
    label: name.charAt(0).toUpperCase() + name.slice(1),
  }));
}

export default {
  CODE_TEMPLATES,
  getCodeTemplates,
  getCodeTemplateById,
  getCodeTemplatesByCategory,
  searchCodeTemplates,
  getTemplateCategories,
};

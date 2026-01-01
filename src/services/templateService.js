// ============================================================================
// TEMPLATE SERVICE
// ============================================================================
//
// Handles:
// 1. Loading and validating code templates
// 2. Extracting content slots from HTML
// 3. Filling slots with content
// 4. Applying design token overrides
// 5. Generating final HTML output
//
// ============================================================================

import { SLOT_TYPES } from '../data/templates/contentMaps/schema';

/**
 * Escape HTML special characters
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get nested value from object using dot notation
 * e.g., getNestedValue(obj, 'colors.primary') => obj.colors.primary
 */
export function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Parse template and extract slot information
 * Returns: { slots: [...], sections: {...} }
 */
export function parseTemplate(template) {
  const sections = template.contentMap?.sections || {};

  if (typeof window === 'undefined') {
    // Server-side: return slots from contentMap directly
    return {
      slots: template.contentMap?.slots || [],
      sections,
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(template.html, 'text/html');
  const extractedSlots = [];

  // Find all data-slot elements
  doc.querySelectorAll('[data-slot]').forEach((el) => {
    const slotId = el.getAttribute('data-slot');
    const slotDef = template.contentMap?.slots?.find((s) => s.id === slotId);

    if (slotDef) {
      extractedSlots.push({
        ...slotDef,
        element: el.tagName.toLowerCase(),
        currentValue: el.textContent.trim(),
      });
    }
  });

  // Find all data-slot-list elements
  doc.querySelectorAll('[data-slot-list]').forEach((el) => {
    const slotId = el.getAttribute('data-slot-list');
    const slotDef = template.contentMap?.slots?.find((s) => s.id === slotId);

    if (slotDef) {
      extractedSlots.push({
        ...slotDef,
        element: el.tagName.toLowerCase(),
        isList: true,
      });
    }
  });

  return {
    slots: extractedSlots,
    sections,
  };
}

/**
 * Generate HTML for a feature card
 */
export function generateFeatureCard(feature, index, template) {
  const iconName = feature.icon || 'sparkles';
  const title = escapeHtml(feature.title || feature.name || 'Feature');
  const description = escapeHtml(feature.description || '');
  const tags = feature.tags || [];

  // Use template's feature card style if defined, otherwise use default
  return `
    <div class="glass-panel p-8 rounded-xl relative overflow-hidden group" style="animation-delay: ${index * 0.1}s">
      <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 text-white">
        <span class="iconify" data-icon="lucide:${iconName}" data-width="20"></span>
      </div>
      <h3 class="text-xl font-medium text-white mb-2">${title}</h3>
      <p class="text-sm text-neutral-400 leading-relaxed mb-4">${description}</p>
      ${
        tags.length > 0
          ? `
        <div class="flex gap-2 text-xs flex-wrap">
          ${tags.map((tag) => `<span class="px-2 py-1 bg-white/5 border border-white/10 rounded text-neutral-300">${escapeHtml(tag)}</span>`).join('')}
        </div>
      `
          : ''
      }
    </div>
  `;
}

/**
 * Generate HTML for a roadmap item
 */
export function generateRoadmapItem(item, index) {
  const title = escapeHtml(item.title || 'Phase');
  const description = escapeHtml(item.description || '');
  const status = item.status || 'planned';

  const statusColors = {
    completed: 'bg-white',
    'in-progress': 'bg-white',
    current: 'bg-white',
    planned: 'bg-neutral-600',
  };

  const dotColor = statusColors[status] || statusColors.planned;
  const isActive = status === 'completed' || status === 'in-progress' || status === 'current';

  return `
    <div class="relative">
      <span class="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full bg-black border border-white/20 flex items-center justify-center">
        <span class="h-1.5 w-1.5 rounded-full ${dotColor}"></span>
      </span>
      <h4 class="text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-300'}">${title}</h4>
      <p class="text-xs ${isActive ? 'text-neutral-400' : 'text-neutral-500'} mt-1">${description}</p>
    </div>
  `;
}

/**
 * Generate HTML for a nav link
 */
export function generateNavLink(link) {
  const text = escapeHtml(link.text || 'Link');
  const href = link.href || '#';
  return `<a href="${href}" class="text-xs text-neutral-400 hover:text-white transition-colors">${text}</a>`;
}

/**
 * Generate HTML for a tech stack item
 */
export function generateTechStackItem(item) {
  const name = escapeHtml(item.name || 'Technology');
  const icon = item.icon || 'cpu';
  return `
    <div class="flex items-center gap-2">
      <span class="iconify" data-icon="lucide:${icon}"></span>
      <span class="font-semibold tracking-tight text-white">${name}</span>
    </div>
  `;
}

/**
 * Generate HTML for list items based on slot type
 */
export function generateListHtml(slot, items, template) {
  if (!items || !Array.isArray(items)) return '';

  switch (slot.id) {
    case 'features':
      return items.map((item, index) => generateFeatureCard(item, index, template)).join('\n');

    case 'roadmap':
      return items.map((item, index) => generateRoadmapItem(item, index)).join('\n');

    case 'nav_links':
      return items.map((item) => generateNavLink(item)).join('\n');

    case 'tech_stack':
      return items.map((item) => generateTechStackItem(item)).join('\n');

    default:
      // Generic list item
      return items
        .map((item) => {
          if (typeof item === 'string') {
            return `<div>${escapeHtml(item)}</div>`;
          }
          return `<div>${escapeHtml(item.text || item.title || JSON.stringify(item))}</div>`;
        })
        .join('\n');
  }
}

/**
 * Fill template slots with content
 */
export function fillSlots(template, filledContent) {
  let html = template.html;

  // Replace text and rich_text slots
  template.contentMap?.slots
    ?.filter((slot) => slot.type === SLOT_TYPES.TEXT || slot.type === SLOT_TYPES.RICH_TEXT)
    .forEach((slot) => {
      const value = filledContent[slot.id] ?? slot.fallback ?? '';

      // Match data-slot attribute and replace inner content
      // This regex finds elements with data-slot="slotId" and replaces their content
      const regex = new RegExp(
        `(<[^>]+data-slot="${slot.id}"[^>]*>)([\\s\\S]*?)(<\\/[^>]+>)`,
        'g'
      );

      html = html.replace(regex, (match, openTag, oldContent, closeTag) => {
        const escapedValue = slot.type === SLOT_TYPES.RICH_TEXT ? value : escapeHtml(value);
        return `${openTag}${escapedValue}${closeTag}`;
      });
    });

  // Handle list slots
  template.contentMap?.slots
    ?.filter((slot) => slot.type === SLOT_TYPES.LIST)
    .forEach((slot) => {
      const items = filledContent[slot.id] ?? slot.fallback ?? [];
      const listHtml = generateListHtml(slot, items, template);

      // Match data-slot-list attribute and replace inner content
      const regex = new RegExp(
        `(<[^>]+data-slot-list="${slot.id}"[^>]*>)([\\s\\S]*?)(<\\/[^>]+>)`,
        'g'
      );

      html = html.replace(regex, (match, openTag, oldContent, closeTag) => {
        return `${openTag}\n${listHtml}\n${closeTag}`;
      });
    });

  return html;
}

/**
 * Apply design tokens as CSS variable overrides
 */
export function applyDesignTokens(html, designLanguage, tokenMap) {
  if (!designLanguage || !tokenMap) return html;

  const cssOverrides = Object.entries(tokenMap)
    .map(([cssVar, tokenPath]) => {
      const value = getNestedValue(designLanguage, tokenPath);
      if (!value) return null;

      // Handle font family specially
      if (cssVar.includes('font') && !cssVar.includes('size')) {
        return `${cssVar}: '${value}', sans-serif;`;
      }

      // Handle pixel values
      if (typeof value === 'number') {
        return `${cssVar}: ${value}px;`;
      }

      return `${cssVar}: ${value};`;
    })
    .filter(Boolean)
    .join('\n      ');

  if (!cssOverrides) return html;

  // Create style tag with CSS variable overrides
  const styleTag = `
  <style id="design-token-overrides">
    :root {
      ${cssOverrides}
    }
  </style>`;

  // Insert before closing </head>
  return html.replace('</head>', `${styleTag}\n</head>`);
}

/**
 * Generate complete output HTML
 */
export function generateOutput(template, filledContent, designLanguage) {
  // 1. Fill content slots
  let html = fillSlots(template, filledContent);

  // 2. Apply design tokens
  if (designLanguage && template.contentMap?.designTokenOverrides) {
    html = applyDesignTokens(html, designLanguage, template.contentMap.designTokenOverrides);
  }

  return html;
}

/**
 * Validate filled content against slot schemas
 */
export function validateContent(template, filledContent) {
  const errors = [];

  template.contentMap?.slots?.forEach((slot) => {
    const value = filledContent[slot.id];
    const validation = slot.validation || {};

    // Required check
    if (validation.required && !value) {
      errors.push({
        slotId: slot.id,
        message: `${slot.label} is required`,
      });
    }

    // Max length check for text
    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
      errors.push({
        slotId: slot.id,
        message: `${slot.label} exceeds maximum length of ${validation.maxLength}`,
      });
    }

    // Min length check for lists
    if (validation.minLength && Array.isArray(value) && value.length < validation.minLength) {
      errors.push({
        slotId: slot.id,
        message: `${slot.label} requires at least ${validation.minLength} items`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get slot groups organized by section
 */
export function getSlotsBySection(template) {
  const sections = template.contentMap?.sections || {};
  const slots = template.contentMap?.slots || [];

  const result = {};

  Object.entries(sections).forEach(([sectionName, slotIds]) => {
    result[sectionName] = slotIds
      .map((id) => slots.find((s) => s.id === id))
      .filter(Boolean);
  });

  // Add ungrouped slots to 'other' section
  const groupedIds = new Set(Object.values(sections).flat());
  const ungrouped = slots.filter((s) => !groupedIds.has(s.id));

  if (ungrouped.length > 0) {
    result.other = ungrouped;
  }

  return result;
}

export default {
  parseTemplate,
  fillSlots,
  applyDesignTokens,
  generateOutput,
  validateContent,
  getSlotsBySection,
  generateListHtml,
  escapeHtml,
  getNestedValue,
};

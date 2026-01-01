// ============================================================================
// ARCHETYPE SYSTEM
// ============================================================================
//
// Template personality types for intent-driven matching.
// Used by archetypeMatchingService to score template fit.
//
// ============================================================================

export { ARCHETYPES, ARCHETYPE_SIGNALS } from './schema';

/**
 * Get archetype by ID
 */
export function getArchetype(id) {
  const { ARCHETYPES } = require('./schema');
  return ARCHETYPES[id] || null;
}

/**
 * Get all archetype IDs
 */
export function getArchetypeIds() {
  const { ARCHETYPES } = require('./schema');
  return Object.keys(ARCHETYPES);
}

/**
 * Get archetype display info for UI
 */
export function getArchetypeDisplayInfo(id) {
  const { ARCHETYPES } = require('./schema');
  const arch = ARCHETYPES[id];
  if (!arch) return null;

  return {
    id: arch.id,
    name: arch.name,
    description: arch.description,
    icon: arch.icon,
    color: arch.color,
  };
}

/**
 * Get all archetypes as array for dropdowns
 */
export function getArchetypeOptions() {
  const { ARCHETYPES } = require('./schema');
  return Object.values(ARCHETYPES).map(arch => ({
    value: arch.id,
    label: arch.name,
    description: arch.description,
    color: arch.color,
  }));
}

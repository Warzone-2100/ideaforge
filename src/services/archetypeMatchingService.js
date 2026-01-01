// ============================================================================
// ARCHETYPE MATCHING SERVICE
// ============================================================================
//
// Client-side matching algorithm for template selection.
// Calculates match scores between design intent and templates.
//
// ============================================================================

import { ARCHETYPES } from '../data/templates/archetypes';

/**
 * Weight distribution for match scoring
 */
const MATCH_WEIGHTS = {
  archetype: 0.40,  // Primary archetype match
  audience: 0.25,   // Audience alignment
  tone: 0.20,       // Tone compatibility
  content: 0.15,    // Content strategy fit
};

/**
 * Calculate match score between design intent and a template
 * @param {Object} designIntent - Extracted design intent
 * @param {Object} template - Template with archetype metadata
 * @returns {Object} { score, breakdown, recommendation }
 */
export function calculateTemplateMatch(designIntent, template) {
  if (!designIntent?.archetype || !template?.archetype) {
    return {
      score: 50,
      breakdown: { archetype: 50, audience: 50, tone: 50, content: 50 },
      recommendation: 'Unknown',
    };
  }

  // 1. Archetype Score (40%)
  const archetypeScore = calculateArchetypeScore(designIntent.archetype, template.archetype);

  // 2. Audience Score (25%)
  const audienceScore = calculateAudienceScore(designIntent.audience, template.archetype);

  // 3. Tone Score (20%)
  const toneScore = calculateToneScore(designIntent.tone, template.archetype);

  // 4. Content Strategy Score (15%)
  const contentScore = calculateContentScore(designIntent, template);

  // Weighted total
  const totalScore = Math.round(
    archetypeScore * MATCH_WEIGHTS.archetype +
    audienceScore * MATCH_WEIGHTS.audience +
    toneScore * MATCH_WEIGHTS.tone +
    contentScore * MATCH_WEIGHTS.content
  );

  // Recommendation based on score
  const recommendation =
    totalScore >= 85 ? 'Excellent Match' :
    totalScore >= 70 ? 'Good Match' :
    totalScore >= 55 ? 'Decent Match' :
    'Consider Alternatives';

  return {
    score: totalScore,
    breakdown: {
      archetype: archetypeScore,
      audience: audienceScore,
      tone: toneScore,
      content: contentScore,
    },
    recommendation,
  };
}

/**
 * Calculate archetype compatibility score
 */
function calculateArchetypeScore(intentArchetype, templateArchetype) {
  // Exact primary match
  if (templateArchetype.primary === intentArchetype) {
    return 100;
  }

  // Secondary match
  if (templateArchetype.secondary?.includes(intentArchetype)) {
    return 80;
  }

  // Use compatibility map if available
  if (templateArchetype.compatibility?.[intentArchetype]) {
    return templateArchetype.compatibility[intentArchetype];
  }

  // Default low score for mismatched archetypes
  return 30;
}

/**
 * Calculate audience alignment score
 */
function calculateAudienceScore(intentAudience, templateArchetype) {
  if (!intentAudience?.primary) return 50;

  const archetype = ARCHETYPES[templateArchetype.primary];
  if (!archetype?.audienceMatch) return 50;

  // Get audience match score from archetype definition
  const audienceKey = intentAudience.primary.toLowerCase();
  const matchScore = archetype.audienceMatch[audienceKey];

  if (matchScore !== undefined) {
    return matchScore;
  }

  // Partial matching for similar audiences
  const audienceMapping = {
    developers: ['developers', 'engineers', 'technical'],
    enterprise: ['enterprise', 'business', 'corporate'],
    startup: ['startup', 'teams', 'founders'],
    consumer: ['consumer', 'users', 'customers'],
    creator: ['creator', 'designers', 'artists'],
  };

  for (const [key, aliases] of Object.entries(audienceMapping)) {
    if (aliases.some(a => audienceKey.includes(a))) {
      return archetype.audienceMatch[key] || 50;
    }
  }

  return 50;
}

/**
 * Calculate tone compatibility score
 */
function calculateToneScore(intentTone, templateArchetype) {
  if (!intentTone?.primary) return 50;

  const archetype = ARCHETYPES[templateArchetype.primary];
  if (!archetype?.tone) return 50;

  let score = 50;

  // Primary tone match
  if (archetype.tone.primary === intentTone.primary) {
    score += 30;
  } else if (archetype.tone.secondary === intentTone.primary) {
    score += 20;
  }

  // Secondary tone match
  if (intentTone.secondary) {
    if (archetype.tone.primary === intentTone.secondary) {
      score += 15;
    } else if (archetype.tone.secondary === intentTone.secondary) {
      score += 10;
    }
  }

  // Penalty for avoided tones
  if (intentTone.avoid?.length && archetype.tone.avoid?.length) {
    const sharedAvoid = intentTone.avoid.filter(t =>
      archetype.tone.avoid.includes(t)
    );
    score += sharedAvoid.length * 5; // Bonus for aligned avoidance
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate content strategy fit score
 */
function calculateContentScore(designIntent, template) {
  let score = 50;

  const archetype = ARCHETYPES[template.archetype?.primary];
  if (!archetype?.contentStrategy) return score;

  // Check hero approach alignment
  const heroApproach = archetype.heroApproach;
  if (designIntent.keyMessages?.length > 0) {
    // Higher score if we have key messages to work with
    score += 20;
  }

  // Check trust signal compatibility
  if (designIntent.trustSignals?.length > 0) {
    const trustElements = archetype.contentStrategy.trust?.elements || [];
    const intentTypes = designIntent.trustSignals.map(t => t.type);

    const matchingTypes = {
      metric: ['uptime', 'user-count', 'growth'],
      certification: ['certifications', 'sla'],
      social: ['testimonials', 'community-size', 'social-proof'],
      press: ['press-logos', 'awards'],
    };

    let matches = 0;
    for (const type of intentTypes) {
      const expectedElements = matchingTypes[type] || [];
      if (expectedElements.some(e => trustElements.includes(e))) {
        matches++;
      }
    }

    score += matches * 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Rank templates by match score
 * @param {Object} designIntent - Extracted design intent
 * @param {Array} templates - Array of templates to rank
 * @returns {Array} Templates sorted by match score, with match data attached
 */
export function rankTemplates(designIntent, templates) {
  if (!templates?.length) return [];

  const rankedTemplates = templates.map(template => {
    const match = calculateTemplateMatch(designIntent, template);
    return {
      ...template,
      match,
    };
  });

  // Sort by score descending
  rankedTemplates.sort((a, b) => b.match.score - a.match.score);

  return rankedTemplates;
}

/**
 * Get match quality tier for UI display
 * @param {number} score - Match score 0-100
 * @returns {Object} { tier, color, label }
 */
export function getMatchTier(score) {
  if (score >= 85) {
    return { tier: 'excellent', color: '#10B981', label: 'Excellent Match' };
  }
  if (score >= 70) {
    return { tier: 'good', color: '#3B82F6', label: 'Good Match' };
  }
  if (score >= 55) {
    return { tier: 'decent', color: '#F59E0B', label: 'Decent Match' };
  }
  return { tier: 'low', color: '#6B7280', label: 'Low Match' };
}

/**
 * Get archetype color for UI
 * @param {string} archetypeId
 * @returns {string} Hex color
 */
export function getArchetypeColor(archetypeId) {
  const archetype = ARCHETYPES[archetypeId];
  return archetype?.color || '#6B7280';
}

export default {
  calculateTemplateMatch,
  rankTemplates,
  getMatchTier,
  getArchetypeColor,
  MATCH_WEIGHTS,
};

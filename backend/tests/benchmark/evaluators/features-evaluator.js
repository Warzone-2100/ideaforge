/**
 * Feature Quality Evaluator
 * Scores feature generation on multiple criteria (1-10 scale)
 */

export function evaluateFeatures(generated, expected, research) {
  const scores = {
    creativity: 0,        // Unique, not generic
    evidence: 0,          // Cites research
    clarity: 0,           // Clear user stories
    acceptanceCriteria: 0,// Specific, testable criteria
    edgeCases: 0,         // Identifies edge cases
    completeness: 0,      // Covers all aspects
  };

  // 1. Creativity Score (1-10)
  // Check for generic phrases
  const genericPhrases = [
    'user-friendly', 'intuitive', 'seamless', 'modern',
    'clean', 'professional', 'easy to use'
  ];

  const featureText = JSON.stringify(generated).toLowerCase();
  const genericCount = genericPhrases.filter(p => featureText.includes(p)).length;
  scores.creativity = Math.max(1, 10 - (genericCount * 2));

  // 2. Evidence Score (1-10)
  // Check if features reference research
  const researchKeywords = extractKeywords(research);
  const evidenceCount = generated.filter(f =>
    researchKeywords.some(kw =>
      f.description?.toLowerCase().includes(kw) ||
      f.reasoning?.toLowerCase().includes(kw)
    )
  ).length;
  scores.evidence = Math.min(10, (evidenceCount / generated.length) * 10);

  // 3. Clarity Score (1-10)
  // Check user story format
  const validStories = generated.filter(f =>
    f.userStory?.match(/As a .*, I want .*, so that .*/)
  ).length;
  scores.clarity = Math.min(10, (validStories / generated.length) * 10);

  // 4. Acceptance Criteria Score (1-10)
  // Check for specific, testable criteria
  const avgCriteriaLength = generated.reduce((sum, f) =>
    sum + (f.acceptanceCriteria?.length || 0), 0
  ) / generated.length;
  scores.acceptanceCriteria = Math.min(10, avgCriteriaLength * 2);

  // 5. Edge Cases Score (1-10)
  const avgEdgeCases = generated.reduce((sum, f) =>
    sum + (f.edgeCases?.length || 0), 0
  ) / generated.length;
  scores.edgeCases = Math.min(10, avgEdgeCases * 3);

  // 6. Completeness Score (1-10)
  const hasAllFields = generated.filter(f =>
    f.name && f.description && f.userStory &&
    f.acceptanceCriteria && f.priority
  ).length;
  scores.completeness = Math.min(10, (hasAllFields / generated.length) * 10);

  // Calculate overall score (weighted average)
  const weights = {
    creativity: 0.20,
    evidence: 0.25,        // Most important
    clarity: 0.15,
    acceptanceCriteria: 0.20,
    edgeCases: 0.10,
    completeness: 0.10,
  };

  const overallScore = Object.entries(scores).reduce((sum, [key, score]) =>
    sum + (score * weights[key]), 0
  );

  return {
    overall: Math.round(overallScore * 10) / 10,
    breakdown: scores,
    details: {
      featureCount: generated.length,
      avgCriteriaPerFeature: avgCriteriaLength,
      avgEdgeCasesPerFeature: avgEdgeCases,
    }
  };
}

function extractKeywords(text) {
  // Simple keyword extraction (can be improved)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4);

  return [...new Set(words)];
}

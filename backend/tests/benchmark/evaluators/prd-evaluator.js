/**
 * PRD Quality Evaluator
 * Scores PRD generation on multiple criteria (1-10 scale)
 */

export function evaluatePRD(generated, research, features) {
  const scores = {
    functionalReqs: 0,    // FR format quality
    nonFunctionalReqs: 0, // NFR coverage
    traceability: 0,      // Links to features
    specificity: 0,       // Not generic
    completeness: 0,      // All sections present
    technicalDepth: 0,    // Architecture details
  };

  const prdText = generated.toLowerCase();

  // 1. Functional Requirements Score (1-10)
  // Check for FR format: "FR#: [Actor] can [capability]"
  const frMatches = generated.match(/FR\d+:/gi) || [];
  scores.functionalReqs = Math.min(10, frMatches.length * 1.5);

  // 2. Non-Functional Requirements Score (1-10)
  const nfrKeywords = [
    'performance', 'scalability', 'security', 'accessibility',
    'reliability', 'maintainability', 'usability'
  ];
  const nfrCount = nfrKeywords.filter(kw => prdText.includes(kw)).length;
  scores.nonFunctionalReqs = Math.min(10, nfrCount * 1.5);

  // 3. Traceability Score (1-10)
  // Check if PRD references feature names
  const featureNames = features.map(f => f.name.toLowerCase());
  const tracedFeatures = featureNames.filter(name =>
    prdText.includes(name)
  ).length;
  scores.traceability = Math.min(10, (tracedFeatures / features.length) * 10);

  // 4. Specificity Score (1-10)
  const genericPhrases = [
    'best practices', 'industry standard', 'high quality',
    'user-friendly', 'easy to use', 'modern'
  ];
  const genericCount = genericPhrases.filter(p => prdText.includes(p)).length;
  scores.specificity = Math.max(1, 10 - (genericCount * 1.5));

  // 5. Completeness Score (1-10)
  const requiredSections = [
    'functional requirements',
    'non-functional requirements',
    'technical',
    'architecture',
    'data model',
    'api'
  ];
  const presentSections = requiredSections.filter(section =>
    prdText.includes(section)
  ).length;
  scores.completeness = Math.min(10, (presentSections / requiredSections.length) * 10);

  // 6. Technical Depth Score (1-10)
  const technicalElements = [
    prdText.includes('database'),
    prdText.includes('api'),
    prdText.includes('authentication'),
    prdText.includes('middleware'),
    prdText.includes('component'),
    prdText.includes('endpoint'),
    prdText.includes('schema'),
    prdText.includes('route'),
  ].filter(Boolean).length;
  scores.technicalDepth = Math.min(10, technicalElements * 1.25);

  // Calculate overall score
  const weights = {
    functionalReqs: 0.25,     // Most important
    nonFunctionalReqs: 0.15,
    traceability: 0.20,       // Important for consistency
    specificity: 0.15,
    completeness: 0.15,
    technicalDepth: 0.10,
  };

  const overallScore = Object.entries(scores).reduce((sum, [key, score]) =>
    sum + (score * weights[key]), 0
  );

  return {
    overall: Math.round(overallScore * 10) / 10,
    breakdown: scores,
    details: {
      wordCount: generated.split(/\s+/).length,
      frCount: frMatches.length,
      sections: (generated.match(/^##/gm) || []).length,
    }
  };
}

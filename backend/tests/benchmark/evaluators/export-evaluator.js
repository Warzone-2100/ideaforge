/**
 * Export Prompt Quality Evaluator
 * Scores Claude Code prompt generation (1-10 scale)
 */

export function evaluateExport(generated, research, features, prd) {
  const scores = {
    specificity: 0,       // Not generic templates
    evidence: 0,          // References research/features
    actionability: 0,     // Claude Code can execute
    structure: 0,         // Well-organized sections
    mcpDirectives: 0,     // Includes MCP usage
    skillsIntegration: 0, // Uses Skills Library patterns
  };

  const promptText = generated.toLowerCase();

  // 1. Specificity Score (1-10)
  const genericPhrases = [
    'clean and modern', 'user-friendly', 'best practices',
    'industry standard', 'scalable', 'maintainable', 'robust'
  ];
  const genericCount = genericPhrases.filter(p => promptText.includes(p)).length;
  scores.specificity = Math.max(1, 10 - (genericCount * 1.5));

  // 2. Evidence Score (1-10)
  const featureNames = features.map(f => f.name.toLowerCase());
  const mentionedFeatures = featureNames.filter(name =>
    promptText.includes(name)
  ).length;
  scores.evidence = Math.min(10, (mentionedFeatures / features.length) * 10);

  // 3. Actionability Score (1-10)
  const actionableElements = [
    promptText.includes('step 1') || promptText.includes('1.'),
    promptText.includes('implement'),
    promptText.includes('create'),
    promptText.includes('file structure'),
    promptText.includes('install') || promptText.includes('npm'),
  ].filter(Boolean).length;
  scores.actionability = actionableElements * 2;

  // 4. Structure Score (1-10)
  const hasStructure = [
    promptText.includes('## ') || promptText.includes('# '),
    promptText.includes('```'),
    promptText.includes('requirements'),
    promptText.includes('technical'),
    promptText.includes('implementation'),
  ].filter(Boolean).length;
  scores.structure = hasStructure * 2;

  // 5. MCP Directives Score (1-10)
  const mcpMentions = [
    promptText.includes('context7'),
    promptText.includes('use context7'),
    promptText.includes('mcp'),
    promptText.includes('fetch latest'),
  ].filter(Boolean).length;
  scores.mcpDirectives = mcpMentions * 2.5;

  // 6. Skills Integration Score (1-10)
  const skillsMentions = [
    promptText.includes('stripe'),
    promptText.includes('firebase'),
    promptText.includes('integration pattern'),
    promptText.includes('quick start'),
  ].filter(Boolean).length;
  scores.skillsIntegration = skillsMentions * 2.5;

  // Calculate overall score
  const weights = {
    specificity: 0.25,      // Very important
    evidence: 0.20,
    actionability: 0.20,    // Critical
    structure: 0.15,
    mcpDirectives: 0.10,
    skillsIntegration: 0.10,
  };

  const overallScore = Object.entries(scores).reduce((sum, [key, score]) =>
    sum + (score * weights[key]), 0
  );

  return {
    overall: Math.round(overallScore * 10) / 10,
    breakdown: scores,
    details: {
      wordCount: generated.split(/\s+/).length,
      codeBlocks: (generated.match(/```/g) || []).length / 2,
      sections: (generated.match(/^##/gm) || []).length,
    }
  };
}

/**
 * Benchmark Utilities
 */

/**
 * Calculate average of an array of numbers
 */
export function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Calculate cost based on model pricing
 */
export function calculateCost(model, inputTokens, outputTokens) {
  const pricing = {
    // DeepSeek
    'deepseek/deepseek-v3': { input: 0.14, output: 0.28 },
    'deepseek/deepseek-r1': { input: 0.55, output: 2.19 },
    'deepseek/deepseek-chat': { input: 0.14, output: 0.28 },

    // Zhipu GLM (via Z.ai on OpenRouter)
    'z-ai/glm-4.7': { input: 0.40, output: 1.50 },
    'zhipu/glm-4.7': { input: 0.40, output: 1.50 },  // Alias
    'zhipu/glm-4': { input: 13.70, output: 13.70 },
    'zhipu/glm-4-air': { input: 0.14, output: 0.14 },

    // Anthropic Claude
    'anthropic/claude-4.5-sonnet': { input: 3.00, output: 15.00 },
    'anthropic/claude-4.5-opus': { input: 5.00, output: 25.00 },
    'anthropic/claude-4.5-haiku': { input: 1.00, output: 5.00 },
    'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },

    // Google Gemini
    'google/gemini-3-pro-preview': { input: 2.00, output: 12.00 },
    'google/gemini-3-flash-preview': { input: 0.50, output: 3.00 },
    'google/gemini-2.5-pro': { input: 1.25, output: 10.00 },
    'google/gemini-2.0-flash-lite': { input: 0.07, output: 0.30 },
    'google/gemini-2.0-flash-exp': { input: 0, output: 0 },

    // MiniMax
    'minimax/minimax-m2.1': { input: 0.20, output: 1.10 },
    'minimax/abab-6.5': { input: 10.00, output: 10.00 },

    // OpenAI
    'openai/gpt-5.2': { input: 1.75, output: 14.00 },

    // Mistral
    'mistralai/mistral-large-2411': { input: 2.00, output: 6.00 },
    'mistralai/codestral-2501': { input: 0.30, output: 0.90 },
  };

  const prices = pricing[model] || { input: 0, output: 0 };
  return (inputTokens / 1_000_000 * prices.input) +
         (outputTokens / 1_000_000 * prices.output);
}

/**
 * Estimate tokens from text (rough approximation)
 */
export function estimateTokens(text) {
  if (!text) return 0;
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Format duration in milliseconds to human-readable
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

/**
 * Round number to N decimal places
 */
export function round(number, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

/**
 * Analyze benchmark results and generate recommendations
 */
export function analyzeBenchmarkResults(results, modelsToTest) {
  const summary = {
    features: {},
    prd: {},
    export: {},
    recommendations: {},
  };

  // Analyze features tests
  const featuresTests = results.tests.filter(t => t.type === 'features');
  for (const model of modelsToTest.features) {
    const modelResults = featuresTests
      .map(t => t.models[model])
      .filter(Boolean)
      .filter(r => !r.error);

    if (modelResults.length > 0) {
      summary.features[model] = {
        avgScore: round(average(modelResults.map(r => r.score || 0))),
        avgCost: round(average(modelResults.map(r => r.cost || 0)), 4),
        avgDuration: Math.round(average(modelResults.map(r => r.duration || 0))),
        successRate: round(modelResults.length / featuresTests.length),
        testCount: modelResults.length,
      };
    }
  }

  // Analyze PRD tests (if any)
  const prdTests = results.tests.filter(t => t.type === 'prd');
  if (prdTests.length > 0 && modelsToTest.prd) {
    for (const model of modelsToTest.prd) {
      const modelResults = prdTests
        .map(t => t.models[model])
        .filter(Boolean)
        .filter(r => !r.error);

      if (modelResults.length > 0) {
        summary.prd[model] = {
          avgScore: round(average(modelResults.map(r => r.score || 0))),
          avgCost: round(average(modelResults.map(r => r.cost || 0)), 4),
          avgDuration: Math.round(average(modelResults.map(r => r.duration || 0))),
          successRate: round(modelResults.length / prdTests.length),
          testCount: modelResults.length,
        };
      }
    }
  }

  // Analyze export tests
  const exportTests = results.tests.filter(t => t.type === 'export');
  for (const model of modelsToTest.export) {
    const modelResults = exportTests
      .map(t => t.models[model])
      .filter(Boolean)
      .filter(r => !r.error);

    if (modelResults.length > 0) {
      summary.export[model] = {
        avgScore: round(average(modelResults.map(r => r.score || 0))),
        avgCost: round(average(modelResults.map(r => r.cost || 0)), 4),
        avgDuration: Math.round(average(modelResults.map(r => r.duration || 0))),
        successRate: round(modelResults.length / exportTests.length),
        testCount: modelResults.length,
      };
    }
  }

  // Make recommendations
  summary.recommendations = {
    features: recommendModel(summary.features, 0.85),
    export: recommendModel(summary.export, 0.90),
  };

  if (Object.keys(summary.prd).length > 0) {
    summary.recommendations.prd = recommendModel(summary.prd, 0.85);
  }

  return summary;
}

/**
 * Recommend best model based on quality threshold
 */
export function recommendModel(stats, threshold) {
  const baseline = stats['anthropic/claude-4.5-sonnet'];

  if (!baseline) {
    // If Claude isn't available, pick highest scoring model
    const entries = Object.entries(stats).sort((a, b) => b[1].avgScore - a[1].avgScore);
    return entries.length > 0 ? entries[0][0] : null;
  }

  const candidates = Object.entries(stats)
    .filter(([model]) => model !== 'anthropic/claude-4.5-sonnet')
    .map(([model, s]) => ({
      model,
      score: s.avgScore,
      cost: s.avgCost,
      qualityRatio: s.avgScore / baseline.avgScore,
      costSavings: baseline.avgCost - s.avgCost,
      value: (s.avgScore / baseline.avgScore) / (s.avgCost / baseline.avgCost), // Quality per dollar
    }))
    .filter(c => c.qualityRatio >= threshold)
    .sort((a, b) => b.value - a.value); // Sort by value (quality per cost)

  return candidates.length > 0 ? candidates[0].model : 'anthropic/claude-4.5-sonnet';
}

/**
 * Print colored console output
 */
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

export function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

import dotenv from 'dotenv';
import { analyzeResearch, generateFeatures, generatePRD, generatePrompt } from '../../services/aiService.js';
import { evaluateFeatures } from './evaluators/features-evaluator.js';
import { evaluatePRD } from './evaluators/prd-evaluator.js';
import { evaluateExport } from './evaluators/export-evaluator.js';
import {
  calculateCost,
  estimateTokens,
  formatDuration,
  analyzeBenchmarkResults,
  colorize,
  round
} from './utils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main Benchmark Runner
 * Tests different models on IdeaForge tasks
 */

const MODELS_TO_TEST = {
  features: [
    'z-ai/glm-4.7',                // Best Value High-IQ ($0.40/$1.50)
    'anthropic/claude-4.5-sonnet', // SOTA Coding ($3.00/$15.00)
    'google/gemini-3-pro-preview', // New reasoning powerhouse ($2.00/$12.00)
  ],
  prd: [
    'z-ai/glm-4.7',
    'anthropic/claude-4.5-sonnet',
  ],
  export: [
    'minimax/minimax-m2.1',        // Agentic coding specialist ($0.20/$1.10)
    'anthropic/claude-4.5-sonnet',
    'z-ai/glm-4.7',
  ],
};

async function runBenchmark() {
  console.log(colorize('🔬 IdeaForge Model Benchmark Suite', 'cyan'));
  console.log(colorize('='.repeat(80), 'dim'));
  console.log();

  // Load fixtures
  const fixturesPath = path.join(__dirname, 'fixtures', 'research-samples.json');
  const fixtures = JSON.parse(await fs.readFile(fixturesPath, 'utf8'));

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {},
  };

  // ============================================================================
  // TEST 1: Features Generation (GLM-4.7 vs Claude vs Gemini)
  // ============================================================================
  console.log(colorize('📋 TEST 1: Features Generation', 'yellow'));
  console.log(colorize('-'.repeat(80), 'dim'));

  // Test with first 5 samples for features
  for (const fixture of fixtures.slice(0, 5)) {
    console.log(`\n  ${colorize(`Testing: ${fixture.name}`, 'bright')}`);
    console.log(colorize(`  Research: ${fixture.research.substring(0, 100)}...`, 'dim'));

    const testResults = {
      fixture: fixture.name,
      fixtureId: fixture.id,
      models: {}
    };

    for (const model of MODELS_TO_TEST.features) {
      console.log(`\n    ${colorize(`Model: ${model}`, 'cyan')}`);

      const startTime = Date.now();

      try {
        // Generate features with this model
        const result = await generateFeatures(
          fixture.research,
          { marketInsights: [], painPoints: [], technicalRequirements: [] },
          { model } // Override model
        );

        const duration = Date.now() - startTime;
        const features = result.features || [];

        // Evaluate quality
        const evaluation = evaluateFeatures(features, null, fixture.research);

        // Calculate cost
        const inputTokens = estimateTokens(fixture.research);
        const outputTokens = estimateTokens(JSON.stringify(features));
        const cost = calculateCost(model, inputTokens, outputTokens);

        testResults.models[model] = {
          score: evaluation.overall,
          breakdown: evaluation.breakdown,
          duration,
          cost,
          featureCount: features.length,
          details: evaluation.details,
        };

        console.log(`      ${colorize('Score:', 'bright')} ${colorize(`${evaluation.overall}/10`, evaluation.overall >= 7 ? 'green' : evaluation.overall >= 5 ? 'yellow' : 'red')}`);
        console.log(`      Duration: ${formatDuration(duration)}`);
        console.log(`      Cost: ${colorize(`$${cost.toFixed(4)}`, 'green')}`);
        console.log(`      Features: ${features.length}`);

      } catch (error) {
        console.error(`      ${colorize(`ERROR: ${error.message}`, 'red')}`);
        testResults.models[model] = {
          error: error.message,
          score: 0,
        };
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.tests.push({
      type: 'features',
      ...testResults,
    });
  }

  // ============================================================================
  // TEST 2: PRD Generation (GLM-4.7 vs Claude)
  // ============================================================================
  console.log(colorize('\n\n📄 TEST 2: PRD Generation', 'yellow'));
  console.log(colorize('-'.repeat(80), 'dim'));

  // Test with first 3 samples for PRD
  for (const fixture of fixtures.slice(0, 3)) {
    console.log(`\n  ${colorize(`Testing: ${fixture.name}`, 'bright')}`);

    // First generate features with default model
    const featuresResult = await generateFeatures(fixture.research, {
      marketInsights: [], painPoints: [], technicalRequirements: []
    });
    const features = featuresResult.features || [];

    const testResults = {
      fixture: fixture.name,
      fixtureId: fixture.id,
      models: {}
    };

    for (const model of MODELS_TO_TEST.prd) {
      console.log(`\n    ${colorize(`Model: ${model}`, 'cyan')}`);

      const startTime = Date.now();

      try {
        const result = await generatePRD(
          fixture.research,
          { marketInsights: [], painPoints: [], technicalRequirements: [] },
          features,
          { model } // Override model
        );

        const duration = Date.now() - startTime;
        const prd = result.prd || '';

        // Evaluate quality
        const evaluation = evaluatePRD(prd, fixture.research, features);

        // Calculate cost
        const inputTokens = estimateTokens(fixture.research + JSON.stringify(features));
        const outputTokens = estimateTokens(prd);
        const cost = calculateCost(model, inputTokens, outputTokens);

        testResults.models[model] = {
          score: evaluation.overall,
          breakdown: evaluation.breakdown,
          duration,
          cost,
          details: evaluation.details,
        };

        console.log(`      ${colorize('Score:', 'bright')} ${colorize(`${evaluation.overall}/10`, evaluation.overall >= 7 ? 'green' : evaluation.overall >= 5 ? 'yellow' : 'red')}`);
        console.log(`      Duration: ${formatDuration(duration)}`);
        console.log(`      Cost: ${colorize(`$${cost.toFixed(4)}`, 'green')}`);
        console.log(`      Word count: ${evaluation.details.wordCount}`);

      } catch (error) {
        console.error(`      ${colorize(`ERROR: ${error.message}`, 'red')}`);
        testResults.models[model] = {
          error: error.message,
          score: 0,
        };
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.tests.push({
      type: 'prd',
      ...testResults,
    });
  }

  // ============================================================================
  // TEST 3: Export Prompts (MiniMax vs Claude vs GLM)
  // ============================================================================
  console.log(colorize('\n\n📤 TEST 3: Export Prompt Generation', 'yellow'));
  console.log(colorize('-'.repeat(80), 'dim'));

  // Test with first 3 samples for export
  for (const fixture of fixtures.slice(0, 3)) {
    console.log(`\n  ${colorize(`Testing: ${fixture.name}`, 'bright')}`);

    // First generate features and PRD with default model
    const featuresResult = await generateFeatures(fixture.research, {
      marketInsights: [], painPoints: [], technicalRequirements: []
    });
    const features = featuresResult.features || [];

    const prdResult = await generatePRD(
      fixture.research,
      { marketInsights: [], painPoints: [], technicalRequirements: [] },
      features
    );
    const prd = prdResult.prd || '';

    const testResults = {
      fixture: fixture.name,
      fixtureId: fixture.id,
      models: {}
    };

    for (const model of MODELS_TO_TEST.export) {
      console.log(`\n    ${colorize(`Model: ${model}`, 'cyan')}`);

      const startTime = Date.now();

      try {
        const result = await generatePrompt(
          'claude',
          fixture.research,
          { marketInsights: [], painPoints: [], technicalRequirements: [] },
          features,
          prd,
          null, // designBrief
          { model } // Override model
        );

        const duration = Date.now() - startTime;
        const prompt = result.prompt || result;

        // Evaluate quality
        const evaluation = evaluateExport(
          prompt,
          fixture.research,
          features,
          prd
        );

        const inputTokens = estimateTokens(
          fixture.research + JSON.stringify(features) + prd
        );
        const outputTokens = estimateTokens(prompt);
        const cost = calculateCost(model, inputTokens, outputTokens);

        testResults.models[model] = {
          score: evaluation.overall,
          breakdown: evaluation.breakdown,
          duration,
          cost,
          promptLength: prompt.length,
          details: evaluation.details,
        };

        console.log(`      ${colorize('Score:', 'bright')} ${colorize(`${evaluation.overall}/10`, evaluation.overall >= 7 ? 'green' : evaluation.overall >= 5 ? 'yellow' : 'red')}`);
        console.log(`      Duration: ${formatDuration(duration)}`);
        console.log(`      Cost: ${colorize(`$${cost.toFixed(4)}`, 'green')}`);
        console.log(`      Length: ${prompt.length} chars`);

      } catch (error) {
        console.error(`      ${colorize(`ERROR: ${error.message}`, 'red')}`);
        testResults.models[model] = {
          error: error.message,
          score: 0,
        };
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.tests.push({
      type: 'export',
      ...testResults,
    });
  }

  // ============================================================================
  // SUMMARY & RECOMMENDATIONS
  // ============================================================================
  console.log('\n\n' + colorize('='.repeat(80), 'dim'));
  console.log(colorize('📊 BENCHMARK RESULTS', 'cyan'));
  console.log(colorize('='.repeat(80), 'dim'));

  const summary = analyzeBenchmarkResults(results, MODELS_TO_TEST);
  results.summary = summary;

  console.log(colorize('\n✅ RECOMMENDED CONFIGURATION:', 'green'));
  console.log();
  console.log(JSON.stringify(summary.recommendations, null, 2));

  console.log(colorize('\n📈 PERFORMANCE SUMMARY:', 'yellow'));
  console.log();

  // Features
  console.log(colorize('Features Generation:', 'bright'));
  for (const [model, stats] of Object.entries(summary.features)) {
    const modelName = model.split('/').pop();
    console.log(`  ${colorize(modelName, 'cyan')}:`);
    console.log(`    Avg Score: ${colorize(`${stats.avgScore}/10`, stats.avgScore >= 7 ? 'green' : 'yellow')}`);
    console.log(`    Avg Cost: ${colorize(`$${stats.avgCost.toFixed(4)}`, 'green')}`);
    console.log(`    Avg Duration: ${formatDuration(stats.avgDuration)}`);
    console.log(`    Success Rate: ${(stats.successRate * 100).toFixed(0)}%`);
  }

  // PRD
  if (Object.keys(summary.prd).length > 0) {
    console.log(colorize('\nPRD Generation:', 'bright'));
    for (const [model, stats] of Object.entries(summary.prd)) {
      const modelName = model.split('/').pop();
      console.log(`  ${colorize(modelName, 'cyan')}:`);
      console.log(`    Avg Score: ${colorize(`${stats.avgScore}/10`, stats.avgScore >= 7 ? 'green' : 'yellow')}`);
      console.log(`    Avg Cost: ${colorize(`$${stats.avgCost.toFixed(4)}`, 'green')}`);
      console.log(`    Avg Duration: ${formatDuration(stats.avgDuration)}`);
      console.log(`    Success Rate: ${(stats.successRate * 100).toFixed(0)}%`);
    }
  }

  // Export
  console.log(colorize('\nExport Generation:', 'bright'));
  for (const [model, stats] of Object.entries(summary.export)) {
    const modelName = model.split('/').pop();
    console.log(`  ${colorize(modelName, 'cyan')}:`);
    console.log(`    Avg Score: ${colorize(`${stats.avgScore}/10`, stats.avgScore >= 7 ? 'green' : 'yellow')}`);
    console.log(`    Avg Cost: ${colorize(`$${stats.avgCost.toFixed(4)}`, 'green')}`);
    console.log(`    Avg Duration: ${formatDuration(stats.avgDuration)}`);
    console.log(`    Success Rate: ${(stats.successRate * 100).toFixed(0)}%`);
  }

  // Decision guidance
  console.log(colorize('\n📋 DECISION GUIDANCE:', 'yellow'));
  console.log();

  // Features decision
  const claudeFeaturesScore = summary.features['anthropic/claude-4.5-sonnet']?.avgScore || 0;
  const glmFeaturesScore = summary.features['z-ai/glm-4.7']?.avgScore || 0;
  const geminiFeaturesScore = summary.features['google/gemini-3-pro-preview']?.avgScore || 0;
  const glmFeaturesRatio = glmFeaturesScore / claudeFeaturesScore;
  const geminiFeaturesRatio = geminiFeaturesScore / claudeFeaturesScore;

  console.log('Features & PRD:');
  if (glmFeaturesRatio >= 0.85) {
    console.log(colorize(`  ✅ GLM-4.7 meets threshold (${(glmFeaturesRatio * 100).toFixed(0)}% of Claude quality)`, 'green'));
    console.log(colorize(`  → Use GLM-4.7 for features and PRD (saves $${((summary.features['anthropic/claude-4.5-sonnet']?.avgCost || 0) - (summary.features['z-ai/glm-4.7']?.avgCost || 0)).toFixed(4)}/request)`, 'green'));
  } else if (geminiFeaturesRatio >= 0.85) {
    console.log(colorize(`  ⚠️  GLM-4.7 below threshold (${(glmFeaturesRatio * 100).toFixed(0)}%)`, 'yellow'));
    console.log(colorize(`  ✅ Gemini 3 Pro meets threshold (${(geminiFeaturesRatio * 100).toFixed(0)}% of Claude quality)`, 'green'));
    console.log(colorize('  → Use Gemini 3 Pro for features and PRD', 'green'));
  } else {
    console.log(colorize(`  ❌ Alternatives below threshold (GLM: ${(glmFeaturesRatio * 100).toFixed(0)}%, Gemini: ${(geminiFeaturesRatio * 100).toFixed(0)}%, need 85%)`, 'red'));
    console.log(colorize('  → Use Claude 4.5 Sonnet for features and PRD', 'yellow'));
  }

  // Export decision
  const claudeExportScore = summary.export['anthropic/claude-4.5-sonnet']?.avgScore || 0;
  const minimaxExportScore = summary.export['minimax/minimax-m2.1']?.avgScore || 0;
  const glmExportScore = summary.export['z-ai/glm-4.7']?.avgScore || 0;
  const minimaxExportRatio = minimaxExportScore / claudeExportScore;
  const glmExportRatio = glmExportScore / claudeExportScore;

  console.log('\nExport Prompts:');
  if (minimaxExportRatio >= 0.90) {
    console.log(colorize(`  ✅ MiniMax M2.1 meets threshold (${(minimaxExportRatio * 100).toFixed(0)}% of Claude quality)`, 'green'));
    console.log(colorize(`  → Use MiniMax M2.1 for export prompts (saves $${((summary.export['anthropic/claude-4.5-sonnet']?.avgCost || 0) - (summary.export['minimax/minimax-m2.1']?.avgCost || 0)).toFixed(4)}/request)`, 'green'));
  } else if (glmExportRatio >= 0.85) {
    console.log(colorize(`  ⚠️  MiniMax below threshold (${(minimaxExportRatio * 100).toFixed(0)}%)`, 'yellow'));
    console.log(colorize(`  ✅ GLM-4.7 meets threshold (${(glmExportRatio * 100).toFixed(0)}% of Claude quality)`, 'green'));
    console.log(colorize('  → Use GLM-4.7 for export prompts', 'green'));
  } else {
    console.log(colorize(`  ❌ Alternatives below threshold (MiniMax: ${(minimaxExportRatio * 100).toFixed(0)}%, GLM: ${(glmExportRatio * 100).toFixed(0)}%, need 90%/85%)`, 'red'));
    console.log(colorize('  → Use Claude 4.5 Sonnet for export prompts', 'yellow'));
  }

  // Save results
  const resultsDir = path.join(__dirname, 'results');
  await fs.mkdir(resultsDir, { recursive: true });
  const resultsPath = path.join(resultsDir, `benchmark-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));

  console.log(colorize(`\n💾 Results saved to: ${resultsPath}`, 'dim'));
  console.log();
}

// Run benchmark
runBenchmark().catch(error => {
  console.error(colorize('\n❌ Benchmark failed:', 'red'));
  console.error(error);
  process.exit(1);
});

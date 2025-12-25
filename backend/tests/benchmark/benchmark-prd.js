import dotenv from 'dotenv';
import { generateFeatures, generatePRD } from '../../services/aiService.js';
import { evaluatePRD } from './evaluators/prd-evaluator.js';
import {
  calculateCost,
  estimateTokens,
  formatDuration,
  colorize,
  round
} from './utils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_TO_TEST = [
  'z-ai/glm-4.7',
  'anthropic/claude-4.5-sonnet',
];

async function runPRDBenchmark() {
  console.log(colorize('🔬 IdeaForge PRD Benchmark', 'cyan'));
  console.log(colorize('='.repeat(80), 'dim'));
  console.log();

  // Load fixtures
  const fixturesPath = path.join(__dirname, 'fixtures', 'research-samples.json');
  const fixtures = JSON.parse(await fs.readFile(fixturesPath, 'utf8'));

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  console.log(colorize('📄 PRD Generation Test', 'yellow'));
  console.log(colorize('-'.repeat(80), 'dim'));

  // Test with first 3 samples
  for (const fixture of fixtures.slice(0, 3)) {
    console.log(`\n  ${colorize(`Testing: ${fixture.name}`, 'bright')}`);

    // First generate features with default model (Gemini via direct API)
    console.log(colorize('    Generating features first...', 'dim'));
    const featuresResult = await generateFeatures(fixture.research, {
      marketInsights: [], painPoints: [], technicalRequirements: []
    });
    const features = featuresResult.features || [];
    console.log(colorize(`    ✓ Generated ${features.length} features\n`, 'dim'));

    const testResults = {
      fixture: fixture.name,
      fixtureId: fixture.id,
      models: {}
    };

    for (const model of MODELS_TO_TEST) {
      console.log(`    ${colorize(`Model: ${model}`, 'cyan')}`);

      const startTime = Date.now();

      try {
        const result = await generatePRD(
          fixture.research,
          { marketInsights: [], painPoints: [], technicalRequirements: [] },
          features,
          { model }
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
        console.log(`      FR Count: ${evaluation.details.frCount}`);
        console.log();

      } catch (error) {
        console.error(`      ${colorize(`ERROR: ${error.message}`, 'red')}\n`);
        testResults.models[model] = {
          error: error.message,
          score: 0,
        };
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.tests.push({
      type: 'prd',
      ...testResults,
    });
  }

  // Summary
  console.log('\n' + colorize('='.repeat(80), 'dim'));
  console.log(colorize('📊 PRD BENCHMARK RESULTS', 'cyan'));
  console.log(colorize('='.repeat(80), 'dim'));
  console.log();

  const summary = {};
  for (const model of MODELS_TO_TEST) {
    const modelResults = results.tests
      .map(t => t.models[model])
      .filter(Boolean)
      .filter(r => !r.error);

    if (modelResults.length > 0) {
      const avgScore = round(modelResults.reduce((sum, r) => sum + r.score, 0) / modelResults.length);
      const avgCost = round(modelResults.reduce((sum, r) => sum + r.cost, 0) / modelResults.length, 4);
      const avgDuration = Math.round(modelResults.reduce((sum, r) => sum + r.duration, 0) / modelResults.length);

      summary[model] = { avgScore, avgCost, avgDuration };

      const modelName = model.split('/').pop();
      console.log(colorize(modelName, 'cyan') + ':');
      console.log(`  Avg Score: ${colorize(`${avgScore}/10`, avgScore >= 7 ? 'green' : 'yellow')}`);
      console.log(`  Avg Cost: ${colorize(`$${avgCost.toFixed(4)}`, 'green')}`);
      console.log(`  Avg Duration: ${formatDuration(avgDuration)}`);
      console.log(`  Success Rate: ${(modelResults.length / results.tests.length * 100).toFixed(0)}%`);
      console.log();
    }
  }

  // Decision
  const claudeScore = summary['anthropic/claude-4.5-sonnet']?.avgScore || 0;
  const glmScore = summary['z-ai/glm-4.7']?.avgScore || 0;
  const ratio = glmScore / claudeScore;

  console.log(colorize('📋 DECISION:', 'yellow'));
  if (ratio >= 0.85) {
    console.log(colorize(`  ✅ GLM-4.7 meets threshold (${(ratio * 100).toFixed(0)}% of Claude quality)`, 'green'));
    const savings = (summary['anthropic/claude-4.5-sonnet']?.avgCost || 0) - (summary['z-ai/glm-4.7']?.avgCost || 0);
    console.log(colorize(`  → Use GLM-4.7 for PRD (saves $${savings.toFixed(4)}/request)`, 'green'));
  } else {
    console.log(colorize(`  ❌ GLM-4.7 below threshold (${(ratio * 100).toFixed(0)}%, need 85%)`, 'red'));
    console.log(colorize('  → Use Claude 4.5 Sonnet for PRD', 'yellow'));
  }

  // Save results
  const resultsDir = path.join(__dirname, 'results');
  await fs.mkdir(resultsDir, { recursive: true });
  const resultsPath = path.join(resultsDir, `prd-benchmark-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));

  console.log(colorize(`\n💾 Results saved to: ${resultsPath}`, 'dim'));
  console.log();
}

runPRDBenchmark().catch(error => {
  console.error(colorize('\n❌ Benchmark failed:', 'red'));
  console.error(error);
  process.exit(1);
});

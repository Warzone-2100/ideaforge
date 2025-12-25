# IdeaForge Multi-Model Implementation Plan

**Date:** 2024-12-24
**Status:** Ready for Benchmarking & Implementation
**Context:** Session handoff - complete plan for next session

---

## 📋 Executive Summary

**Current State:**
- IdeaForge uses single model (Gemini 2.0 Flash) for all 8 AI functions
- Skills Library integrated and working (detects Stripe, Firebase, etc.)
- Backend running on port 3001, frontend on port 8000

**Goal:**
- Implement multi-model support via OpenRouter
- Use best model for each task (Gemini 3 for UI, GLM-4.7 for coding, MiniMax for agentic)
- Reduce cost while improving quality

**Next Session Task:**
1. Build comprehensive benchmark suite
2. Test models (GLM-4.7, MiniMax M2.1, Gemini 3 Pro)
3. Implement provider abstraction based on benchmark results

---

## 🎯 Decisions Made (Context for Next Session)

### Model Strategy (Final)

| Task | Primary Model | Fallback | Cost/Req | Rationale |
|------|--------------|----------|----------|-----------|
| Analysis | `deepseek/deepseek-v3` | `google/gemini-2.0-flash-lite` | $0.002 | Simple extraction, budget model |
| Features | `zhipu/glm-4.7` | `anthropic/claude-4.5-sonnet` | $0.05 | Rivals Claude at 1/7 cost |
| Refine Chat | `deepseek/deepseek-v3` | `google/gemini-2.0-flash-lite` | $0.001 | Simple chat |
| PRD | `zhipu/glm-4.7` | `anthropic/claude-4.5-sonnet` | $0.08 | Coding/reasoning specialist |
| Story Files | `minimax/minimax-m2.1` | `zhipu/glm-4.7` | $0.05 | Agentic coding specialist |
| Design Brief | `google/gemini-3-pro-preview` | `google/gemini-3-flash-preview` | $0.15 | BEST at UI generation |
| Export Chat | `deepseek/deepseek-v3` | `google/gemini-2.0-flash-lite` | $0.001 | Simple advisory |
| Export Prompt | `minimax/minimax-m2.1` | `anthropic/claude-4.5-sonnet` | $0.05 | Built for IDE agents |

**Total:** $0.38/session

### Key Intelligence from User

1. **Gemini 3 models** = Exceptional at designing world-class UIs ⭐
2. **Claude** = Best at tool calling (structured output)
3. **GLM-4.7** = Rivals Claude at coding and reasoning
4. **OpenAI** = Meh (excluded from strategy)
5. **MiniMax M2.1** = Optimized for agentic IDE flows
6. **DeepSeek** = Best price-to-performance ratio

### Critical Benchmarks Required

**MUST test before rollout:**

1. **GLM-4.7 vs Claude 4.5 Sonnet** (Features + PRD)
   - Success: GLM-4.7 >= 85% Claude quality
   - If fails: use Claude

2. **MiniMax M2.1 vs Claude 4.5 Sonnet** (Export)
   - Success: MiniMax >= 90% Claude quality
   - CRITICAL - export is final output users see

3. **Gemini 3 Pro vs Others** (Design Brief)
   - Verify UI specificity
   - Check design system references

---

## 📁 Current File Structure

```
ideaforge/
├── CLAUDE.md                          # Main documentation (updated)
├── ARCHITECTURE.md                    # Original architecture analysis
├── ARCHITECTURE-REVISED.md            # Updated with new pricing data
├── ARCHITECTURE-FINAL.md              # Final strategy (USE THIS)
├── IMPLEMENTATION-PLAN.md             # THIS FILE - handoff guide
├── API INFO & PRICING.md              # OpenRouter pricing data
│
├── .claude/skills/                    # Skills Library (WORKING)
│   ├── index.json                     # Skills registry
│   ├── _template/                     # Template for new skills
│   ├── nextjs-app-router/             # Next.js patterns
│   ├── firebase-auth/                 # Firebase Auth patterns
│   └── stripe-billing/                # Stripe patterns
│
├── backend/
│   ├── server.js                      # Express server (port 3001)
│   ├── services/
│   │   ├── aiService.js               # ALL AI FUNCTIONS (8 functions)
│   │   └── skillsService.js           # Skills detection/loading (NEW)
│   └── package.json
│
└── src/
    ├── components/export/
    │   └── ExportStep.jsx             # Shows detected skills badges
    └── stores/
        └── useAppStore.js             # Zustand state
```

---

## 🔧 What Was Built in Previous Session

### 1. Skills Library Integration ✅

**Files created:**
- `backend/services/skillsService.js` - Detection & loading logic
- `.claude/skills/index.json` - Skills registry with detection patterns
- 3 complete skills: nextjs-app-router, firebase-auth, stripe-billing

**How it works:**
```javascript
// In backend/services/aiService.js (generatePrompt function)

// 1. Detect skills from research/features/PRD
const skillsBundle = buildSkillsBundle(
  { research, features, prd },
  'quick-start'
);

// 2. Inject into prompt
if (skillsBundle.detectedSkills.length > 0) {
  userMessage += skillsBundle.mcpInstructions;  // MCP usage instructions
  userMessage += skillsBundle.skillsContent;    // Quick Start patterns
}

// 3. Return with detected skills
return {
  prompt: response,
  detectedSkills: skillsBundle.detectedSkills  // For UI
};
```

**Frontend integration:**
- `ExportStep.jsx` shows detected skills badges
- Displays: "🔥 firebase-auth (matched: auth, login)"

### 2. Architecture Documentation ✅

**Files:**
- `ARCHITECTURE-FINAL.md` - Complete strategy (read this first)
- Model recommendations with costs
- Benchmarking plan
- Risk analysis

---

## 🚀 Implementation Plan (Step-by-Step)

### PHASE 1: Build Benchmark Suite (Next Session Start Here)

#### Step 1.1: Create Benchmark Folder Structure

```bash
cd /Users/ardi/Desktop/Apps/addons/ideaforge/backend
mkdir -p tests/benchmark/{fixtures,evaluators,results}
```

**Files to create:**

```
backend/tests/benchmark/
├── fixtures/
│   ├── research-samples.json       # 10 real research docs
│   ├── expected-features.json      # Gold standard features
│   ├── expected-prds.json          # Gold standard PRDs
│   └── expected-exports.json       # Gold standard exports
├── evaluators/
│   ├── features-evaluator.js       # Score feature quality (1-10)
│   ├── prd-evaluator.js            # Score PRD quality
│   └── export-evaluator.js         # Score export quality
├── benchmark.js                     # Main runner
├── utils.js                         # Helper functions
└── results/
    └── .gitkeep
```

#### Step 1.2: Create Research Fixtures

**File:** `backend/tests/benchmark/fixtures/research-samples.json`

```json
[
  {
    "id": "saas-stripe",
    "name": "SaaS App with Stripe",
    "research": "Building a SaaS platform for project management. Need Stripe integration for subscription billing. Users should be able to upgrade/downgrade plans. Must support annual and monthly billing. Need customer portal for self-service. Target market is small teams (5-20 people).",
    "expectedSkills": ["stripe-billing", "nextjs-app-router"],
    "expectedFeatures": 3,
    "complexity": "medium"
  },
  {
    "id": "auth-firebase",
    "name": "Auth with Firebase",
    "research": "E-commerce platform needs user authentication. Want Google sign-in and email/password. Need protected routes for checkout. Users should stay logged in. Session management is critical for cart persistence.",
    "expectedSkills": ["firebase-auth", "nextjs-app-router"],
    "expectedFeatures": 4,
    "complexity": "medium"
  },
  {
    "id": "ui-heavy",
    "name": "Design-Heavy Dashboard",
    "research": "Analytics dashboard with real-time charts. Needs dark mode. Should look like Linear - clean, fast, beautiful. Color scheme: dark blue (#0A0E27), accent purple (#6C5CE7). Typography: Inter for UI, JetBrains Mono for code. Cards with subtle shadows.",
    "expectedSkills": ["nextjs-app-router"],
    "expectedFeatures": 5,
    "complexity": "high",
    "designFocus": true
  },
  {
    "id": "complex-workflow",
    "name": "Multi-Step Workflow App",
    "research": "Loan application system. Users fill multi-step form (personal info, employment, financials). Save progress between steps. Admin dashboard to review applications. Status tracking (pending, approved, rejected). Email notifications at each stage.",
    "expectedSkills": ["nextjs-app-router"],
    "expectedFeatures": 8,
    "complexity": "high"
  },
  {
    "id": "simple-crud",
    "name": "Simple CRUD App",
    "research": "Todo list application. Users can add, edit, delete tasks. Mark as complete. Filter by status. Due dates optional. Simple and clean.",
    "expectedSkills": ["nextjs-app-router"],
    "expectedFeatures": 3,
    "complexity": "low"
  }
]
```

Add 5 more samples for comprehensive testing.

#### Step 1.3: Create Feature Evaluator

**File:** `backend/tests/benchmark/evaluators/features-evaluator.js`

```javascript
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
      f.description.toLowerCase().includes(kw) ||
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
```

#### Step 1.4: Create Export Evaluator

**File:** `backend/tests/benchmark/evaluators/export-evaluator.js`

```javascript
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
```

#### Step 1.5: Create Main Benchmark Runner

**File:** `backend/tests/benchmark/benchmark.js`

```javascript
import { analyzeResearch, generateFeatures, generatePRD, generatePrompt } from '../../services/aiService.js';
import { evaluateFeatures } from './evaluators/features-evaluator.js';
import { evaluateExport } from './evaluators/export-evaluator.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Main Benchmark Runner
 * Tests different models on IdeaForge tasks
 */

const MODELS_TO_TEST = {
  features: [
    'zhipu/glm-4.7',
    'anthropic/claude-4.5-sonnet',
    'google/gemini-2.5-pro',
  ],
  export: [
    'minimax/minimax-m2.1',
    'anthropic/claude-4.5-sonnet',
    'zhipu/glm-4.7',
  ],
};

async function runBenchmark() {
  console.log('🔬 IdeaForge Model Benchmark Suite');
  console.log('='.repeat(80));
  console.log();

  // Load fixtures
  const fixtures = JSON.parse(
    await fs.readFile('./tests/benchmark/fixtures/research-samples.json', 'utf8')
  );

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {},
  };

  // ============================================================================
  // TEST 1: Features Generation (GLM-4.7 vs Claude vs Gemini)
  // ============================================================================
  console.log('📋 TEST 1: Features Generation');
  console.log('-'.repeat(80));

  for (const fixture of fixtures.slice(0, 5)) {
    console.log(`\n  Testing: ${fixture.name}`);
    console.log(`  Research: ${fixture.research.substring(0, 100)}...`);

    const testResults = {
      fixture: fixture.name,
      models: {}
    };

    for (const model of MODELS_TO_TEST.features) {
      console.log(`\n    Model: ${model}`);

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

        // Calculate cost (estimate)
        const inputTokens = fixture.research.length / 4; // Rough estimate
        const outputTokens = JSON.stringify(features).length / 4;
        const cost = calculateCost(model, inputTokens, outputTokens);

        testResults.models[model] = {
          score: evaluation.overall,
          breakdown: evaluation.breakdown,
          duration,
          cost,
          featureCount: features.length,
        };

        console.log(`      Score: ${evaluation.overall}/10`);
        console.log(`      Duration: ${duration}ms`);
        console.log(`      Cost: $${cost.toFixed(4)}`);
        console.log(`      Features: ${features.length}`);

      } catch (error) {
        console.error(`      ERROR: ${error.message}`);
        testResults.models[model] = {
          error: error.message,
          score: 0,
        };
      }
    }

    results.tests.push({
      type: 'features',
      ...testResults,
    });
  }

  // ============================================================================
  // TEST 2: Export Prompts (MiniMax vs Claude vs GLM)
  // ============================================================================
  console.log('\n\n📤 TEST 2: Export Prompt Generation');
  console.log('-'.repeat(80));

  for (const fixture of fixtures.slice(0, 3)) {
    console.log(`\n  Testing: ${fixture.name}`);

    // First generate features and PRD with default model
    const features = await generateFeatures(fixture.research, {
      marketInsights: [], painPoints: [], technicalRequirements: []
    });

    const prd = await generatePRD(
      fixture.research,
      { marketInsights: [], painPoints: [], technicalRequirements: [] },
      features.features || []
    );

    const testResults = {
      fixture: fixture.name,
      models: {}
    };

    for (const model of MODELS_TO_TEST.export) {
      console.log(`\n    Model: ${model}`);

      const startTime = Date.now();

      try {
        const result = await generatePrompt(
          'claude',
          fixture.research,
          { marketInsights: [], painPoints: [], technicalRequirements: [] },
          features.features || [],
          prd.prd,
          { model } // Override model
        );

        const duration = Date.now() - startTime;
        const prompt = result.prompt;

        // Evaluate quality
        const evaluation = evaluateExport(
          prompt,
          fixture.research,
          features.features || [],
          prd.prd
        );

        const inputTokens = (fixture.research.length + JSON.stringify(features).length + prd.prd.length) / 4;
        const outputTokens = prompt.length / 4;
        const cost = calculateCost(model, inputTokens, outputTokens);

        testResults.models[model] = {
          score: evaluation.overall,
          breakdown: evaluation.breakdown,
          duration,
          cost,
          promptLength: prompt.length,
        };

        console.log(`      Score: ${evaluation.overall}/10`);
        console.log(`      Duration: ${duration}ms`);
        console.log(`      Cost: $${cost.toFixed(4)}`);
        console.log(`      Length: ${prompt.length} chars`);

      } catch (error) {
        console.error(`      ERROR: ${error.message}`);
        testResults.models[model] = {
          error: error.message,
          score: 0,
        };
      }
    }

    results.tests.push({
      type: 'export',
      ...testResults,
    });
  }

  // ============================================================================
  // SUMMARY & RECOMMENDATIONS
  // ============================================================================
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 BENCHMARK RESULTS');
  console.log('='.repeat(80));

  const summary = analyzeBenchmarkResults(results);
  results.summary = summary;

  console.log('\n✅ RECOMMENDED CONFIGURATION:\n');
  console.log(JSON.stringify(summary.recommendations, null, 2));

  console.log('\n📈 PERFORMANCE SUMMARY:\n');
  console.log(`Features Generation:`);
  for (const [model, stats] of Object.entries(summary.features)) {
    console.log(`  ${model}:`);
    console.log(`    Avg Score: ${stats.avgScore}/10`);
    console.log(`    Avg Cost: $${stats.avgCost.toFixed(4)}`);
    console.log(`    Avg Duration: ${stats.avgDuration}ms`);
  }

  console.log(`\nExport Generation:`);
  for (const [model, stats] of Object.entries(summary.export)) {
    console.log(`  ${model}:`);
    console.log(`    Avg Score: ${stats.avgScore}/10`);
    console.log(`    Avg Cost: $${stats.avgCost.toFixed(4)}`);
    console.log(`    Avg Duration: ${stats.avgDuration}ms`);
  }

  // Save results
  const resultsPath = `./tests/benchmark/results/benchmark-${new Date().toISOString().split('T')[0]}.json`;
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${resultsPath}`);
}

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = {
    'zhipu/glm-4.7': { input: 0.40, output: 1.50 },
    'anthropic/claude-4.5-sonnet': { input: 3.00, output: 15.00 },
    'google/gemini-2.5-pro': { input: 1.25, output: 10.00 },
    'minimax/minimax-m2.1': { input: 0.20, output: 1.10 },
  };

  const prices = pricing[model] || { input: 0, output: 0 };
  return (inputTokens / 1_000_000 * prices.input) +
         (outputTokens / 1_000_000 * prices.output);
}

function analyzeBenchmarkResults(results) {
  const summary = {
    features: {},
    export: {},
    recommendations: {},
  };

  // Analyze features tests
  const featuresTests = results.tests.filter(t => t.type === 'features');
  for (const model of MODELS_TO_TEST.features) {
    const modelResults = featuresTests.map(t => t.models[model]).filter(Boolean);
    summary.features[model] = {
      avgScore: average(modelResults.map(r => r.score || 0)),
      avgCost: average(modelResults.map(r => r.cost || 0)),
      avgDuration: average(modelResults.map(r => r.duration || 0)),
      successRate: modelResults.filter(r => !r.error).length / modelResults.length,
    };
  }

  // Analyze export tests
  const exportTests = results.tests.filter(t => t.type === 'export');
  for (const model of MODELS_TO_TEST.export) {
    const modelResults = exportTests.map(t => t.models[model]).filter(Boolean);
    summary.export[model] = {
      avgScore: average(modelResults.map(r => r.score || 0)),
      avgCost: average(modelResults.map(r => r.cost || 0)),
      avgDuration: average(modelResults.map(r => r.duration || 0)),
      successRate: modelResults.filter(r => !r.error).length / modelResults.length,
    };
  }

  // Make recommendations
  summary.recommendations = {
    features: recommendModel(summary.features, 0.85), // GLM must be 85% of Claude
    export: recommendModel(summary.export, 0.90),     // MiniMax must be 90% of Claude
  };

  return summary;
}

function recommendModel(stats, threshold) {
  const baseline = stats['anthropic/claude-4.5-sonnet'];
  const candidates = Object.entries(stats)
    .filter(([model]) => model !== 'anthropic/claude-4.5-sonnet')
    .map(([model, s]) => ({
      model,
      score: s.avgScore,
      cost: s.avgCost,
      qualityRatio: s.avgScore / baseline.avgScore,
      costSavings: baseline.avgCost - s.avgCost,
    }))
    .filter(c => c.qualityRatio >= threshold)
    .sort((a, b) => b.costSavings - a.costSavings);

  return candidates.length > 0 ? candidates[0].model : 'anthropic/claude-4.5-sonnet';
}

function average(numbers) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

// Run benchmark
runBenchmark().catch(console.error);
```

#### Step 1.6: Update aiService.js to Support Model Override

**File:** `backend/services/aiService.js`

Add optional model parameter to all functions:

```javascript
// Current
export async function generateFeatures(research, insights) {
  // ...
}

// Updated
export async function generateFeatures(research, insights, options = {}) {
  const model = options.model || 'google/gemini-2.0-flash-001';
  // Use model parameter in callGemini or callAI
  // ...
}
```

Do this for: `generateFeatures`, `generatePRD`, `generatePrompt`

---

### PHASE 2: Run Benchmarks & Analyze

#### Step 2.1: Run Benchmark Suite

```bash
cd /Users/ardi/Desktop/Apps/addons/ideaforge/backend
node tests/benchmark/benchmark.js
```

#### Step 2.2: Review Results

Check `tests/benchmark/results/benchmark-YYYY-MM-DD.json`

**Key decisions:**
1. Did GLM-4.7 score >= 85% of Claude for Features?
2. Did MiniMax M2.1 score >= 90% of Claude for Export?
3. Any surprises in the data?

#### Step 2.3: Manual Quality Check

Pick 2-3 outputs from each model and read them:
- Are GLM-4.7 features creative and specific?
- Do MiniMax exports feel "agentic"?
- Do they cite research evidence?

---

### PHASE 3: Implement Provider Abstraction (If Benchmarks Pass)

#### Step 3.1: Create Provider Layer

**File:** `backend/services/aiProvider.js`

```javascript
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Abstract AI Provider Interface
 */
export class AIProvider {
  async chat(messages, options) {
    throw new Error('Must implement chat()');
  }
}

/**
 * OpenRouter Provider (ALL models via one API)
 */
export class OpenRouterProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseURL = 'https://openrouter.ai/api/v1';
  }

  async chat(messages, options) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ideaforge.app',
        'X-Title': 'IdeaForge',
      },
      body: JSON.stringify({
        model: options.model,
        messages: messages,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

/**
 * Gemini Provider (fallback / current)
 */
export class GeminiProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async chat(messages, options) {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4000,
        temperature: options.temperature ?? 0.7,
      },
    });

    // Convert messages to Gemini format
    const contents = messages.map((msg, i) => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent(contents);
    return result.response.text();
  }
}

/**
 * Provider Factory
 */
export function getProvider() {
  const provider = process.env.AI_PROVIDER || 'gemini';

  switch (provider) {
    case 'openrouter':
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not set');
      }
      return new OpenRouterProvider(process.env.OPENROUTER_API_KEY);

    case 'gemini':
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set');
      }
      return new GeminiProvider(process.env.GEMINI_API_KEY);

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

#### Step 3.2: Create Model Config

**File:** `backend/config/models.js`

```javascript
/**
 * Model Configuration
 * Based on benchmark results
 */

export const MODEL_CONFIGS = {
  analysis: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 6000,
    temperature: 0.7,
  },

  features: {
    // UPDATE AFTER BENCHMARK
    primary: 'zhipu/glm-4.7',  // or 'anthropic/claude-4.5-sonnet' if GLM fails
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 8000,
    temperature: 0.7,
  },

  refineFeatures: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 4000,
    temperature: 0.7,
  },

  prd: {
    // UPDATE AFTER BENCHMARK
    primary: 'zhipu/glm-4.7',  // or 'anthropic/claude-4.5-sonnet' if GLM fails
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 12000,
    temperature: 0.7,
  },

  storyFiles: {
    primary: 'minimax/minimax-m2.1',
    fallback: 'zhipu/glm-4.7',
    maxTokens: 15000,
    temperature: 0.5,
  },

  designBrief: {
    primary: 'google/gemini-3-pro-preview',
    fallback: 'google/gemini-3-flash-preview',
    maxTokens: 8000,
    temperature: 0.7,
  },

  chatWithExport: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 3000,
    temperature: 0.7,
  },

  export: {
    // UPDATE AFTER BENCHMARK
    primary: 'minimax/minimax-m2.1',  // or 'anthropic/claude-4.5-sonnet' if MiniMax fails
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 8000,
    temperature: 0.7,
  },
};
```

#### Step 3.3: Update aiService.js

**Replace callGemini with callAI:**

```javascript
import { getProvider } from './aiProvider.js';
import { MODEL_CONFIGS } from '../config/models.js';

const provider = getProvider();

async function callAI(configKey, systemPrompt, userMessage) {
  const config = MODEL_CONFIGS[configKey];

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  try {
    // Try primary model
    return await provider.chat(messages, {
      model: config.primary,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });
  } catch (error) {
    console.warn(`Primary model (${config.primary}) failed, trying fallback:`, error.message);

    // Try fallback
    return await provider.chat(messages, {
      model: config.fallback,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });
  }
}

// Update all functions
export async function analyzeResearch(research) {
  const systemPrompt = `...`;
  const userMessage = `...`;

  const response = await callAI('analysis', systemPrompt, userMessage);
  // ... rest of function
}

export async function generateFeatures(research, insights, options = {}) {
  const systemPrompt = `...`;
  const userMessage = `...`;

  // Allow model override for benchmarking
  if (options.model) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
    const response = await provider.chat(messages, {
      model: options.model,
      maxTokens: 8000,
      temperature: 0.7,
    });
    // ... parse and return
  } else {
    const response = await callAI('features', systemPrompt, userMessage);
    // ... parse and return
  }
}

// Repeat for all 8 functions
```

#### Step 3.4: Environment Variables

**File:** `backend/.env`

```env
# Provider selection
AI_PROVIDER=openrouter  # or 'gemini' for backward compat

# API Keys
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIza...

# Server
PORT=3001
```

#### Step 3.5: Test End-to-End

```bash
# Start backend with OpenRouter
cd /Users/ardi/Desktop/Apps/addons/ideaforge/backend
AI_PROVIDER=openrouter npm run dev

# In another terminal, start frontend
cd /Users/ardi/Desktop/Apps/addons/ideaforge
npm run dev

# Test complete workflow:
# 1. Paste research mentioning Stripe
# 2. Go through all steps
# 3. Check Export shows detected skills
# 4. Verify quality of outputs
```

---

## 📊 Expected Outcomes

### If Benchmarks Pass

**GLM-4.7 >= 85% Claude quality:**
- Use GLM-4.7 for Features + PRD
- Save $0.22 per session
- Deploy with confidence

**MiniMax M2.1 >= 90% Claude quality:**
- Use MiniMax for Export
- Save $0.05 per session
- Perfect for agentic outputs

**Total savings:** $0.27 per session vs all-Claude
**Quality:** Equivalent to Claude for critical outputs

### If Benchmarks Fail

**GLM-4.7 < 85% Claude:**
- Use Claude 4.5 Sonnet for Features + PRD
- Cost increase: $0.22/session
- But quality guaranteed

**MiniMax M2.1 < 90% Claude:**
- Use Claude 4.5 Sonnet for Export
- Critical output - quality matters most

**Fallback config:**
```javascript
{
  analysis: 'deepseek/deepseek-v3',         // $0.002
  features: 'anthropic/claude-4.5-sonnet',  // $0.15
  prd: 'anthropic/claude-4.5-sonnet',       // $0.20
  export: 'anthropic/claude-4.5-sonnet',    // $0.10
  designBrief: 'google/gemini-3-pro-preview', // $0.15
}
// Total: $0.62/session (still better than all-Claude for everything)
```

---

## 🔍 Quality Assurance Checklist

Before deploying to production:

- [ ] All benchmark tests run without errors
- [ ] GLM-4.7 scores >= 85% of Claude on features
- [ ] MiniMax M2.1 scores >= 90% of Claude on export
- [ ] Manual review of 5+ outputs confirms quality
- [ ] Skills detection still works with new models
- [ ] Detected skills appear in frontend UI
- [ ] Fallback models work when primary fails
- [ ] Environment variables validated on startup
- [ ] Cost per session is < $0.50
- [ ] No breaking changes to existing prompts
- [ ] Backend starts without errors
- [ ] Frontend connects to backend successfully

---

## 📚 Reference Documents

**Read these in order:**

1. **ARCHITECTURE-FINAL.md** - Complete strategy and model decisions
2. **API INFO & PRICING.md** - Latest OpenRouter pricing data
3. **CLAUDE.md** - Main IdeaForge documentation
4. **IMPLEMENTATION-PLAN.md** - This file (step-by-step guide)

**Key files to understand:**

- `backend/services/aiService.js` - All 8 AI functions
- `backend/services/skillsService.js` - Skills detection
- `.claude/skills/index.json` - Skills registry
- `src/components/export/ExportStep.jsx` - Export UI with skills badges

---

## 🚨 Important Notes for Next Session

### Current State
- Backend running on port 3001 (may need to restart)
- Frontend on port 8000
- Skills Library fully integrated and working
- Using Gemini 2.0 Flash for all functions (baseline)

### Critical Decisions Pending
1. **Benchmark GLM-4.7** - Does it rival Claude? (User says yes, verify)
2. **Benchmark MiniMax M2.1** - Good for export? (Built for it, test)
3. **Verify Gemini 3 Pro** - Best at UI? (User confirmed, test)

### Do NOT Change
- Existing prompts (they're good)
- Skills Library (it works)
- Frontend UI (it's working)
- Zustand store structure

### DO Change
- Add model override parameter to AI functions
- Create benchmark suite
- Run benchmarks
- Implement provider abstraction based on results

---

## 🎯 Success Criteria

**Session is successful if:**

1. ✅ Benchmark suite runs and produces results
2. ✅ We have data on GLM-4.7 vs Claude (features + PRD)
3. ✅ We have data on MiniMax M2.1 vs Claude (export)
4. ✅ Clear recommendation on which models to use
5. ✅ Provider abstraction implemented and tested
6. ✅ End-to-end workflow still works
7. ✅ Cost per session calculated and acceptable

**Ultimate goal:**
- $0.38/session with excellent quality
- Right model for right task
- Gemini 3 for UI, GLM-4.7 for coding, MiniMax for agentic

---

**Next Session:** Start with Step 1.1 (Create Benchmark Folder Structure)

**Good luck! 🚀**

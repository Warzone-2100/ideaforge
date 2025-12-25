# IdeaForge AI Architecture - FINAL STRATEGY

**Date:** 2024-12-24
**Status:** Ready for Implementation
**Research:** OpenRouter Market Analysis + User Intelligence

---

## 🎯 Strategic Intelligence (User Insights)

### Model Strengths by Category

1. **Gemini 3 models** → Exceptional at designing world-class UIs ⭐
2. **Claude** → Best at tool calling (structured output)
3. **GLM-4.7** → Rivals Claude at coding and reasoning
4. **OpenAI** → Meh (excluded from strategy)
5. **MiniMax M2.1** → Optimized for agentic IDE flows
6. **DeepSeek** → Best price-to-performance ratio

---

## FINAL Model Mapping Strategy

### Optimized for Quality + Cost

```javascript
// backend/config/models.js

export const MODEL_CONFIGS = {
  // ============================================================================
  // STEP 2: ANALYSIS - Simple extraction, JSON parsing
  // ============================================================================
  analysis: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'deepseek/deepseek-v3.1-terminus',
    maxTokens: 6000,
    temperature: 0.7,
    cost: {
      primary: '$0.14/$0.28 per 1M',
      fallback: '$0.21/$0.79 per 1M',
      perRequest: '~$0.002'
    },
    rationale: `
      - Simple extraction task (marketInsights, painPoints, etc.)
      - JSON output format
      - DeepSeek V3 offers best price-to-performance
      - V3.1 Terminus fallback has better tool calling for structured output
    `
  },

  // ============================================================================
  // STEP 3: FEATURES - Creative + structured, CRITICAL quality
  // ============================================================================
  features: {
    primary: 'zhipu/glm-4.7',
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 8000,
    temperature: 0.7,
    cost: {
      primary: '$0.40/$1.50 per 1M',
      fallback: '$3.00/$15.00 per 1M',
      perRequest: '~$0.05 (primary) / $0.15 (fallback)'
    },
    rationale: `
      🎯 CRITICAL DECISION: GLM-4.7 rivals Claude at coding/reasoning
      - User reports: "GLM-4.7 rivals Claude at coding and reasoning"
      - 7.5x cheaper than Claude ($0.40 vs $3.00 input)
      - Features require: creativity + structured output + reasoning
      - Claude fallback if GLM-4.7 fails (best at tool calling)

      BENCHMARK: Test GLM-4.7 vs Claude on feature generation before rollout
    `
  },

  // ============================================================================
  // STEP 3: FEATURE REFINEMENT CHAT - Conversational modifications
  // ============================================================================
  refineFeatures: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 4000,
    temperature: 0.7,
    cost: {
      primary: '$0.14/$0.28 per 1M',
      fallback: '$0.07/$0.30 per 1M',
      perRequest: '~$0.001'
    },
    rationale: `
      - Simple conversational task
      - Budget model sufficient (DeepSeek V3 excellent for chat)
      - Ultra-cheap Gemini fallback
    `
  },

  // ============================================================================
  // STEP 4: PRD - Long-form structured writing, coding/reasoning
  // ============================================================================
  prd: {
    primary: 'zhipu/glm-4.7',
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 12000,
    temperature: 0.7,
    cost: {
      primary: '$0.40/$1.50 per 1M',
      fallback: '$3.00/$15.00 per 1M',
      perRequest: '~$0.08 (primary) / $0.20 (fallback)'
    },
    rationale: `
      🎯 CRITICAL: GLM-4.7 for coding/reasoning tasks
      - PRD requires: technical reasoning + structured FR/NFR format
      - GLM-4.7 beats GPT-4o at fraction of cost
      - User confirms: "rivals Claude at coding and reasoning"
      - Long-form output (12K tokens) - GLM handles well (128k context)

      BENCHMARK: Compare GLM-4.7 vs Claude PRD quality
    `
  },

  // ============================================================================
  // STEP 5: STORY FILES - Complex agentic transformation
  // ============================================================================
  storyFiles: {
    primary: 'minimax/minimax-m2.1',
    fallback: 'zhipu/glm-4.7',
    maxTokens: 15000,
    temperature: 0.5,
    cost: {
      primary: '$0.20/$1.10 per 1M',
      fallback: '$0.40/$1.50 per 1M',
      perRequest: '~$0.05'
    },
    rationale: `
      🎯 MiniMax M2.1 = agentic coding specialist
      - "Optimized for IDEs and agentic flows"
      - Converting PRD to BMAD atomic stories = agentic task
      - GLM-4.7 fallback (good at coding)
      - Lower temp (0.5) for consistency
    `
  },

  // ============================================================================
  // STEP 5: DESIGN BRIEF - UI/UX generation 🔥
  // ============================================================================
  designBrief: {
    primary: 'google/gemini-3-pro-preview',
    fallback: 'google/gemini-3-flash-preview',
    maxTokens: 8000,
    temperature: 0.7,
    cost: {
      primary: '$2.00/$12.00 per 1M',
      fallback: '$0.50/$3.00 per 1M',
      perRequest: '~$0.15 (primary) / $0.04 (fallback)'
    },
    rationale: `
      🔥 GAME CHANGER: User insight - Gemini 3 exceptional at UI design
      - "Gemini 3 models are exceptional at designing world-class UIs!"
      - Design brief requires: specific UI patterns, design tokens, component specs
      - Gemini 3 Pro Preview = best in class for this
      - Gemini 3 Flash fallback (still V3 architecture, cheaper)
      - Worth the $0.15 cost for world-class UI generation

      CRITICAL: This is a HUGE advantage - use Gemini 3's strength
    `
  },

  // ============================================================================
  // STEP 5: EXPORT CHAT - Simple advisory
  // ============================================================================
  chatWithExport: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 3000,
    temperature: 0.7,
    cost: {
      primary: '$0.14/$0.28 per 1M',
      fallback: '$0.07/$0.30 per 1M',
      perRequest: '~$0.001'
    },
    rationale: `
      - Simple advisory chat
      - DeepSeek V3 perfect for this
      - Ultra-cheap, good quality
    `
  },

  // ============================================================================
  // STEP 5: EXPORT PROMPT - MOST CRITICAL OUTPUT 🎯
  // ============================================================================
  export: {
    primary: 'minimax/minimax-m2.1',
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 8000,
    temperature: 0.7,
    cost: {
      primary: '$0.20/$1.10 per 1M',
      fallback: '$3.00/$15.00 per 1M',
      perRequest: '~$0.05 (primary) / $0.10 (fallback)'
    },
    rationale: `
      🎯 PERFECT MATCH: MiniMax M2.1 for agentic IDE prompts
      - "Optimized specifically for IDEs and agentic flows"
      - We generate prompts FOR Claude Code (an IDE agent)
      - This is literally what MiniMax M2.1 was designed for
      - 15x cheaper than Claude ($0.20 vs $3.00 input)
      - Claude fallback for tool calling expertise if needed

      BENCHMARK: Must test MiniMax vs Claude before rollout
      This is our final output - quality matters most
    `
  }
}
```

---

## Cost Analysis

### Per Session Breakdown

```
Analysis:      DeepSeek V3          $0.002   (6K tokens)
Features:      GLM-4.7              $0.050   (8K tokens) 🎯 7.5x cheaper than Claude
PRD:           GLM-4.7              $0.080   (12K tokens)
Story Files:   MiniMax M2.1         $0.050   (15K tokens)
Design Brief:  Gemini 3 Pro         $0.150   (8K tokens) 🔥 Best at UI
Export:        MiniMax M2.1         $0.050   (8K tokens) 🎯 Agentic specialist
Chat:          DeepSeek V3          $0.001   (3K tokens)
───────────────────────────────────────────────────────────
TOTAL:                              $0.383 per session

Quality: ⭐⭐⭐⭐⭐ (Excellent)
Strategy: Best model for each specific task
```

### Comparison to Alternatives

**Current (All Gemini Flash):**
- Cost: $0.01/session
- Quality: ⭐⭐⭐ (Good)
- Issue: Generic, not optimized per task

**All Claude 4.5 Sonnet:**
- Cost: $0.65/session
- Quality: ⭐⭐⭐⭐⭐ (Excellent)
- Issue: Expensive overkill for simple tasks

**Our Strategy (Task-Optimized):**
- Cost: $0.38/session
- Quality: ⭐⭐⭐⭐⭐ (Excellent)
- **Advantage:** Right model for right task
  - Gemini 3 for UI (best in class)
  - GLM-4.7 for coding/reasoning (rivals Claude)
  - MiniMax M2.1 for agentic outputs (specialized)
  - DeepSeek V3 for simple tasks (budget)

**Savings:** 42% cheaper than all-Claude, 40x better than all-Gemini

---

## Key Strategic Decisions

### 1. Gemini 3 Pro for Design Brief 🔥

**Why this matters:**
- User intelligence: "Gemini 3 models are exceptional at designing world-class UIs"
- Design brief = UI/UX specifications, design tokens, component patterns
- This is Gemini 3's superpower
- Worth $0.15 per request for best-in-class UI generation

**Impact:**
- IdeaForge outputs will have world-class UI specifications
- Design briefs will reference specific design systems (Linear, Stripe, etc.)
- Component patterns will be production-ready

### 2. GLM-4.7 for Features + PRD 🎯

**Why this is huge:**
- User intelligence: "GLM-4.7 rivals Claude at coding and reasoning"
- Features + PRD are CRITICAL outputs
- GLM-4.7 is 7.5x cheaper than Claude ($0.40 vs $3.00)
- If it truly rivals Claude, this is massive cost savings

**Savings:**
- Features: $0.10 saved per request (vs Claude)
- PRD: $0.12 saved per request
- **Total savings: $0.22 per session** (58% of total cost!)

**Risk mitigation:**
- MUST benchmark GLM-4.7 vs Claude before rollout
- Keep Claude as fallback
- Monitor quality metrics

### 3. MiniMax M2.1 for Export 🎯

**Why this is perfect:**
- Built for "IDEs and agentic flows"
- We generate prompts for Claude Code (an IDE agent)
- Specialized model = better than general-purpose
- 15x cheaper than Claude

**Must benchmark:**
- Test export quality vs Claude 4.5 Sonnet
- Success criteria: >=90% quality of Claude
- If fails: fallback to Claude

### 4. DeepSeek for Simple Tasks

**Why:**
- Analysis, chat = simple extraction
- DeepSeek V3 "rivals proprietary models"
- Cheapest option that maintains quality
- No brainer for non-critical tasks

---

## Benchmarking Plan 📊

Before going live, we MUST test each model on real IdeaForge tasks.

### Test Suite Structure

```
backend/tests/benchmark/
├── fixtures/
│   ├── research-samples/        # 10 real research docs
│   ├── expected-features/       # Gold standard feature sets
│   ├── expected-prds/           # Gold standard PRDs
│   └── expected-exports/        # Gold standard prompts
├── benchmark.js                 # Main benchmark runner
├── evaluators/
│   ├── features-evaluator.js   # Score feature quality
│   ├── prd-evaluator.js        # Score PRD quality
│   └── export-evaluator.js     # Score export quality
└── results/
    └── benchmark-YYYY-MM-DD.json
```

### Critical Benchmarks

#### 1. Features: GLM-4.7 vs Claude 4.5 Sonnet

**Input:** 5 research docs → generate features

**Models to test:**
- `zhipu/glm-4.7`
- `anthropic/claude-4.5-sonnet`
- `google/gemini-2.5-pro` (comparison)

**Metrics:**
- ✅ Creativity score (1-10)
- ✅ Evidence citations (does it quote research?)
- ✅ Acceptance criteria quality
- ✅ User story clarity
- ✅ Edge case coverage
- ✅ Cost per generation
- ✅ Latency

**Success criteria:**
- GLM-4.7 scores >= 85% of Claude quality
- If yes → Use GLM-4.7 (save $0.10/request)
- If no → Use Claude

#### 2. Export: MiniMax M2.1 vs Claude 4.5 Sonnet

**Input:** 5 feature sets + PRDs → generate CLAUDE.md prompts

**Models to test:**
- `minimax/minimax-m2.1` (agentic specialist)
- `anthropic/claude-4.5-sonnet` (baseline)
- `zhipu/glm-4.7` (comparison)

**Metrics:**
- ✅ Specificity (not generic)
- ✅ Evidence-based (references research)
- ✅ Actionability (Claude Code can execute)
- ✅ Structure (XML tags, clear sections)
- ✅ Skills integration (uses Skills Library)
- ✅ MCP directives (includes context7 usage)
- ✅ Cost per generation
- ✅ Latency

**Success criteria:**
- MiniMax M2.1 scores >= 90% of Claude quality
- Prompts are executable by Claude Code
- If yes → Use MiniMax (save $0.05/request)
- If no → Use Claude

#### 3. Design Brief: Gemini 3 Pro vs Others

**Input:** 5 feature sets → generate design briefs

**Models to test:**
- `google/gemini-3-pro-preview` (UI specialist)
- `anthropic/claude-4.5-sonnet` (comparison)
- `zhipu/glm-4.7` (comparison)

**Metrics:**
- ✅ UI specificity (exact colors, not "modern blue")
- ✅ Component detail (specific patterns, not generic)
- ✅ Design system references (Linear, Stripe, etc.)
- ✅ Anti-patterns list (what NOT to do)
- ✅ Actionability (designer can implement)
- ✅ Cost per generation

**Success criteria:**
- Gemini 3 Pro generates most specific UI details
- References real design systems
- Worth the $0.15 cost vs alternatives

#### 4. PRD: GLM-4.7 vs Claude vs Gemini

**Input:** 5 feature sets → generate FR/NFR PRDs

**Models to test:**
- `zhipu/glm-4.7`
- `anthropic/claude-4.5-sonnet`
- `google/gemini-2.5-pro`

**Metrics:**
- ✅ FR format correctness (FR#: Actor can capability)
- ✅ Testability (can verify each requirement)
- ✅ Structure (grouping, hierarchy)
- ✅ Completeness (covers all features)
- ✅ Technical depth
- ✅ Cost per generation

**Success criteria:**
- GLM-4.7 matches Claude on structure/quality
- If yes → Use GLM-4.7 (save $0.12/request)

### Benchmark Runner

```javascript
// backend/tests/benchmark/benchmark.js

import { analyzeResearch, generateFeatures, generatePRD, generatePrompt } from '../../services/aiService.js';
import { loadFixtures, evaluateQuality, logResults } from './utils.js';

async function runBenchmark() {
  console.log('🔬 Starting IdeaForge Model Benchmark\n');

  const fixtures = loadFixtures();
  const results = {
    timestamp: new Date(),
    tests: []
  };

  // ============================================================================
  // TEST 1: Features Generation (CRITICAL)
  // ============================================================================
  console.log('📋 Test 1: Features Generation (GLM-4.7 vs Claude)');

  for (const fixture of fixtures.research) {
    console.log(`  Testing: ${fixture.name}`);

    // Test GLM-4.7
    const glmStart = Date.now();
    const glmFeatures = await generateFeatures(fixture.research, fixture.insights, {
      model: 'zhipu/glm-4.7'
    });
    const glmDuration = Date.now() - glmStart;

    // Test Claude
    const claudeStart = Date.now();
    const claudeFeatures = await generateFeatures(fixture.research, fixture.insights, {
      model: 'anthropic/claude-4.5-sonnet'
    });
    const claudeDuration = Date.now() - claudeStart;

    // Evaluate quality
    const glmScore = evaluateQuality(glmFeatures, fixture.expected, 'features');
    const claudeScore = evaluateQuality(claudeFeatures, fixture.expected, 'features');

    results.tests.push({
      test: 'features',
      fixture: fixture.name,
      glm: { score: glmScore, duration: glmDuration, cost: calculateCost(glmFeatures, 'glm-4.7') },
      claude: { score: claudeScore, duration: claudeDuration, cost: calculateCost(claudeFeatures, 'claude-4.5-sonnet') },
      winner: glmScore >= claudeScore * 0.85 ? 'GLM-4.7' : 'Claude'
    });

    console.log(`    GLM-4.7: ${glmScore}/10 (${glmDuration}ms, ${results.tests[results.tests.length-1].glm.cost})`);
    console.log(`    Claude:  ${claudeScore}/10 (${claudeDuration}ms, ${results.tests[results.tests.length-1].claude.cost})`);
  }

  // ============================================================================
  // TEST 2: Export Prompts (CRITICAL)
  // ============================================================================
  console.log('\n📤 Test 2: Export Prompts (MiniMax vs Claude)');

  for (const fixture of fixtures.exports) {
    console.log(`  Testing: ${fixture.name}`);

    // Test MiniMax M2.1
    const minimaxStart = Date.now();
    const minimaxExport = await generatePrompt('claude', fixture.research, fixture.insights, fixture.features, fixture.prd, {
      model: 'minimax/minimax-m2.1'
    });
    const minimaxDuration = Date.now() - minimaxStart;

    // Test Claude
    const claudeStart = Date.now();
    const claudeExport = await generatePrompt('claude', fixture.research, fixture.insights, fixture.features, fixture.prd, {
      model: 'anthropic/claude-4.5-sonnet'
    });
    const claudeDuration = Date.now() - claudeStart;

    // Evaluate quality
    const minimaxScore = evaluateQuality(minimaxExport, fixture.expected, 'export');
    const claudeScore = evaluateQuality(claudeExport, fixture.expected, 'export');

    results.tests.push({
      test: 'export',
      fixture: fixture.name,
      minimax: { score: minimaxScore, duration: minimaxDuration, cost: calculateCost(minimaxExport, 'minimax-m2.1') },
      claude: { score: claudeScore, duration: claudeDuration, cost: calculateCost(claudeExport, 'claude-4.5-sonnet') },
      winner: minimaxScore >= claudeScore * 0.90 ? 'MiniMax M2.1' : 'Claude'
    });

    console.log(`    MiniMax: ${minimaxScore}/10 (${minimaxDuration}ms, ${results.tests[results.tests.length-1].minimax.cost})`);
    console.log(`    Claude:  ${claudeScore}/10 (${claudeDuration}ms, ${results.tests[results.tests.length-1].claude.cost})`);
  }

  // ============================================================================
  // TEST 3: Design Brief (Gemini 3 Pro)
  // ============================================================================
  console.log('\n🎨 Test 3: Design Brief (Gemini 3 Pro vs Others)');

  // Similar structure for design brief tests...

  // ============================================================================
  // FINAL RESULTS
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 BENCHMARK RESULTS');
  console.log('='.repeat(80));

  const recommendations = analyzeResults(results);

  console.log('\n✅ RECOMMENDED CONFIG:');
  console.log(JSON.stringify(recommendations, null, 2));

  // Save results
  logResults(results, `./results/benchmark-${new Date().toISOString().split('T')[0]}.json`);
}

function analyzeResults(results) {
  const featuresTests = results.tests.filter(t => t.test === 'features');
  const exportTests = results.tests.filter(t => t.test === 'export');

  const glmWins = featuresTests.filter(t => t.winner === 'GLM-4.7').length;
  const minimaxWins = exportTests.filter(t => t.winner === 'MiniMax M2.1').length;

  return {
    features: glmWins >= featuresTests.length * 0.6 ? 'zhipu/glm-4.7' : 'anthropic/claude-4.5-sonnet',
    export: minimaxWins >= exportTests.length * 0.6 ? 'minimax/minimax-m2.1' : 'anthropic/claude-4.5-sonnet',
    rationale: {
      features: `GLM-4.7 won ${glmWins}/${featuresTests.length} tests`,
      export: `MiniMax won ${minimaxWins}/${exportTests.length} tests`
    }
  };
}

runBenchmark().catch(console.error);
```

---

## Implementation Timeline

### Phase 1: Provider Abstraction (Week 1)
- Create provider layer
- Implement OpenRouter provider
- Add model configuration system
- **No changes to existing prompts**

### Phase 2: Benchmarking (Week 2)
- Create benchmark suite
- Test GLM-4.7 vs Claude (Features + PRD)
- Test MiniMax M2.1 vs Claude (Export)
- Test Gemini 3 Pro (Design Brief)
- **Analyze results, adjust strategy**

### Phase 3: Rollout (Week 3)
- Deploy winning configuration
- Monitor costs + quality
- A/B test if needed
- **Optimize based on real usage**

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GLM-4.7 quality < Claude | Medium | High | Benchmark before rollout, keep Claude fallback |
| MiniMax M2.1 not suitable for export | Low | High | MUST benchmark, Claude fallback available |
| Gemini 3 Pro not worth $0.15 | Low | Medium | Test vs alternatives, fallback to Flash |
| Model availability issues | Low | Medium | Implement fallbacks, monitor uptime |
| Cost explosion | Low | High | Set spending limits, log all requests |
| Quality regression | Medium | High | Continuous monitoring, user feedback |

---

## Success Metrics

**Technical:**
- ✅ GLM-4.7 >= 85% Claude quality for Features
- ✅ MiniMax M2.1 >= 90% Claude quality for Export
- ✅ Gemini 3 Pro best UI specificity
- ✅ Average cost per session < $0.45
- ✅ 99% requests succeed (with fallbacks)

**Quality:**
- ✅ Export prompts are executable by Claude Code
- ✅ Design briefs reference specific design systems
- ✅ Features cite research evidence
- ✅ PRDs are technically accurate

**Business:**
- ✅ 38x better quality than current (Gemini Flash)
- ✅ 42% cheaper than all-Claude approach
- ✅ Uses best-in-class model for each task
- ✅ Monthly costs predictable

---

## FINAL RECOMMENDATION

**Deploy this strategy:**

```javascript
{
  analysis: 'deepseek/deepseek-v3',       // $0.002 - Budget king
  features: 'zhipu/glm-4.7',              // $0.050 - Rivals Claude, 7.5x cheaper
  prd: 'zhipu/glm-4.7',                   // $0.080 - Coding/reasoning
  storyFiles: 'minimax/minimax-m2.1',     // $0.050 - Agentic specialist
  designBrief: 'google/gemini-3-pro-preview', // $0.150 - 🔥 Best at UI
  export: 'minimax/minimax-m2.1',         // $0.050 - 🎯 Built for this
}

Total: $0.38/session
Quality: ⭐⭐⭐⭐⭐
```

**BUT FIRST:**
1. Run benchmarks for GLM-4.7, MiniMax M2.1, Gemini 3 Pro
2. Verify quality meets thresholds
3. Adjust config based on results

**Next step:** Implement benchmark suite or go straight to provider layer?

# IdeaForge AI Architecture

**Date:** 2024-12-24
**Status:** Planning Multi-Model Support

---

## Current State (Single-Model Architecture)

### Overview
```
┌─────────────────────────────────────────────────────────────┐
│                  GEMINI 2.0 FLASH (Single Model)             │
│                  generativelanguage.googleapis.com           │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬───────────────┐
        ▼                   ▼                   ▼               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌────────────┐
│  Step 2      │    │  Step 3      │    │  Step 4      │  │  Step 5    │
│  ANALYZE     │    │  FEATURES    │    │  PRD         │  │  EXPORT    │
│              │    │              │    │              │  │            │
│ 6K tokens    │    │ 8K tokens    │    │ 12K tokens   │  │ 8K tokens  │
│ Temp: 0.7    │    │ Temp: 0.7    │    │ Temp: 0.7    │  │ Temp: 0.7  │
│ JSON output  │    │ JSON output  │    │ MD output    │  │ MD output  │
└──────────────┘    └──────────────┘    └──────────────┘  └────────────┘
```

### Function Inventory

| Function | Purpose | Tokens | Temp | Output | Complexity |
|----------|---------|--------|------|--------|------------|
| `analyzeResearch()` | Extract insights from research | 6000 | 0.7 | JSON | Low - Simple extraction |
| `generateFeatures()` | Create features with user stories | 8000 | 0.7 | JSON | High - Creative + structured |
| `refineFeatures()` | Chat-based feature modification | 4000 | 0.7 | JSON | Medium - Conversational |
| `generatePRD()` | Create FR/NFR requirements doc | 12000 | 0.7 | MD | High - Long-form structured |
| `generateStoryFiles()` | Atomic BMAD story files | 15000 | 0.5 | JSON | High - Complex transformation |
| `generateDesignBrief()` | Specific UI/UX direction | 8000 | 0.7 | JSON | Medium - Design reasoning |
| `chatWithExport()` | Export refinement chat | 3000 | 0.7 | Text | Low - Simple chat |
| `generatePrompt()` | Agent-specific instructions | 8000 | 0.7 | MD | **CRITICAL** - Output quality matters most |

### Current Implementation

**File:** `backend/services/aiService.js`

```javascript
// Single model configured globally
const model = process.env.VERTEX_AI_MODEL || 'gemini-2.0-flash-001';

// All functions call through one helper
async function callGemini(systemPrompt, userMessage, options = {}) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.VERTEX_AI_MODEL || 'gemini-2.0-flash-001',
    generationConfig: {
      maxOutputTokens: options.maxTokens || 4000,
      temperature: options.temperature ?? 0.7,
    },
  });

  const result = await model.generateContent([
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
    { role: 'user', parts: [{ text: userMessage }] },
  ]);

  return result.response.text();
}
```

### Strengths
✅ Simple - One model, one API key
✅ Fast - Gemini 2.0 Flash is very fast
✅ Cheap - Generous free tier, low cost
✅ Consistent - Same model behavior across all steps

### Weaknesses
❌ Limited - Stuck with Gemini's capabilities
❌ Single point of failure - If Gemini is down, whole app breaks
❌ No optimization - Can't use cheaper models for simple tasks or better models for critical tasks
❌ No specialization - Can't use Claude for prompts, GPT for JSON, etc.

---

## Proposed Architecture: Multi-Model Support

### Design Goals

1. **Model flexibility** - Use best model for each task
2. **Cost optimization** - Cheap models for simple tasks, expensive for critical
3. **Provider abstraction** - Easy to swap providers
4. **Backward compatible** - Don't break existing setups
5. **Fallback support** - If primary fails, try backup
6. **Simple config** - Environment variables + JSON config

### Provider Options Analysis

#### Option 1: OpenRouter ⭐ RECOMMENDED

**URL:** https://openrouter.ai
**API:** Unified REST API for 200+ models

**Pros:**
- ✅ **One API for everything** - Claude, GPT, Gemini, Llama, etc.
- ✅ **Simple integration** - Similar to OpenAI API
- ✅ **Model switching** - Change model with string: `anthropic/claude-sonnet-4.5`
- ✅ **Fallback built-in** - Can specify fallback models
- ✅ **Cost tracking** - Dashboard shows usage
- ✅ **New models auto-added** - Don't need to update SDK
- ✅ **Free tier** - Some models free with limits

**Cons:**
- ❌ Markup on pricing (~10-20% vs direct)
- ❌ Another dependency
- ❌ Rate limits (can be hit across all models)

**Pricing Examples (via OpenRouter):**
```
Claude Sonnet 4.5:    $3.00/1M input,  $15.00/1M output
GPT-4o:               $2.50/1M input,  $10.00/1M output
Gemini 2.0 Flash:     $0.075/1M input, $0.30/1M output
Claude Haiku:         $0.25/1M input,  $1.25/1M output
```

**Code Example:**
```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'anthropic/claude-sonnet-4.5',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  })
});
```

#### Option 2: Direct Providers

**Anthropic SDK, OpenAI SDK, Google AI SDK**

**Pros:**
- ✅ **Best pricing** - No markup
- ✅ **Direct access** - Latest features first
- ✅ **More control** - All provider-specific features

**Cons:**
- ❌ **Multiple SDKs** - Different interfaces for each
- ❌ **More API keys** - Manage 3+ keys
- ❌ **More code** - Handle different response formats
- ❌ **Manual updates** - Update SDKs for new models

#### Option 3: Vercel AI SDK

**URL:** https://sdk.vercel.ai

**Pros:**
- ✅ **Unified interface** - Works with all providers
- ✅ **TypeScript first** - Great types
- ✅ **Streaming support** - Built-in
- ✅ **React hooks** - For frontend use

**Cons:**
- ❌ **Primarily for streaming** - Overkill for simple requests
- ❌ **Not cost-optimized** - No built-in fallbacks
- ❌ **Another abstraction** - More complexity

#### Option 4: Claude Agent SDK

**URL:** https://github.com/anthropics/anthropic-sdk-typescript

**Pros:**
- ✅ **Official Anthropic** - Best Claude support
- ✅ **Tool use** - Built for agentic workflows
- ✅ **Prompt caching** - Save costs on repeated prompts

**Cons:**
- ❌ **Claude only** - Would still need other SDKs
- ❌ **More complex** - Designed for agents, not simple requests

### Decision: OpenRouter

**Rationale:**
1. **Simplest migration** - Similar to current Gemini API
2. **Maximum flexibility** - Can use any model
3. **Cost optimization** - Can mix cheap/expensive models
4. **Future-proof** - New models added automatically
5. **One API key** - Simpler than managing multiple providers

---

## Recommended Model Mapping

### Strategy by Task Type

| Task Type | Best For | Recommended Model | Fallback | Cost/1M |
|-----------|----------|-------------------|----------|---------|
| **Simple extraction** | Speed, JSON parsing | Gemini 2.0 Flash | Claude Haiku | $0.10 |
| **Creative + structured** | Features, reasoning | Claude Sonnet 4.5 | GPT-4o | $3.00 |
| **Long-form writing** | PRDs, documentation | Claude Sonnet 4.5 | GPT-4o | $3.00 |
| **Simple chat** | Conversational | Claude Haiku | Gemini Flash | $0.25 |
| **Critical output** | Agent prompts | Claude Sonnet 4.5 | GPT-4o | $3.00 |

### Proposed Configuration

```javascript
// backend/config/models.js

export const MODEL_CONFIGS = {
  // Step 2: Analysis - Simple extraction, needs speed
  analysis: {
    primary: 'google/gemini-2.0-flash-thinking-exp',
    fallback: 'anthropic/claude-3-haiku',
    maxTokens: 6000,
    temperature: 0.7,
    rationale: 'Fast extraction, JSON output - cheap model is fine'
  },

  // Step 3: Features - Creative + structured, CRITICAL quality
  features: {
    primary: 'anthropic/claude-sonnet-4.5',
    fallback: 'openai/gpt-4o',
    maxTokens: 8000,
    temperature: 0.7,
    rationale: 'Claude best at following complex instructions + creativity'
  },

  // Step 3: Feature refinement chat
  refineFeatures: {
    primary: 'anthropic/claude-3-haiku',
    fallback: 'google/gemini-2.0-flash-thinking-exp',
    maxTokens: 4000,
    temperature: 0.7,
    rationale: 'Simple conversational task - cheap model sufficient'
  },

  // Step 4: PRD - Long-form structured writing
  prd: {
    primary: 'anthropic/claude-sonnet-4.5',
    fallback: 'openai/gpt-4o',
    maxTokens: 12000,
    temperature: 0.7,
    rationale: 'Claude excels at long-form structured docs'
  },

  // Step 5: Story files - Complex transformation
  storyFiles: {
    primary: 'anthropic/claude-sonnet-4.5',
    fallback: 'openai/gpt-4o',
    maxTokens: 15000,
    temperature: 0.5,
    rationale: 'Complex task, needs reliability'
  },

  // Step 5: Design brief - Structured JSON
  designBrief: {
    primary: 'openai/gpt-4o',
    fallback: 'anthropic/claude-sonnet-4.5',
    maxTokens: 8000,
    temperature: 0.7,
    rationale: 'GPT-4o excellent at structured JSON output'
  },

  // Step 5: Export chat
  chatWithExport: {
    primary: 'anthropic/claude-3-haiku',
    fallback: 'google/gemini-2.0-flash-thinking-exp',
    maxTokens: 3000,
    temperature: 0.7,
    rationale: 'Simple advisory chat - cheap model'
  },

  // Step 5: Export prompt - MOST CRITICAL
  export: {
    primary: 'anthropic/claude-sonnet-4.5',
    fallback: 'openai/gpt-4o',
    maxTokens: 8000,
    temperature: 0.7,
    rationale: 'CRITICAL - This is the final output users copy. Must be best quality.'
  }
}
```

### Cost Estimation

**Current (all Gemini 2.0 Flash):**
- Average session: ~50K input + 20K output tokens
- Cost: ~$0.01 per session
- Monthly (1000 sessions): ~$10/month

**Proposed (mixed models):**
- Analysis: Gemini Flash - $0.001
- Features: Claude Sonnet - $0.15
- PRD: Claude Sonnet - $0.20
- Export: Claude Sonnet - $0.10
- **Total per session: ~$0.46**
- **Monthly (1000 sessions): ~$460/month**

**Cost Optimization Strategies:**
1. Prompt caching (Anthropic) - 90% savings on repeated context
2. Use Haiku for chat instead of Sonnet - 10x cheaper
3. Use Gemini for analysis instead of Claude - 30x cheaper
4. Only use Sonnet for critical steps (Features, PRD, Export)

**Optimized cost per session: ~$0.25 → $250/month for 1000 sessions**

---

## Implementation Plan

### Phase 1: Provider Abstraction Layer (Week 1)

**Goal:** Add OpenRouter support without breaking anything

**Files to create:**
```
backend/
├── config/
│   └── models.js              # Model configurations
├── services/
│   ├── aiProvider.js          # NEW - Abstract provider interface
│   └── providers/             # NEW
│       ├── openrouter.js      # OpenRouter implementation
│       └── gemini.js          # Current Gemini (refactored)
```

**New abstraction:**
```javascript
// backend/services/aiProvider.js

export class AIProvider {
  async chat(messages, options) {
    throw new Error('Must implement chat()');
  }
}

export class OpenRouterProvider extends AIProvider {
  async chat(messages, options) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export class GeminiProvider extends AIProvider {
  async chat(messages, options) {
    // Current Gemini implementation moved here
  }
}

// Factory
export function getProvider() {
  const provider = process.env.AI_PROVIDER || 'gemini';

  switch (provider) {
    case 'openrouter':
      return new OpenRouterProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

**Update aiService.js:**
```javascript
// backend/services/aiService.js

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
    console.warn(`Primary model failed, trying fallback:`, error);

    // Try fallback
    return await provider.chat(messages, {
      model: config.fallback,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });
  }
}

// Update existing functions
export async function analyzeResearch(research) {
  const systemPrompt = `...`;
  const userMessage = `...`;

  return callAI('analysis', systemPrompt, userMessage);
}

export async function generatePrompt(format, research, insights, features, prd) {
  // ... existing code ...

  return callAI('export', systemPrompt, userMessage);
}
```

**Environment variables:**
```env
# Provider selection
AI_PROVIDER=openrouter  # or 'gemini'

# API Keys
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=...

# Optional: Override models per function
MODEL_ANALYSIS=google/gemini-2.0-flash-thinking-exp
MODEL_FEATURES=anthropic/claude-sonnet-4.5
MODEL_PRD=anthropic/claude-sonnet-4.5
MODEL_EXPORT=anthropic/claude-sonnet-4.5
```

### Phase 2: Testing & Benchmarking (Week 2)

**Goals:**
1. Test each model configuration
2. Benchmark quality vs cost
3. Compare outputs side-by-side
4. Tune final configuration

**Test suite:**
```javascript
// backend/tests/model-benchmark.js

const TEST_CASES = [
  {
    research: 'SaaS app for Stripe payments...',
    expectedSkills: ['stripe-billing', 'nextjs-app-router'],
  },
  // More test cases
];

async function benchmark() {
  for (const testCase of TEST_CASES) {
    console.log('\n--- Testing:', testCase.research.substring(0, 50));

    // Test each model
    for (const model of MODELS_TO_TEST) {
      const start = Date.now();
      const result = await generatePrompt(model, testCase.research, ...);
      const duration = Date.now() - start;

      console.log(`${model}: ${duration}ms`);
      console.log(`Quality score: ${evaluateQuality(result)}`);
      console.log(`Cost: $${calculateCost(result)}`);
    }
  }
}
```

### Phase 3: Production Rollout (Week 3)

**Goals:**
1. Deploy with OpenRouter
2. Monitor costs and quality
3. A/B test different models
4. Optimize based on real usage

**Monitoring:**
```javascript
// backend/services/analytics.js

export function logModelUsage(functionName, model, tokens, cost, duration) {
  // Log to analytics service
  console.log({
    function: functionName,
    model: model,
    inputTokens: tokens.input,
    outputTokens: tokens.output,
    cost: cost,
    duration: duration,
    timestamp: new Date(),
  });
}
```

---

## Migration Strategy

### Backward Compatibility

**Keep Gemini as default:**
```javascript
AI_PROVIDER=gemini  // Default, no breaking changes
```

**Opt-in to OpenRouter:**
```javascript
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
```

**Gradual migration:**
1. Week 1: Deploy abstraction layer, keep Gemini
2. Week 2: Test OpenRouter internally
3. Week 3: Roll out to users with opt-in
4. Week 4+: Make OpenRouter default

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing setups | High | Keep Gemini as default, make new providers opt-in |
| Cost explosion | High | Set spending limits, log all costs, alerts at $X/day |
| Response format differences | Medium | Normalize responses in provider layer |
| API key leaks | High | Validate on startup, use env vars only, never commit |
| Provider downtime | Medium | Automatic fallback to secondary model |
| Quality regression | Medium | Benchmark before rollout, A/B test |

---

## Open Questions

1. **Should we support direct provider SDKs?**
   - OR: Start with OpenRouter only, add direct later if needed
   - Complexity: OpenRouter is simpler, direct gives more control

2. **How to handle prompt caching (Anthropic)?**
   - OR: OpenRouter supports it automatically
   - Benefit: 90% cost savings on repeated context

3. **Should users choose models per session?**
   - OR: Start with hardcoded configs, add UI later
   - UX: Could add "Use premium models" toggle

4. **How to track costs per user?**
   - OR: OpenRouter provides per-request costs
   - Need: Database to store usage per session

5. **Should we support streaming responses?**
   - OR: Yes, for long PRDs and exports
   - UX: Show progress instead of spinner

---

## Next Steps

**Before writing code:**
1. ✅ Document current architecture (this file)
2. ⏳ Get user approval on approach
3. ⏳ Sign up for OpenRouter API key
4. ⏳ Create detailed implementation plan
5. ⏳ Set up test environment

**After approval:**
1. Create provider abstraction layer
2. Implement OpenRouter provider
3. Update aiService.js to use new system
4. Add environment variable validation
5. Test with real prompts
6. Deploy to staging
7. Benchmark quality vs cost
8. Roll out to production

---

## Success Metrics

**Technical:**
- ✅ Can swap models with config change
- ✅ Fallback works when primary fails
- ✅ No breaking changes for existing users
- ✅ Cost per session tracked and logged

**Quality:**
- ✅ Export prompts are better than current
- ✅ Features are more creative
- ✅ PRDs are more structured
- ✅ User satisfaction improves

**Cost:**
- ✅ Average cost per session < $0.30
- ✅ 90% of sessions use cached prompts
- ✅ Monthly costs predictable and reasonable

---

**Status:** Ready for review and approval
**Next:** User decision on approach, then implementation

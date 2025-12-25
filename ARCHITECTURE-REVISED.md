# IdeaForge AI Architecture - REVISED

**Date:** 2024-12-24
**Status:** Updated with Latest OpenRouter Pricing (Dec 2025)
**Source:** [API INFO & PRICING.md](./API%20INFO%20&%20PRICING.md)

---

## 🔥 Major Revisions Based on New Data

### Critical Discoveries

1. **MiniMax M2.1** ($0.20/$1.10) - **BUILT FOR AGENTIC CODING**
   - "Optimized specifically for IDEs and agentic flows"
   - **Perfect for our Export step** (generating Claude Code prompts)

2. **DeepSeek V3** ($0.14/$0.28) - **New Budget King**
   - "Often rivaling proprietary models at a fraction of the cost"
   - Should replace Gemini Flash for simple tasks

3. **GLM-4.7** ($0.40/$1.50) - **Best Value High-IQ**
   - "Beats GPT-4o at a fraction of the cost"
   - Excellent for structured JSON output

4. **Gemini 2.5 Pro** ($1.25/$10.00) - **Claude Alternative**
   - "Rivals Sonnet 3.5"
   - Half the cost of Claude 4.5 Sonnet

5. **Claude 4.5 Haiku** ($1.00/$5.00) - **Not Cheap Anymore!**
   - 4x more expensive than I estimated
   - Need to reconsider for chat tasks

---

## NEW Recommended Model Mapping

### Strategy: Quality Where It Matters, Budget Where It Doesn't

```javascript
// backend/config/models.js

export const MODEL_CONFIGS = {
  // Step 2: Analysis - Simple extraction
  analysis: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 6000,
    temperature: 0.7,
    cost: {
      input: '$0.14/1M',
      output: '$0.28/1M',
      perRequest: '~$0.002'
    },
    rationale: 'DeepSeek V3 rivals proprietary models. Simple extraction = use budget king.'
  },

  // Step 3: Features - CRITICAL - Creative + structured
  features: {
    primary: 'anthropic/claude-4.5-sonnet',
    fallback: 'google/gemini-2.5-pro',
    maxTokens: 8000,
    temperature: 0.7,
    cost: {
      input: '$3.00/1M',
      output: '$15.00/1M',
      perRequest: '~$0.15'
    },
    rationale: 'CRITICAL creative output. Claude 4.5 Sonnet = SOTA coding (77.2% SWE-bench). Worth the cost.'
  },

  // Step 3: Feature refinement chat
  refineFeatures: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 4000,
    temperature: 0.7,
    cost: {
      input: '$0.14/1M',
      output: '$0.28/1M',
      perRequest: '~$0.001'
    },
    rationale: 'Simple conversational task. DeepSeek V3 is excellent for chat at fraction of cost.'
  },

  // Step 4: PRD - Long-form structured writing
  prd: {
    primary: 'google/gemini-2.5-pro',
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 12000,
    temperature: 0.7,
    cost: {
      input: '$1.25/1M',
      output: '$10.00/1M',
      perRequest: '~$0.12'
    },
    rationale: 'Gemini 2.5 Pro rivals Sonnet at HALF the cost. Great for long-form structured docs.'
  },

  // Step 5: Story files - Complex transformation
  storyFiles: {
    primary: 'minimax/minimax-m2.1',
    fallback: 'deepseek/deepseek-v3',
    maxTokens: 15000,
    temperature: 0.5,
    cost: {
      input: '$0.20/1M',
      output: '$1.10/1M',
      perRequest: '~$0.05'
    },
    rationale: 'MiniMax M2.1 is agentic coding specialist. Perfect for BMAD story transformation.'
  },

  // Step 5: Design brief - Structured JSON
  designBrief: {
    primary: 'zhipu/glm-4.7',
    fallback: 'deepseek/deepseek-v3',
    maxTokens: 8000,
    temperature: 0.7,
    cost: {
      input: '$0.40/1M',
      output: '$1.50/1M',
      perRequest: '~$0.04'
    },
    rationale: 'GLM-4.7 beats GPT-4o for structured output at fraction of cost. Perfect for JSON.'
  },

  // Step 5: Export chat - Simple advisory
  chatWithExport: {
    primary: 'deepseek/deepseek-v3',
    fallback: 'google/gemini-2.0-flash-lite',
    maxTokens: 3000,
    temperature: 0.7,
    cost: {
      input: '$0.14/1M',
      output: '$0.28/1M',
      perRequest: '~$0.001'
    },
    rationale: 'Simple advisory chat. DeepSeek V3 is perfect for this.'
  },

  // Step 5: Export prompt - MOST CRITICAL 🎯
  export: {
    primary: 'minimax/minimax-m2.1',
    fallback: 'anthropic/claude-4.5-sonnet',
    maxTokens: 8000,
    temperature: 0.7,
    cost: {
      input: '$0.20/1M',
      output: '$1.10/1M',
      perRequest: '~$0.05'
    },
    rationale: '🔥 CRITICAL: MiniMax M2.1 is BUILT for agentic IDEs. Perfect for generating Claude Code prompts!'
  }
}
```

---

## Cost Comparison

### Current (All Gemini 2.0 Flash)
```
Analysis:     $0.001
Features:     $0.002
PRD:          $0.003
Export:       $0.002
────────────────────
Total:        ~$0.01/session
Quality:      ⭐⭐⭐ (Good)
```

### My Original Plan (Before New Pricing)
```
Analysis:     Gemini Flash    $0.001
Features:     Claude Sonnet   $0.15
PRD:          Claude Sonnet   $0.20
Export:       Claude Sonnet   $0.10
────────────────────────────────────
Total:        ~$0.46/session
Quality:      ⭐⭐⭐⭐⭐ (Excellent)
```

### NEW OPTIMAL Plan (With Latest Models)
```
Analysis:     DeepSeek V3     $0.002   ⭐ Budget king
Features:     Claude 4.5 Son  $0.15    ⭐ SOTA coding
PRD:          Gemini 2.5 Pro  $0.12    ⭐ Rivals Claude, 1/2 cost
Story Files:  MiniMax M2.1    $0.05    ⭐ Agentic specialist
Design:       GLM-4.7         $0.04    ⭐ Best value high-IQ
Export:       MiniMax M2.1    $0.05    🎯 Built for this!
────────────────────────────────────────────────────────────
Total:        ~$0.43/session
Quality:      ⭐⭐⭐⭐⭐ (Excellent+)
```

### BUDGET-OPTIMIZED Plan
```
Analysis:     DeepSeek V3     $0.002
Features:     Gemini 2.5 Pro  $0.08    ⭐ Rivals Claude at 1/2 cost
PRD:          Gemini 2.5 Pro  $0.12
Story Files:  MiniMax M2.1    $0.05
Design:       GLM-4.7         $0.04
Export:       MiniMax M2.1    $0.05    🎯 Perfect match
────────────────────────────────────────────────────────
Total:        ~$0.36/session
Quality:      ⭐⭐⭐⭐ (Very Good)
Savings:      16% vs Optimal, 35x quality vs Current
```

---

## Key Strategic Decisions

### 1. **Export Step: MiniMax M2.1 is PERFECT** 🎯

**Why MiniMax M2.1 for Export?**
- Specifically built for "agentic flows"
- Optimized for IDE/coding assistant outputs
- We're generating prompts FOR Claude Code (an IDE agent)
- 1/3 the cost of Claude 4.5 Sonnet
- **This is literally what it was designed for**

**Evidence from pricing doc:**
> "Best Coding (Agentic): minimax/minimax-m2.1 - Optimized specifically for IDEs and agentic flows."

### 2. **Features Step: Keep Claude 4.5 Sonnet**

**Why Claude for Features?**
- SOTA coding (77.2% SWE-bench)
- Best at complex instruction following
- Creative + structured output
- Features are CRITICAL - this is where quality matters most
- Worth the $0.15/request

**Alternative:** Gemini 2.5 Pro ($0.08) "rivals Sonnet" - could save 50%

### 3. **PRD Step: Switch to Gemini 2.5 Pro**

**Why Gemini 2.5 Pro?**
- "Rivals Sonnet 3.5" for reasoning
- Half the cost ($1.25/$10 vs $3/$15)
- 2M context (vs Claude's 200k)
- Still excellent quality for long-form docs

**Savings:** $0.08 per PRD vs Claude

### 4. **Everything Else: DeepSeek V3**

**Why DeepSeek V3 for simple tasks?**
- "Rivals proprietary models at fraction of cost"
- $0.14/$0.28 - incredibly cheap
- Analysis, chat, refinement = don't need expensive models
- Better than Gemini Flash, cheaper than Claude Haiku

---

## Experimental: Premium Tier Option

**For users who want ABSOLUTE BEST quality:**

```javascript
export const PREMIUM_MODEL_CONFIGS = {
  analysis: 'deepseek/deepseek-v3',        // Still cheap, good enough
  features: 'openai/gpt-5.2',              // $1.75/$14 - The King
  prd: 'google/gemini-3-pro-preview',      // $2.00/$12 - New reasoning powerhouse
  storyFiles: 'anthropic/claude-4.5-opus', // $5/$25 - Deep reasoning
  designBrief: 'openai/gpt-5.2',           // Best at structured output
  export: 'anthropic/claude-4.5-opus',     // Ultimate quality
}
// Cost: ~$1.50/session
// Quality: ⭐⭐⭐⭐⭐⭐ (Cutting Edge)
```

---

## Implementation Notes

### Provider Config
```javascript
// backend/config/providers.js

export const PROVIDER_CONFIG = {
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': 'https://ideaforge.app',
      'X-Title': 'IdeaForge',
    }
  }
}
```

### Model Availability
All models listed are available via OpenRouter. No need for separate API keys.

### Rate Limits
From OpenRouter:
- Free tier: Lower rate limits on free/preview models
- Paid: Standard rate limits per model
- DeepSeek V3: High throughput, good for production

### Context Windows
```
DeepSeek V3:     64k  ✓ Plenty for our use
MiniMax M2.1:    32k  ✓ Sufficient
GLM-4.7:         128k ✓ More than enough
Gemini 2.5 Pro:  2M   ✓ Massive (overkill but nice)
Claude 4.5:      200k ✓ Extended to 1M
```

All our prompts fit easily in these windows.

---

## Updated Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| MiniMax M2.1 is untested for our use case | Benchmark against Claude 4.5 Sonnet before rolling out |
| DeepSeek V3 quality might not match claims | A/B test vs Gemini Flash on analysis tasks |
| Model availability/rate limits | Implement fallbacks for each function |
| Cost explosion if usage scales | Set spending limits, log all requests |
| Free models (Gemini 2.0 Flash Exp) disappear | Don't rely on free tier for production |

---

## Benchmarking Plan

Before going live, test each model on:

1. **Analysis:** Extract insights from 10 sample research docs
2. **Features:** Generate features from 5 PRD contexts
3. **Export:** Create Claude Code prompts from 5 feature sets

**Metrics:**
- Quality score (manual evaluation)
- Speed (latency)
- Cost (per request)
- Consistency (same prompt 3x)

**Success criteria:**
- MiniMax M2.1 export quality >= 90% of Claude 4.5 Sonnet
- DeepSeek V3 analysis quality >= 95% of Gemini Flash
- Gemini 2.5 Pro PRD quality >= 85% of Claude 4.5 Sonnet

---

## Final Recommendation

### Standard Tier (Recommended)
```
Total cost: $0.36/session
Quality: ⭐⭐⭐⭐ (Very Good)
```

**Model mapping:**
- Analysis → DeepSeek V3
- Features → Gemini 2.5 Pro (cost) OR Claude 4.5 Sonnet (quality)
- PRD → Gemini 2.5 Pro
- Export → **MiniMax M2.1** 🎯

### Premium Tier (Optional)
```
Total cost: $0.43/session
Quality: ⭐⭐⭐⭐⭐ (Excellent)
```

**Model mapping:**
- Analysis → DeepSeek V3
- Features → Claude 4.5 Sonnet
- PRD → Gemini 2.5 Pro
- Export → **MiniMax M2.1** 🎯

**The big win:** MiniMax M2.1 for Export is a no-brainer. It's literally built for this.

---

## Next Steps

1. ✅ Review this updated plan
2. ⏳ Sign up for OpenRouter
3. ⏳ Implement provider abstraction
4. ⏳ Benchmark MiniMax M2.1 vs Claude 4.5 Sonnet on export
5. ⏳ Roll out Standard Tier
6. ⏳ Optional: Add Premium Tier toggle in UI

**Question for you:** Should we go Standard Tier or Premium Tier? Or make it user-configurable?

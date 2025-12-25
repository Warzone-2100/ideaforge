# Model Analysis for IdeaForge
> Created: 2025-12-25
> Source: OpenRouter actual pricing data

## Available Models (Sorted by Intelligence)

### 🏆 TIER 1: Maximum Intelligence
| Model | Input | Output | Context | Best For |
|-------|-------|--------|---------|----------|
| `anthropic/claude-4.5-opus-20251124` | $5.00 | $25.00 | 200K | **Max reasoning/intelligence** |
| `anthropic/claude-4.5-sonnet-20250929` | $3.00 | $15.00 | 1M | **SOTA coding (77.2% SWE-bench)** |
| `x-ai/grok-4` | $3.00 | $15.00 | 256K | **Reasoning with tool calling** |
| `google/gemini-3-pro-preview-20251117` | $2.00 | $12.00 | 1M | **Latest Google flagship** |
| `openai/gpt-5.2` | $1.75 | $14.00 | 128K | **OpenAI flagship, agentic/coding** |
| `google/gemini-2.5-pro` | $1.25 | $10.00 | 1M | **Previous gen flagship** |

### 🥈 TIER 2: Balanced (Speed + Intelligence)
| Model | Input | Output | Context | Best For |
|-------|-------|--------|---------|----------|
| `anthropic/claude-4.5-haiku-20251001` | $1.00 | $5.00 | 200K | **Frontier intelligence, 1/3 cost** |
| `anthropic/claude-3.5-haiku-20241022` | $0.80 | $4.00 | 200K | **Speed/cost balance** |
| `google/gemini-3-flash-preview` | $0.50 | $3.00 | 1M | **Next-gen speed** |
| `google/gemini-2.5-flash` | $0.30 | $2.50 | 1M | **Fast + capable** |
| `x-ai/grok-3-mini` | $0.30 | $0.50 | 131K | **Logic reasoning** |

### 🥉 TIER 3: Speed/Cost Optimized
| Model | Input | Output | Context | Best For |
|-------|-------|--------|---------|----------|
| `x-ai/grok-4.1-fast` | $0.20 | $0.50 | 2M | **Agentic tool calling** |
| `x-ai/grok-code-fast-1` | $0.20 | $1.50 | 256K | **Agentic coding** |
| `deepseek/deepseek-v3.2` | $0.28 | $0.42 | 131K | **Value + intelligence** |
| `google/gemini-2.5-flash-lite` | $0.10 | $0.40 | 1M | **Ultra cheap + fast** |

---

## Task Requirements Analysis

### MAX BRAIN Tasks (Quality > Cost)
**Requirements:** Precision, accuracy, complex reasoning
**Tasks:** PRD generation, Story files, Export prompts (agent instructions)
**Why:** These outputs drive implementation - errors are costly
**Best Models:** Claude 4.5 Sonnet/Opus, Gemini 3 Pro

### MEDIUM Tasks (Balance)
**Requirements:** Good quality, reasonable speed
**Tasks:** Feature generation, Design briefs
**Why:** User reviews these, can iterate
**Best Models:** Claude 4.5 Haiku, Gemini 3 Flash, Grok Code Fast

### SPEED Tasks (Speed > Quality)
**Requirements:** Fast responses, low stakes
**Tasks:** Analysis (pattern extraction), Chat, Refinement
**Why:** User can iterate, just extracting patterns
**Best Models:** Gemini 2.5 Flash Lite, Grok 4.1 Fast

---

## Recommended Configuration

### Option A: MAXIMUM QUALITY (use best models)
```javascript
// MAX BRAIN: Use absolute best
prd: 'anthropic/claude-4.5-sonnet-20250929'        // $3/$15 - SOTA coding
storyFiles: 'anthropic/claude-4.5-sonnet-20250929' // $3/$15 - specs need precision
export: 'anthropic/claude-4.5-sonnet-20250929'     // $3/$15 - agent prompts critical

// MEDIUM: Use balanced
features: 'anthropic/claude-4.5-haiku-20251001'    // $1/$5 - good balance
designBrief: 'google/gemini-3-flash-preview'       // $0.50/$3 - design specialist

// SPEED: Use cheapest
analysis: 'google/gemini-2.5-flash-lite'           // $0.10/$0.40 - pattern extraction
refineFeatures: 'google/gemini-2.5-flash-lite'     // $0.10/$0.40 - quick chat
chatWithExport: 'google/gemini-2.5-flash-lite'     // $0.10/$0.40 - advisory
```

**Cost per session:** ~$0.50-1.00 (quality tasks use premium models)
**Quality:** Maximum

### Option B: BALANCED (good quality, reasonable cost)
```javascript
// MAX BRAIN: Use high-tier but not most expensive
prd: 'google/gemini-3-pro-preview-20251117'       // $2/$12 - newest Google
storyFiles: 'anthropic/claude-4.5-haiku-20251001' // $1/$5 - coding capable
export: 'anthropic/claude-4.5-haiku-20251001'     // $1/$5 - agent prompts

// MEDIUM: Use mid-tier
features: 'x-ai/grok-code-fast-1'                  // $0.20/$1.50 - agentic coding
designBrief: 'google/gemini-3-flash-preview'       // $0.50/$3 - design

// SPEED: Use cheapest
analysis: 'google/gemini-2.5-flash-lite'           // $0.10/$0.40
refineFeatures: 'x-ai/grok-4.1-fast'               // $0.20/$0.50
chatWithExport: 'google/gemini-2.5-flash-lite'     // $0.10/$0.40
```

**Cost per session:** ~$0.20-0.40
**Quality:** High

### Option C: BUDGET (minimize cost)
```javascript
// Everything uses cheap models
primary: 'google/gemini-2.5-flash-lite'            // $0.10/$0.40 everywhere
fallback: 'x-ai/grok-4.1-fast'                     // $0.20/$0.50
```

**Cost per session:** ~$0.05-0.10
**Quality:** Good but not optimal

---

## FINAL RECOMMENDATION

**Use Option A: MAXIMUM QUALITY**

Why: PRD, Story Files, and Export prompts are critical outputs that drive actual implementation. Using Claude 4.5 Sonnet ($3/$15) for these tasks ensures:
- Highest accuracy on specifications
- Best coding knowledge (77.2% SWE-bench)
- Fewer errors = less wasted dev time

The extra cost ($3 vs $0.40 input) is worth it for critical tasks.

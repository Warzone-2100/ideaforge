# OpenRouter Model Pricing - VERIFIED DATA
> **Last Updated:** 2025-12-25
> **Source:** OpenRouter.ai (actual provider pages)
> **Status:** ✅ Verified via web scraping

---

## TIER 1: Maximum Intelligence (SOTA Models)

| Model ID | Context | Input | Output | Best For |
|----------|---------|-------|--------|----------|
| `anthropic/claude-4.5-opus-20251124` | 200K | $5.00 | $25.00 | Max reasoning/intelligence |
| `anthropic/claude-4.5-sonnet-20250929` | 1M | $3.00 | $15.00 | **⭐ SOTA Coding (77.2% SWE-bench)** |
| `x-ai/grok-4` | 256K | $3.00 | $15.00 | Reasoning + tool calling |
| `google/gemini-3-pro-preview-20251117` | 1M | $2.00 | $12.00 | Latest Google flagship |
| `openai/gpt-5.2` | 128K | $1.75 | $14.00 | OpenAI flagship, agentic/coding |
| `google/gemini-2.5-pro` | 1M | $1.25 | $10.00 | Previous gen flagship |

---

## TIER 2: Balanced (Speed + Intelligence)

| Model ID | Context | Input | Output | Best For |
|----------|---------|-------|--------|----------|
| `anthropic/claude-4.5-haiku-20251001` | 200K | $1.00 | $5.00 | Frontier intelligence, 1/3 cost of Sonnet |
| `anthropic/claude-3.5-haiku-20241022` | 200K | $0.80 | $4.00 | Speed/cost balance |
| `google/gemini-3-flash-preview` | 1M | $0.50 | $3.00 | **⭐ Next-gen speed** |
| `google/gemini-2.5-flash` | 1M | $0.30 | $2.50 | Fast + capable |
| `x-ai/grok-3-mini` | 131K | $0.30 | $0.50 | Logic reasoning |
| `deepseek/deepseek-v3.2` | 131K | $0.28 | $0.42 | Value + intelligence |

---

## TIER 3: Speed/Cost Optimized

| Model ID | Context | Input | Output | Best For |
|----------|---------|-------|--------|----------|
| `google/gemini-2.5-flash-lite` | 1M | $0.10 | $0.40 | **⭐ Ultra cheap + fast** |
| `x-ai/grok-4.1-fast` | 2M | $0.20 | $0.50 | Agentic tool calling |
| `x-ai/grok-code-fast-1` | 256K | $0.20 | $1.50 | Agentic coding |

---

## Full Provider Breakdown

### Anthropic Claude
**Best For:** SOTA coding, complex instruction following, agentic tasks

| Model ID | Context | Input | Output |
|----------|---------|-------|--------|
| `anthropic/claude-4.5-opus-20251124` | 200K | $5.00 | $25.00 |
| `anthropic/claude-4.5-sonnet-20250929` | 1M | $3.00 | $15.00 |
| `anthropic/claude-4.5-haiku-20251001` | 200K | $1.00 | $5.00 |
| `anthropic/claude-3.5-sonnet` | 200K | $6.00 | $30.00 |
| `anthropic/claude-3.5-haiku-20241022` | 200K | $0.80 | $4.00 |

---

### Google Gemini
**Best For:** Massive context (1M+), multimodal, cost-efficiency

| Model ID | Context | Input | Output |
|----------|---------|-------|--------|
| `google/gemini-3-pro-preview-20251117` | 1M | $2.00 | $12.00 |
| `google/gemini-3-flash-preview` | 1M | $0.50 | $3.00 |
| `google/gemini-2.5-pro` | 1M | $1.25 | $10.00 |
| `google/gemini-2.5-flash` | 1M | $0.30 | $2.50 |
| `google/gemini-2.5-flash-lite` | 1M | $0.10 | $0.40 |
| `google/gemini-2.0-flash-001` | 1M | $0.10 | $0.40 |
| `google/gemini-2.0-flash-lite-001` | 1M | $0.075 | $0.30 |

---

### X-AI Grok
**Best For:** Agentic tasks, tool calling, coding with reasoning traces

| Model ID | Context | Input | Output |
|----------|---------|-------|--------|
| `x-ai/grok-4.1-fast` | 2M | $0.20 | $0.50 |
| `x-ai/grok-4-fast` | 2M | $0.20 | $0.50 |
| `x-ai/grok-code-fast-1` | 256K | $0.20 | $1.50 |
| `x-ai/grok-4` | 256K | $3.00 | $15.00 |
| `x-ai/grok-3` | 131K | $3.00 | $15.00 |
| `x-ai/grok-3-mini` | 131K | $0.30 | $0.50 |

---

### OpenAI
**Best For:** General purpose, agentic tasks, coding

| Model ID | Context | Input | Output |
|----------|---------|-------|--------|
| `openai/gpt-5.2` | 128K | $1.75 | $14.00 |

---

### DeepSeek
**Best For:** High price-to-performance ratio, value

| Model ID | Context | Input | Output |
|----------|---------|-------|--------|
| `deepseek/deepseek-v3.2` | 131K | $0.28 | $0.42 |
| `deepseek/deepseek-r1` | 64K | $0.55 | $2.19 |

---

## Recommended Configuration for IdeaForge

### MAX BRAIN Tasks (PRD, Story Files, Export Prompts)
**Primary:** `anthropic/claude-4.5-sonnet-20250929` ($3/$15)
- 77.2% SWE-bench (proven SOTA for code)
- Best for specifications and agent instructions

**Fallback:** `openai/gpt-5.2` ($1.75/$14)
- Cheaper alternative, agentic/coding optimized

### MEDIUM Tasks (Features, Design)
**Primary:** `anthropic/claude-4.5-haiku-20251001` ($1/$5)
- Frontier intelligence at 1/3 cost

**Fallback:** `google/gemini-3-flash-preview` ($0.50/$3)
- Next-gen speed

### SPEED Tasks (Analysis, Chat)
**Primary:** `google/gemini-2.5-flash-lite` ($0.10/$0.40)
- Ultra cheap for pattern extraction

**Fallback:** `x-ai/grok-4.1-fast` ($0.20/$0.50)
- Agentic tool calling

---

## Cost Analysis

### Current (GLM-4.7): ~$0.029/session
- All tasks: $0.40 input / $1.50 output

### Proposed (Optimized): ~$0.30-0.50/session
- Speed tasks: $0.10 (75% cheaper) ✅
- Medium tasks: $0.50-1.00 (similar or slightly more)
- Max brain: $3.00 (7.5x more expensive but SOTA quality) ⚠️

### Trade-off
- Pay more for critical tasks (PRD, Stories, Prompts) → Use SOTA models
- Save massively on high-volume tasks (Analysis, Chat) → Use ultra-cheap models
- Net result: Better quality where it matters, massive savings on routine tasks

---

## Sources
- Anthropic: https://openrouter.ai/anthropic
- Google: https://openrouter.ai/google
- X-AI: https://openrouter.ai/x-ai
- OpenAI: https://openrouter.ai/openai
- DeepSeek: https://openrouter.ai/provider/deepseek

---

## Notes
- All prices are per 1M tokens
- Context windows are approximate (may vary by specific use case)
- "Preview" models may have lower rate limits
- Prices verified as of 2025-12-25

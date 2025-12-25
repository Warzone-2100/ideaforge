/**
 * Model Configuration for IdeaForge
 * Based on OpenRouter pricing analysis (Dec 2025)
 * Last Updated: 2025-12-25
 *
 * Strategy: Tier-based routing for optimal quality/cost
 * - TIER 1 (MAX BRAIN): Claude 4.5 Sonnet for critical specs (PRD, Stories, Export)
 * - TIER 2 (MEDIUM): Claude 4.5 Haiku for structured generation (Features, Design)
 * - TIER 3 (SPEED): Gemini 2.5 Flash Lite for pattern extraction (Analysis, Chat)
 *
 * Fallback strategy: Each tier has a fallback model in case primary fails
 */

export const MODEL_CONFIGS = {
  // ⚡ SPEED TIER - Pattern extraction, chat ($0.10/$0.40)
  // Step 1: Analyze Research
  analysis: {
    primary: 'google/gemini-2.5-flash-lite',
    fallback: 'x-ai/grok-4.1-fast',
    maxTokens: 6000,
    temperature: 0.7,
  },

  // Step 3: Refine Features (Chat)
  refineFeatures: {
    primary: 'google/gemini-2.5-flash-lite',
    fallback: 'x-ai/grok-4.1-fast',
    maxTokens: 4000,
    temperature: 0.7,
  },

  // Step 7: Chat with Export
  chatWithExport: {
    primary: 'google/gemini-2.5-flash-lite',
    fallback: 'x-ai/grok-4.1-fast',
    maxTokens: 3000,
    temperature: 0.7,
  },

  // 🧠 MEDIUM TIER - Structured generation ($1/$5)
  // Step 2: Generate Features
  features: {
    primary: 'anthropic/claude-4.5-haiku-20251001',
    fallback: 'google/gemini-3-flash-preview',
    maxTokens: 8000,
    temperature: 0.7,
  },

  // Step 6: Generate Design Brief
  designBrief: {
    primary: 'google/gemini-3-flash-preview',
    fallback: 'anthropic/claude-4.5-haiku-20251001',
    maxTokens: 8000,
    temperature: 0.7,
  },

  // 🚀 MAX BRAIN TIER - Critical specifications ($3/$15)
  // Step 4: Generate PRD
  prd: {
    primary: 'anthropic/claude-4.5-sonnet-20250929',
    fallback: 'openai/gpt-5.2',
    maxTokens: 12000,
    temperature: 0.7,
  },

  // Step 5: Generate Story Files
  storyFiles: {
    primary: 'anthropic/claude-4.5-sonnet-20250929',
    fallback: 'openai/gpt-5.2',
    maxTokens: 15000,
    temperature: 0.5,
  },

  // Step 8: Export Prompts (Claude/Cursor/etc)
  export: {
    primary: 'anthropic/claude-4.5-sonnet-20250929',
    fallback: 'openai/gpt-5.2',
    maxTokens: 8000,
    temperature: 0.7,
  },

  // 🎨 DESIGN VARIATIONS - Multi-model comparison (3 models in parallel)
  // NEW: Generate 3 different UI interpretations of design brief
  designVariations: {
    models: [
      'google/gemini-3-flash-preview',      // Model 1: Google's design-focused
      'anthropic/claude-4.5-haiku-20251001', // Model 2: Claude's structured approach
      'deepseek/deepseek-v3.2',             // Model 3: DeepSeek's alternative style
    ],
    maxTokens: 4000,
    temperature: 0.7,
  },

  // Step 9: Expand variation to full homepage (uses MAX BRAIN)
  expandHomepage: {
    primary: 'anthropic/claude-4.5-sonnet-20250929',
    fallback: 'openai/gpt-5.2',
    maxTokens: 12000,
    temperature: 0.7,
  },
};

/**
 * Get model config for a specific task
 */
export function getModelConfig(taskName) {
  const config = MODEL_CONFIGS[taskName];
  if (!config) {
    throw new Error(`Unknown task: ${taskName}. Available tasks: ${Object.keys(MODEL_CONFIGS).join(', ')}`);
  }
  return config;
}

/**
 * Estimated cost per session (all 8 steps)
 * Based on average token usage per task
 *
 * Assumptions:
 * - Input tokens: ~2000/task (research + context)
 * - Output tokens: ~1500/task (generated content)
 *
 * Cost calculation: (input_tokens/1M * input_price) + (output_tokens/1M * output_price)
 */
export const ESTIMATED_COSTS = {
  // SPEED TIER ($0.10/$0.40)
  analysis: 0.0008,       // Gemini 2.5 Flash Lite: (2k * $0.10) + (1.5k * $0.40) / 1M
  refineFeatures: 0.0006, // Gemini 2.5 Flash Lite: smaller payloads
  chatWithExport: 0.0004, // Gemini 2.5 Flash Lite: minimal chat

  // MEDIUM TIER ($1/$5 for Haiku, $0.50/$3 for Gemini Flash)
  features: 0.013,        // Claude 4.5 Haiku: (2k * $1) + (1.5k * $5) / 1M
  designBrief: 0.0055,    // Gemini 3 Flash: (2k * $0.50) + (1.5k * $3) / 1M

  // MAX BRAIN TIER ($3/$15)
  prd: 0.0285,            // Claude 4.5 Sonnet: (2k * $3) + (1.5k * $15) / 1M
  storyFiles: 0.0285,     // Claude 4.5 Sonnet: same as PRD
  export: 0.0285,         // Claude 4.5 Sonnet: same as PRD

  // Total per session (assuming all steps used once)
  total: 0.114,           // ~$0.11 per session
  // Note: 4x more expensive than GLM-4.7 ($0.03), BUT:
  // - SOTA quality for critical tasks (PRD, Stories, Prompts)
  // - 75% cheaper on high-volume tasks (Analysis, Chat)
  // - Better instruction following overall

  // Previous config (GLM-4.7): $0.029/session
  // All-Claude Sonnet: ~$0.80/session
  // This config: $0.114/session (14% of all-Claude, 390% of GLM-4.7)
};

/**
 * Model Pricing (per 1M tokens)
 * Used for cost calculation and usage tracking
 * Source: OpenRouter pricing (updated 2025-12-25)
 */
export const MODEL_PRICING = {
  // TIER 1: MAX BRAIN ($3/$15)
  'anthropic/claude-4.5-sonnet-20250929': { input: 3.00, output: 15.00 },
  'openai/gpt-5.2': { input: 1.75, output: 14.00 },

  // TIER 2: MEDIUM ($0.50-$1 / $3-$5)
  'anthropic/claude-4.5-haiku-20251001': { input: 1.00, output: 5.00 },
  'google/gemini-3-flash-preview': { input: 0.50, output: 3.00 },

  // TIER 3: SPEED ($0.10-$0.20 / $0.40-$0.50)
  'google/gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
  'x-ai/grok-4.1-fast': { input: 0.20, output: 0.50 },

  // Design Variations Models
  'deepseek/deepseek-v3.2': { input: 0.27, output: 1.10 },

  // Legacy/Fallback models
  'google/gemini-2.0-flash-001': { input: 0.10, output: 0.40 },
  'z-ai/glm-4.7': { input: 0.40, output: 1.50 },
};

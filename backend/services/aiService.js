import { MODEL_CONFIGS, MODEL_PRICING } from '../config/models.js';
import { buildSkillsBundle } from './skillsService.js';

const defaultModel = process.env.VERTEX_AI_MODEL || 'gemini-2.0-flash-001';

// Calculate cost based on token usage and model pricing
function calculateCost(model, promptTokens, completionTokens) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`[COST] Unknown model pricing: ${model}, using $0`);
    return 0;
  }

  const inputCost = (promptTokens / 1000000) * pricing.input;
  const outputCost = (completionTokens / 1000000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    input: inputCost,
    output: outputCost,
    total: totalCost,
  };
}

// Format cost for display
function formatCost(cost) {
  if (cost < 0.001) return `$${(cost * 1000).toFixed(4)}K`; // Show in thousands for tiny amounts
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

// Check if model is an OpenRouter model (contains a slash like z-ai/glm-4.7)
function isOpenRouterModel(model) {
  return model && model.includes('/');
}

// Extract product name from PRD context
function extractProductName(prdContext) {
  if (!prdContext) return 'Product';

  // Try to find product name from PRD content
  if (prdContext.prd) {
    // Look for common patterns like "# Product Name" or "Product: Name"
    const productMatch = prdContext.prd.match(/^#\s*(.+?)(?:\n|$)/m) ||
                         prdContext.prd.match(/Product(?:\s*Name)?:\s*(.+?)(?:\n|$)/i) ||
                         prdContext.prd.match(/^##\s*(.+?)(?:\n|$)/m);
    if (productMatch && productMatch[1]) {
      return productMatch[1].trim();
    }
  }

  // Try to extract from research
  if (prdContext.research) {
    const researchMatch = prdContext.research.match(/(?:building|creating|developing)\s+(?:a\s+)?(.+?)(?:\.|,|\n|$)/i);
    if (researchMatch && researchMatch[1]) {
      return researchMatch[1].trim();
    }
  }

  // Fallback to first feature's category or generic name
  if (prdContext.features && prdContext.features.length > 0) {
    const firstFeature = prdContext.features[0];
    if (firstFeature.name) {
      return firstFeature.name.split(' ')[0] + ' App';
    }
  }

  return 'Product';
}

async function callOpenRouter(systemPrompt, userMessage, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in .env - required for model: ' + options.model);
  }

  const model = options.model;
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  // Build messages with prompt caching for Claude models
  const isClaudeModel = model.includes('anthropic/claude');
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
      // Cache system prompts for Claude (90% cheaper on subsequent requests)
      ...(isClaudeModel && { cache_control: { type: 'ephemeral' } })
    },
    {
      role: 'user',
      content: userMessage,
      // Cache user context for Claude (research/features/PRD reused across tests)
      ...(isClaudeModel && { cache_control: { type: 'ephemeral' } })
    }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ideaforge.app',
      'X-Title': 'IdeaForge',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${data.error?.message || response.statusText}`);
  }

  const content = data.choices[0].message.content;
  const usage = data.usage || {};

  // Calculate cost
  const cost = calculateCost(
    model,
    usage.prompt_tokens || 0,
    usage.completion_tokens || 0
  );

  return {
    content,
    usage: {
      model,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      cost,
    },
  };
}

async function callGemini(systemPrompt, userMessage, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }

  // Support model override for benchmarking
  const model = options.model || defaultModel;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 4000,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Gemini API error: ${data.error?.message || response.statusText}`);
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const usage = data.usageMetadata || {};

  // Calculate cost
  const cost = calculateCost(
    model,
    usage.promptTokenCount || 0,
    usage.candidatesTokenCount || 0
  );

  return {
    content,
    usage: {
      model,
      promptTokens: usage.promptTokenCount || 0,
      completionTokens: usage.candidatesTokenCount || 0,
      totalTokens: usage.totalTokenCount || 0,
      cost,
    },
  };
}

// Unified AI caller - routes to appropriate API based on model
async function callAI(systemPrompt, userMessage, options = {}) {
  const model = options.model || defaultModel;

  if (isOpenRouterModel(model)) {
    return await callOpenRouter(systemPrompt, userMessage, options);
  } else {
    return await callGemini(systemPrompt, userMessage, options);
  }
}

// Retry with fallback model if primary fails
async function callAIWithFallback(systemPrompt, userMessage, config) {
  const { primary, fallback, maxTokens, temperature } = config;

  try {
    console.log(`[AI] Calling primary model: ${primary}`);
    const response = await callAI(systemPrompt, userMessage, {
      model: primary,
      maxTokens,
      temperature,
    });

    // Log usage and cost
    const { usage } = response;
    console.log(
      `[AI] ✓ ${usage.model}\n` +
      `[AI]   Input: ${usage.promptTokens.toLocaleString()} tokens (${formatCost(usage.cost.input)}) | ` +
      `Output: ${usage.completionTokens.toLocaleString()} tokens (${formatCost(usage.cost.output)}) | ` +
      `Total: ${formatCost(usage.cost.total)}`
    );

    return response;
  } catch (primaryError) {
    console.error(`[AI] Primary model (${primary}) failed:`, primaryError.message);
    console.log(`[AI] Retrying with fallback model: ${fallback}`);

    try {
      const response = await callAI(systemPrompt, userMessage, {
        model: fallback,
        maxTokens,
        temperature,
      });

      // Log usage and cost for fallback
      const { usage } = response;
      console.log(
        `[AI] ✓ ${usage.model} (fallback succeeded)\n` +
        `[AI]   Input: ${usage.promptTokens.toLocaleString()} tokens (${formatCost(usage.cost.input)}) | ` +
        `Output: ${usage.completionTokens.toLocaleString()} tokens (${formatCost(usage.cost.output)}) | ` +
        `Total: ${formatCost(usage.cost.total)}`
      );

      return response;
    } catch (fallbackError) {
      console.error(`[AI] Fallback model (${fallback}) also failed:`, fallbackError.message);
      throw new Error(`Both models failed. Primary (${primary}): ${primaryError.message}. Fallback (${fallback}): ${fallbackError.message}`);
    }
  }
}

function parseJSON(text) {
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse error:', e);
    }
  }
  return null;
}

// ============================================================================
// RESEARCH ANALYSIS - Extract SPECIFIC insights with evidence
// ============================================================================
export async function analyzeResearch(research) {
  const systemPrompt = `You are a ruthless product analyst. Your job is to extract SPECIFIC, ACTIONABLE insights from research - not generic observations.

CRITICAL RULES:
1. Every insight MUST reference specific evidence from the research (quote it or cite specific data)
2. If the research is vague, say so - don't invent specifics that aren't there
3. Numbers beat adjectives: "43% of users" not "many users"
4. Name names: "Competitor X lacks Y" not "competitors lack features"
5. Be concrete: "Users spend 12 minutes/day on manual data entry" not "users waste time"

REJECT patterns like:
- "Users want better solutions" (no shit - WHAT solutions? WHY?)
- "Growing market opportunity" (HOW big? Growing HOW fast?)
- "Poor user experience" (WHERE specifically? What action fails?)

GOOD patterns:
- "Research shows 67% of freelancers chase invoices manually, spending avg 4.2 hours/month (source: paragraph 3)"
- "Competitor Todoist has no time-tracking; Asana requires 5 clicks to log time (vs our target of 1)"
- "Users abandon onboarding at step 3 (profile photo upload) - 34% drop-off mentioned in user interviews"

Respond with JSON:
{
  "marketInsights": [
    {
      "insight": "Specific market insight",
      "evidence": "Quote or reference from research",
      "implication": "What this means for the product"
    }
  ],
  "competitorGaps": [
    {
      "competitor": "Competitor name",
      "gap": "What they're missing or doing poorly",
      "evidence": "How you know this from the research",
      "opportunity": "How we can exploit this"
    }
  ],
  "painPoints": [
    {
      "pain": "Specific user problem",
      "who": "Which user segment experiences this",
      "frequency": "How often / how severe",
      "currentWorkaround": "What they do today",
      "evidence": "Where this came from in research"
    }
  ],
  "technicalRequirements": [
    {
      "requirement": "Technical need",
      "reason": "Why it's needed based on research",
      "priority": "must-have | should-have | nice-to-have"
    }
  ],
  "successMetrics": [
    {
      "metric": "Specific measurable metric",
      "target": "Target value if mentioned in research",
      "rationale": "Why this metric matters"
    }
  ],
  "researchQuality": {
    "score": "1-10 rating of how actionable this research is",
    "gaps": ["What's missing from the research that would help"]
  }
}

If the research is too vague, still extract what you can but be honest in researchQuality.gaps about what's missing.`;

  const userMessage = `Analyze this research. Extract SPECIFIC insights with evidence. If something is vague, flag it.

RESEARCH:
${research}

Remember: Specifics with evidence, not generic observations.`;

  try {
    const config = MODEL_CONFIGS.analysis;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);
    const parsed = parseJSON(content);

    if (parsed) {
      // Flatten the structured insights for the frontend
      return {
        success: true,
        insights: {
          marketInsights: parsed.marketInsights?.map(i => `${i.insight} (Evidence: ${i.evidence})`) || [],
          competitorGaps: parsed.competitorGaps?.map(i => `${i.competitor}: ${i.gap} → Opportunity: ${i.opportunity}`) || [],
          painPoints: parsed.painPoints?.map(i => `${i.pain} - ${i.who} (${i.frequency}). Current workaround: ${i.currentWorkaround}`) || [],
          technicalRequirements: parsed.technicalRequirements?.map(i => `[${i.priority}] ${i.requirement}: ${i.reason}`) || [],
          successMetrics: parsed.successMetrics?.map(i => `${i.metric}${i.target ? ` (Target: ${i.target})` : ''} - ${i.rationale}`) || [],
        },
        researchQuality: parsed.researchQuality,
        rawAnalysis: parsed,
        _meta: {
          model: usage.model,
          tokens: usage.totalTokens,
          cost: usage.cost.total,
          timestamp: new Date().toISOString(),
        },
      };
    }
    throw new Error('Failed to parse analysis');
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

// ============================================================================
// FEATURE GENERATION - Real features with user stories and acceptance criteria
// ============================================================================
export async function generateFeatures(research, insights, options = {}) {
  const systemPrompt = `You are a senior product manager who writes features that engineers can actually build.

Your job: Generate features that are SPECIFIC and IMPLEMENTABLE, not vague wishlists.

EACH FEATURE MUST HAVE:
1. A clear user story: "As a [specific user], I want to [specific action] so that [specific outcome]"
2. Acceptance criteria that are UNIQUE to this feature (not copy-paste generic criteria)
3. Edge cases - what could go wrong?
4. Dependencies - what needs to exist first?

REJECT features like:
- "Dashboard" (dashboard of WHAT? For WHO? Showing WHAT data?)
- "Smart Suggestions" (suggesting WHAT? Based on WHAT data? WHERE in the UI?)
- "Mobile-First Design" (this is a principle, not a feature)

GOOD features:
- "Overdue Invoice Alert Bar: A persistent banner showing count of invoices >30 days overdue with one-click 'Send Reminder' action"
- "Time Entry Autocomplete: When user types client name, suggest recent projects and auto-fill hourly rate from last invoice"
- "Weekly Revenue Email: Sunday 9am email showing invoices sent vs paid, with aging breakdown"

Respond with JSON:
{
  "features": [
    {
      "name": "Specific Feature Name (not generic)",
      "userStory": "As a [specific user type from research], I want to [specific action] so that [measurable outcome]",
      "description": "2-3 sentences explaining exactly what this does and how it works",
      "acceptanceCriteria": [
        "UNIQUE criterion specific to THIS feature",
        "Another UNIQUE criterion",
        "Include at least one performance/UX criterion"
      ],
      "edgeCases": [
        "What happens when X?",
        "What if user does Y?"
      ],
      "dependencies": ["What must exist first"],
      "priority": "mvp | high | medium | low",
      "reasoning": "Which specific insight/pain point from the research this addresses",
      "estimatedComplexity": "small (1-2 days) | medium (3-5 days) | large (1-2 weeks)"
    }
  ],
  "mvpDefinition": "One sentence describing what the MVP actually delivers to users",
  "notInMVP": ["Features that sound good but should wait for v2, and WHY"]
}

Generate 5-8 features. Quality over quantity. Each must be distinct and specific.`;

  const insightsSummary = typeof insights === 'object'
    ? Object.entries(insights).map(([key, values]) => {
        if (Array.isArray(values)) return `${key}:\n${values.map(v => `  - ${v}`).join('\n')}`;
        return `${key}: ${values}`;
      }).join('\n\n')
    : String(insights);

  const userMessage = `Based on this research and analysis, generate SPECIFIC, IMPLEMENTABLE features.

RESEARCH SUMMARY:
${research.substring(0, 4000)}

EXTRACTED INSIGHTS:
${insightsSummary}

Generate features that directly address the pain points and opportunities identified. Each feature must have a clear user story and unique acceptance criteria.`;

  try {
    const config = MODEL_CONFIGS.features;
    // Allow model override for benchmarking, otherwise use fallback logic
    const { content, usage } = options.model
      ? await callAI(systemPrompt, userMessage, {
          model: options.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          ...options
        })
      : await callAIWithFallback(systemPrompt, userMessage, config);
    const parsed = parseJSON(content);

    if (parsed?.features) {
      return {
        success: true,
        features: parsed.features,
        mvpDefinition: parsed.mvpDefinition,
        notInMVP: parsed.notInMVP,
        _meta: {
          model: usage.model,
          tokens: usage.totalTokens,
          cost: usage.cost.total,
          timestamp: new Date().toISOString(),
        },
      };
    }
    throw new Error('Failed to parse features');
  } catch (error) {
    console.error('Feature generation error:', error);
    throw error;
  }
}

// ============================================================================
// FEATURE REFINEMENT - Chat-based iteration
// ============================================================================
export async function refineFeatures(message, features) {
  const featureList = features.map((f, i) =>
    `${i + 1}. ${f.name}\n   Story: ${f.userStory || 'N/A'}\n   Description: ${f.description}`
  ).join('\n\n');

  const systemPrompt = `You are a product collaborator helping refine features through conversation.

CURRENT FEATURES:
${featureList}

Your job: Help the user improve these features. You can:
- Make features more specific
- Add missing acceptance criteria
- Identify edge cases
- Suggest new features that fit the product vision
- Split large features into smaller ones
- Merge overlapping features

When suggesting changes, be SPECIFIC about what to change and why.

Respond with JSON:
{
  "response": "Your conversational response explaining your thinking",
  "updates": [
    {
      "action": "modify",
      "featureIndex": 0,
      "changes": {
        "name": "New name if changing",
        "description": "New description if changing",
        "acceptanceCriteria": ["New criteria if adding"],
        "userStory": "New story if changing"
      },
      "reason": "Why this change improves the feature"
    },
    {
      "action": "add",
      "feature": {
        "name": "New Feature Name",
        "userStory": "As a...",
        "description": "...",
        "acceptanceCriteria": ["..."],
        "priority": "mvp|high|medium|low",
        "reasoning": "Why this feature should be added"
      }
    },
    {
      "action": "remove",
      "featureIndex": 0,
      "reason": "Why this feature should be removed or merged"
    }
  ]
}

If no updates needed, set updates to empty array but still provide a helpful response.`;

  try {
    const config = MODEL_CONFIGS.refineFeatures;
    const { content, usage } = await callAIWithFallback(systemPrompt, message, config);
    const parsed = parseJSON(content);

    return {
      success: true,
      response: parsed?.response || content,
      updates: parsed?.updates || [],
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Feature refinement error:', error);
    throw error;
  }
}

// ============================================================================
// PRD GENERATION - BMAD-inspired FR/NFR format
// ============================================================================
export async function generatePRD(research, insights, features, options = {}) {
  const systemPrompt = `You are a senior PM writing a PRD using the FR/NFR (Functional Requirements / Non-Functional Requirements) format.

This format is optimized for AI coding agents - it's structured, specific, and eliminates ambiguity.

CRITICAL RULES:
1. Functional Requirements use format: "FR#: [Actor] can [capability]"
2. Group FRs by capability area (not by technology layer)
3. NFRs only include RELEVANT categories (don't force all 5 if not applicable)
4. Every requirement must be TESTABLE - someone could verify whether it's met
5. Personas must be specific people, not demographics

STRUCTURE:

# [Product Name] - Product Requirements Document

## Executive Summary
[2-3 sentences: What is this, who is it for, what's the key differentiator]

## Problem Statement
[Specific problem being solved with evidence from research. Include cost of problem.]

## Personas

### [Persona Name] - [Role]
**Context:** [Age, situation, one-line description]
**Current Pain:** [Specific problem they face]
**Success State:** [What good looks like for them]
**Quote:** "[Frustration in their voice]"

---

## Functional Requirements

Group requirements by capability area. Each FR must:
- State WHAT capability exists, not HOW it's implemented
- Be implementation-agnostic
- Be independently testable

### [Capability Area 1: e.g., "Invoice Management"]
- **FR1:** [Actor] can [specific capability]
- **FR2:** [Actor] can [specific capability]
- **FR3:** [Actor] can [specific capability]

### [Capability Area 2: e.g., "Client Communication"]
- **FR4:** [Actor] can [specific capability]
- **FR5:** [Actor] can [specific capability]

### [Capability Area 3]
...

[Continue for 5-8 capability areas, typically 20-40 total FRs]

---

## Non-Functional Requirements

ONLY include categories that are relevant to this specific product:

### Performance (if applicable)
- **NFR-P1:** [Specific measurable requirement, e.g., "Page load < 2s on 3G connection"]
- **NFR-P2:** [Another specific requirement]

### Security (if applicable)
- **NFR-S1:** [Specific requirement, e.g., "All API endpoints require authentication"]
- **NFR-S2:** [Another specific requirement]

### Scalability (if applicable)
- **NFR-SC1:** [Specific requirement, e.g., "System handles 1000 concurrent users"]

### Accessibility (if applicable)
- **NFR-A1:** [Specific requirement, e.g., "WCAG 2.1 AA compliance"]

### Integration (if applicable)
- **NFR-I1:** [Specific requirement, e.g., "Stripe API for payments"]

---

## User Flows

### Flow 1: [Primary User Journey Name]
1. **Entry:** User [arrives/clicks/opens]...
2. **Action:** User [does something]...
3. **System:** System [responds with]...
4. **Decision Point:** If [condition], then [path A], else [path B]
5. **Success State:** User sees [confirmation/result]...
6. **Error State:** If [failure], user sees [error message with recovery action]

### Flow 2: [Secondary Journey]
...

---

## Technical Recommendations

### Stack
| Layer | Recommendation | Rationale (specific to THIS project) |
|-------|---------------|--------------------------------------|
| Frontend | [X] | [Why for this project] |
| State Management | [X] | [Why] |
| Backend | [X] | [Why] |
| Database | [X] | [Why] |
| Auth | [X] | [Why] |

### Architecture Notes
[Key architectural decisions and why they matter for this specific product]

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| [Specific metric] | [Specific number] | [How to measure] |
| [Specific metric] | [Specific number] | [How to measure] |

---

## MVP Scope

### In MVP (v1)
[List specific FRs included: FR1, FR2, FR4, FR7...]

### Deferred to v2
- [Feature/FR] - [Specific reason to defer]
- [Feature/FR] - [Specific reason to defer]

---

## Open Questions
- [ ] [Decision that needs to be made]
- [ ] [Another open question]

IMPORTANT: Generate FRs that directly map to the features provided. Each feature should become 1-3 FRs.`;

  const featuresFormatted = features.map((f, i) => {
    let text = `**Feature ${i + 1}: ${f.name}** (${f.priority})`;
    if (f.userStory) text += `\nUser Story: ${f.userStory}`;
    text += `\nDescription: ${f.description}`;
    if (f.acceptanceCriteria?.length) text += `\nAcceptance Criteria:\n${f.acceptanceCriteria.map(c => `- ${c}`).join('\n')}`;
    if (f.edgeCases?.length) text += `\nEdge Cases: ${f.edgeCases.join('; ')}`;
    if (f.dependencies?.length) text += `\nDependencies: ${f.dependencies.join(', ')}`;
    return text;
  }).join('\n\n');

  const insightsSummary = typeof insights === 'object'
    ? Object.entries(insights).map(([key, values]) => {
        if (Array.isArray(values)) return `${key}:\n${values.map(v => `  - ${v}`).join('\n')}`;
        return `${key}: ${values}`;
      }).join('\n\n')
    : String(insights);

  const userMessage = `Create a PRD using the FR/NFR format for this product.

RESEARCH:
${research.substring(0, 3000)}

KEY INSIGHTS:
${insightsSummary}

APPROVED FEATURES (convert each to 1-3 FRs):
${featuresFormatted}

Requirements:
- Generate 20-40 Functional Requirements grouped by capability area
- Each FR uses format: "FR#: [Actor] can [capability]"
- Only include relevant NFR categories
- Personas must be specific people with names
- All requirements must be testable`;

  try {
    const config = MODEL_CONFIGS.prd;
    // Allow model override for benchmarking, otherwise use fallback logic
    const { content, usage } = options.model
      ? await callAI(systemPrompt, userMessage, {
          model: options.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          ...options
        })
      : await callAIWithFallback(systemPrompt, userMessage, config);
    return {
      success: true,
      prd: content,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('PRD generation error:', error);
    throw error;
  }
}

// ============================================================================
// DATABASE SCHEMA GENERATION - Field-level specs for AI developers
// ============================================================================
export async function generateDatabaseSchema(features, prd) {
  const systemPrompt = `You are a database architect creating complete database schema specifications for AI developers.

Your job: Generate DATABASE_SCHEMA.md with field-level specifications, validation rules, security requirements, and indexes.

**DO NOT generate:**
- TypeScript interfaces
- Prisma schema code
- SQL statements
- Code examples

**DO generate:**
- Field specifications (name, type, validation, purpose)
- Security rules (who can read/write)
- Index requirements (which fields, why)
- CRUD operation requirements

FORMAT:

# Database Schema Specification

## Overview
[Brief description of database architecture]

---

### Collection/Table: \`collection_name\`

**Purpose:** [What this collection stores and why]

**Required Fields:**
- \`id\` (string, auto-generated): Unique identifier
- \`userId\` (string): Owner's Firebase Auth UID
- \`fieldName\` (string, 2-100 chars): [Description and validation rules]
- \`status\` (enum: 'draft' | 'active' | 'completed'): [Purpose]

**Optional Fields:**
- \`metadata\` (object with \`key\` string): [When/why populated]

**Auto-Managed Fields:**
- \`createdAt\` (timestamp): Record creation time
- \`updatedAt\` (timestamp): Last modification time

**Security Rules:**
- Users can only read/write their own records (userId === auth.uid)
- No public read access
- [Other specific rules]

**Indexes Needed:**
- Composite: \`userId ASC, status ASC\` - For user dashboard queries
- Single: \`createdAt DESC\` - For recent items listing

**CRUD Operations Required:**
- **Create:** Requires userId, fieldName; auto-generates id, timestamps
- **Read:** By ID (owner only), by userId (all user's records)
- **Update:** Can update fieldName, status; cannot update userId
- **Delete:** Soft delete (update status to 'deleted')

[Repeat for each collection]

---

For each feature, identify:
- What data needs to be stored?
- What fields are required vs optional?
- What security rules apply?
- What queries will be run (to determine indexes)?

Respond with the complete DATABASE_SCHEMA.md as markdown text (NOT JSON).`;

  const featuresFormatted = features.map((f, i) => {
    let text = `**Feature ${i + 1}: ${f.name}** (${f.priority})`;
    text += `\nDescription: ${f.description}`;
    if (f.acceptanceCriteria?.length) text += `\nAcceptance Criteria:\n${f.acceptanceCriteria.map(c => `- ${c}`).join('\n')}`;
    return text;
  }).join('\n\n---\n\n');

  const userMessage = `Generate complete DATABASE_SCHEMA.md based on:

FEATURES:
${featuresFormatted}

PRD FUNCTIONAL REQUIREMENTS:
${(prd || '').substring(0, 3000)}

Generate the complete database schema specification as markdown.`;

  try {
    const config = MODEL_CONFIGS.databaseSchema;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    return {
      success: true,
      schema: content,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost,
      }
    };
  } catch (error) {
    console.error('Database schema generation error:', error);
    throw error;
  }
}

// ============================================================================
// API ENDPOINTS GENERATION - Request/response specs for AI developers
// ============================================================================
export async function generateApiEndpoints(features, databaseSchema, prd) {
  const systemPrompt = `You are an API architect creating complete API endpoint specifications for AI developers.

Your job: Generate API_ENDPOINTS.md with request/response specs, business logic requirements, and error handling.

**DO NOT generate:**
- TypeScript types/interfaces
- Next.js route code
- Express handler code
- Code examples

**DO generate:**
- Input requirements (fields, validation, types)
- Success response structure
- Error response conditions
- Business logic step-by-step
- Rate limiting requirements

FORMAT:

# API Endpoints Specification

## Overview
[API architecture notes]

---

### POST \`/api/endpoint-name\`

**Purpose:** [What this endpoint accomplishes - one sentence]

**Authentication:** Required (Firebase Auth token in Authorization header)

**Input Requirements:**
- \`field1\` (string, required, 2-100 chars): [Description and validation]
- \`field2\` (number, optional, 1-1000): [Description, default: 10]
- \`field3\` (enum, required): One of 'option1', 'option2', 'option3'

**Success Response:**
- **Status:** 201 Created
- **Body Structure:** \`{ success: true, data: { id, field1, field2, createdAt } }\`

**Error Responses:**
- **400 Bad Request:** Missing required fields, invalid format, out of range
  - Example message: "field1 is required"
- **401 Unauthorized:** Missing or invalid auth token
- **500 Internal Server Error:** Database write failed, external API error

**Business Logic (Step-by-Step):**
1. Validate auth token → Extract userId
2. Validate input fields:
   - Check required fields present
   - Validate field1 length (2-100 chars)
   - Validate field2 range (1-1000)
   - Validate field3 enum value
3. Call external API (if needed):
   - API: [Service Name]
   - Endpoint: [URL pattern]
   - Send: [What data]
   - Handle response: [How to process]
4. Transform data:
   - Extract [fields]
   - Convert [format] to [format]
   - Calculate [derived values]
5. Save to database:
   - Collection: \`collection_name\`
   - Include: userId, field1, field2, timestamps
6. Return formatted response

**Rate Limiting:** 10 requests per minute per user

**Implementation Location:** \`app/api/endpoint-name/route.ts\`

[Repeat for each endpoint]

---

For each feature, identify:
- What API endpoints are needed?
- What inputs do they accept?
- What business logic is required?
- What can go wrong (errors)?

Respond with the complete API_ENDPOINTS.md as markdown text (NOT JSON).`;

  const featuresFormatted = features.map((f, i) => {
    let text = `**Feature ${i + 1}: ${f.name}** (${f.priority})`;
    text += `\nDescription: ${f.description}`;
    if (f.acceptanceCriteria?.length) text += `\nAcceptance Criteria:\n${f.acceptanceCriteria.map(c => `- ${c}`).join('\n')}`;
    return text;
  }).join('\n\n---\n\n');

  const userMessage = `Generate complete API_ENDPOINTS.md based on:

FEATURES:
${featuresFormatted}

DATABASE_SCHEMA:
${(databaseSchema || '').substring(0, 2000)}

PRD CONTEXT:
${(prd || '').substring(0, 2000)}

Generate the complete API endpoints specification as markdown.`;

  try {
    const config = MODEL_CONFIGS.apiEndpoints;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    return {
      success: true,
      endpoints: content,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost,
      }
    };
  } catch (error) {
    console.error('API endpoints generation error:', error);
    throw error;
  }
}

// ============================================================================
// COMPONENT TREE GENERATION - Frontend architecture specs for AI developers
// ============================================================================
export async function generateComponentTree(features, apiEndpoints, prd) {
  const systemPrompt = `You are a frontend architect creating complete component specifications for AI developers.

Your job: Generate COMPONENT_TREE.md with component hierarchy, props, state, and interactions.

**DO NOT generate:**
- React component code
- TypeScript type definitions
- JSX examples
- Code snippets

**DO generate:**
- Component hierarchy (parent-child relationships)
- Props requirements (name, type, purpose)
- State requirements (what, why, when)
- User interaction flows
- Styling requirements (reference design tokens)

FORMAT:

# Component Architecture Specification

## Overview
[Component architecture approach]

---

### Page: \`app/feature-name/page.tsx\`

**Type:** Server Component
**Purpose:** [What this page does]
**Data Fetching:** [What data to fetch server-side]
**Child Components:** MainComponent, Sidebar

---

### Component: \`MainComponent\`

**Location:** \`components/feature/MainComponent.tsx\`
**Type:** Client Component (requires interactivity)
**Purpose:** [Single responsibility of this component]

**Props Required:**
- \`onSubmit\` (function: (data) => Promise<void>): [When/how called]
- \`initialData\` (object, optional): [Purpose]
- \`isLoading\` (boolean): [What it controls]

**State Requirements:**
- \`formData\` (object): Current form values
  - Initial: empty or from initialData
  - Updated: on user input
- \`validationErrors\` (string[]): Validation messages
  - Initial: []
  - Updated: on validation failure
- \`isSubmitting\` (boolean): Submission state
  - Initial: false
  - Updated: true during API call

**User Interactions:**
- Type in field → Update formData, clear errors
- Click submit → Validate, call onSubmit, show loading
- On error → Display validation errors

**Child Components:**
- \`FormInput\` - Reusable input with validation
- \`ErrorDisplay\` - Show errors
- \`SubmitButton\` - Handle loading states

**Styling Requirements:**
- Use design tokens from design-brief.json
- Primary button: \`primary\` color
- Error text: \`error\` color
- Responsive: Stack on mobile

---

### State Management: \`stores/featureStore.ts\`

**Solution:** Zustand

**State Schema:**
\`\`\`
{
  currentData: object | null,
  savedRecords: array,
  isLoading: boolean,
  error: string | null
}
\`\`\`

**Actions Required:**
- \`submitData(data)\`: Call API POST, update savedRecords
- \`fetchRecords()\`: Call API GET, populate savedRecords
- \`resetForm()\`: Clear currentData and error

[Repeat for each page/component]

---

For each feature, identify:
- What pages are needed?
- What components make up each page?
- What props do components need?
- What state is required?
- How do users interact?

Respond with the complete COMPONENT_TREE.md as markdown text (NOT JSON).`;

  const featuresFormatted = features.map((f, i) => {
    let text = `**Feature ${i + 1}: ${f.name}** (${f.priority})`;
    text += `\nDescription: ${f.description}`;
    if (f.acceptanceCriteria?.length) text += `\nAcceptance Criteria:\n${f.acceptanceCriteria.map(c => `- ${c}`).join('\n')}`;
    return text;
  }).join('\n\n---\n\n');

  const userMessage = `Generate complete COMPONENT_TREE.md based on:

FEATURES:
${featuresFormatted}

API_ENDPOINTS:
${(apiEndpoints || '').substring(0, 2000)}

PRD CONTEXT:
${(prd || '').substring(0, 2000)}

Generate the complete component architecture specification as markdown.`;

  try {
    const config = MODEL_CONFIGS.componentTree;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    return {
      success: true,
      components: content,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost,
      }
    };
  } catch (error) {
    console.error('Component tree generation error:', error);
    throw error;
  }
}

// ============================================================================
// STORY FILES GENERATION - Atomic, AI-digestible story files (SPECIFICATION-FOCUSED)
// ============================================================================
export async function generateStoryFiles(features, prd, databaseSchema, apiEndpoints, componentTree) {
  const systemPrompt = `You are a Scrum Master generating SPECIFICATION-FOCUSED story files for AI coding agents with modern tooling.

Each story provides SPECIFICATIONS (requirements, schemas, endpoints) NOT implementations (code examples).

BMAD BEST PRACTICES (2025):
- **Traceability First**: Every decision links back to PRD and original research
- **Security by Default**: Explicit security requirements in every story
- **Architectural Context**: Explain WHY, not just WHAT
- **Self-Contained**: Each story has full context for independent implementation

AI developers will use:
- **context7** to fetch latest framework docs
- **LSP plugins** for code intelligence
- **Explore subagent** to find patterns in codebase

STORY FILE FORMAT:

\`\`\`markdown
# Story [EPIC].[STORY]: [Title]

**Status:** draft
**Priority:** [mvp|high|medium|low]
**Complexity:** [small|medium|large]
**Depends On:** Story Y.Y | None
**Blocks:** Story Z.Z

---

## User Story

As a [persona], I want [goal] so that [benefit].

---

## PRD Traceability

- **PRD Section:** [FR-X.Y or NFR-X.Y from PRD]
- **Why This Matters:** [Link to core value proposition or user pain point from research]
- **Success Metric:** [Specific metric from PRD that this story impacts]
- **Research Quote:** "[Direct quote from original research that validates this need]"

---

## Acceptance Criteria

1. [ ] [Specific, testable criterion]
2. [ ] [Another criterion]
3. [ ] [UX/performance criterion]
4. [ ] [Error handling criterion]

---

## Security Requirements

- **Authentication:** [What auth is required, which roles/permissions]
- **Authorization:** [Role-based access control rules, who can do what]
- **Data Validation:** [Input sanitization, XSS/injection prevention]
- **Rate Limiting:** [API rate limits, abuse prevention]
- **Sensitive Data:** [PII handling, encryption requirements]
- **Audit Trail:** [What actions need logging for compliance]

---

## Database Schema Specification

**Reference:** DATABASE_SCHEMA.md → Collection: \`collection_name\`

**Key Requirements:**
- Required fields: [list with validation rules]
- Security: [access control requirements]
- Indexes: [which and why]

---

## API Endpoints Specification

**Reference:** API_ENDPOINTS.md → POST \`/api/endpoint\`

**Key Requirements:**
- Input validation: [rules]
- Business logic: [step-by-step]
- Success response: [structure]
- Error handling: [conditions]

---

## Architectural Decisions

- **Pattern:** [e.g., Server-side rendering with client components]
- **Why:** [Reasoning from architecture phase - performance, SEO, DX, etc.]
- **Trade-offs:** [What we gain vs. what we sacrifice]
- **Alternative Considered:** [What else was considered and why rejected]

---

## Component Architecture Specification

**Reference:** COMPONENT_TREE.md → Components for this feature

**Key Requirements:**
- Page type: [Server/Client and why]
- Components needed: [list]
- Props: [per component]
- State: [what and where]
- User interactions: [flows]

---

## Implementation Requirements

### Files to Create:
- [ ] \`app/feature/page.tsx\` - [purpose]
- [ ] \`app/api/endpoint/route.ts\` - [purpose]
- [ ] \`components/MainComponent.tsx\` - [purpose]
- [ ] \`lib/feature-helper.ts\` - [purpose]
- [ ] \`stores/featureStore.ts\` - [purpose]

### Business Logic:
- Input validation: [specify rules]
- External API: [which service, how to integrate]
- Data transformation: [describe transformations]
- Error handling: [which errors, how to handle]

---

## Edge Cases & Handling

1. **[Edge Case Name]**
   - **Condition:** [When it occurs]
   - **Expected Behavior:** [What should happen]
   - **Implementation:** [How to handle]

---

## Validation Checkpoint ✅

**STOP and test before proceeding**

### Functional Tests:
- [ ] Page renders without errors
- [ ] Form validation works
- [ ] Data persists correctly

### Technical Tests:
- [ ] TypeScript builds
- [ ] All acceptance criteria met
- [ ] Security rules tested

### Security Tests:
- [ ] Authentication enforced
- [ ] Authorization rules working
- [ ] Input validation prevents injection

---

## MCP Usage

When implementing this story:

\`\`\`
Use context7 to fetch latest Next.js 14 App Router docs
Use context7 to fetch latest React 18 Server Components patterns
Use Explore subagent to find existing API patterns in codebase
\`\`\`

---

## References

- DATABASE_SCHEMA.md: [Section]
- API_ENDPOINTS.md: [Section]
- COMPONENT_TREE.md: [Section]
- PRD.md: [Section with FR/NFR numbers]
\`\`\`

CRITICAL RULES:
1. **NO CODE EXAMPLES** - Only specifications
2. Reference spec docs (DATABASE_SCHEMA, API_ENDPOINTS, COMPONENT_TREE)
3. Each story independently implementable
4. Include MCP tool usage instructions
5. Validation checkpoints required
6. **PRD Traceability** - Link every story back to specific PRD sections (FR/NFR numbers)
7. **Security First** - Every story MUST have explicit security requirements
8. **Architectural Context** - Explain WHY decisions were made, not just WHAT
9. **Research Validation** - Include direct quotes from original research that validate the need

Respond with JSON:
{
  "stories": [
    {
      "epicNumber": 1,
      "storyNumber": 1,
      "title": "Story title",
      "filename": "story-1-1-title-slug.md",
      "content": "Full markdown (NO code examples!)"
    }
  ],
  "epicSummary": {},
  "implementationOrder": [],
  "totalComplexity": ""
}`;

  const featuresFormatted = features.map((f, i) => {
    let text = `**Feature ${i + 1}: ${f.name}** (${f.priority}, ${f.estimatedComplexity || 'medium'})`;
    if (f.userStory) text += `\nUser Story: ${f.userStory}`;
    text += `\nDescription: ${f.description}`;
    if (f.acceptanceCriteria?.length) text += `\nAcceptance Criteria:\n${f.acceptanceCriteria.map(c => `- ${c}`).join('\n')}`;
    if (f.edgeCases?.length) text += `\nEdge Cases:\n${f.edgeCases.map(e => `- ${e}`).join('\n')}`;
    if (f.dependencies?.length) text += `\nDependencies: ${f.dependencies.join(', ')}`;
    return text;
  }).join('\n\n---\n\n');

  const userMessage = `Generate story files based on:

FEATURES:
${featuresFormatted}

DATABASE_SCHEMA:
${(databaseSchema || '').substring(0, 2000)}

API_ENDPOINTS:
${(apiEndpoints || '').substring(0, 2000)}

COMPONENT_TREE:
${(componentTree || '').substring(0, 2000)}

PRD:
${(prd || '').substring(0, 2000)}

Requirements:
- One story file per feature (complex features may become 2-3 stories)
- Group related features into epics
- Each story must be independently implementable
- Reference spec docs (NO inline code examples!)
- Include MCP usage instructions per story
- Include validation checkpoints
- **PRD Traceability**: Link each story to specific PRD FR/NFR numbers
- **Security Requirements**: Every story needs explicit security section
- **Architectural Decisions**: Explain WHY architectural choices were made
- **Research Validation**: Include relevant quotes from original research`;

  try {
    const config = MODEL_CONFIGS.storyFiles;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);
    const parsed = parseJSON(content);

    if (parsed?.stories) {
      return {
        success: true,
        stories: parsed.stories,
        epicSummary: parsed.epicSummary || {},
        implementationOrder: parsed.implementationOrder || [],
        totalComplexity: parsed.totalComplexity || '',
        _meta: {
          model: usage.model,
          tokens: usage.totalTokens,
          cost: usage.cost.total,
          timestamp: new Date().toISOString(),
        },
      };
    }
    throw new Error('Failed to parse stories');
  } catch (error) {
    console.error('Story generation error:', error);
    throw error;
  }
}

// ============================================================================
// DESIGN BRIEF GENERATION - Specific, non-generic UI/UX direction
// ============================================================================
export async function generateDesignBrief(research, insights, features, productContext) {
  const systemPrompt = `You are a senior product designer who creates SPECIFIC design briefs that prevent AI coding agents from generating generic, soulless UI.

Your job: Generate a design brief with concrete visual direction, design tokens, and component patterns. NO GENERIC TERMS like "modern", "clean", "minimal", "professional".

CRITICAL ANTI-PATTERNS TO AVOID:
- "Clean and modern design" (meaningless)
- "Professional look and feel" (says nothing)
- "User-friendly interface" (obviously)
- "Intuitive navigation" (empty phrase)
- Generic blue/purple gradients everyone uses
- Stock photo aesthetics
- Cookie-cutter SaaS layouts

WHAT MAKES DESIGN SPECIFIC:
- Named visual references: "Stripe's dense data tables", "Linear's command palette", "Notion's block-based editing"
- Exact color values with reasoning: "#0A0A0B background - near-black for reduced eye strain"
- Specific typography: "Inter 14px/1.5 for body, 600 weight for emphasis, tabular nums for data"
- Concrete component behaviors: "Toast notifications slide in from bottom-right, auto-dismiss after 4s, stack up to 3"
- Emotional tone with examples: "Confident but not aggressive - like Vercel, not like enterprise software"

Respond with JSON:
{
  "visualIdentity": {
    "moodDescription": "2-3 sentences describing the exact feeling (with reference examples)",
    "designPhilosophy": "One sentence core principle",
    "references": [
      {
        "product": "Product name",
        "whatToTake": "Specific element to reference",
        "whatToAvoid": "What NOT to copy from them"
      }
    ],
    "antiPatterns": ["Specific things to NEVER do in this design"]
  },
  "designTokens": {
    "colors": {
      "background": { "value": "#hex", "usage": "where and why" },
      "backgroundSubtle": { "value": "#hex", "usage": "where and why" },
      "foreground": { "value": "#hex", "usage": "where and why" },
      "foregroundMuted": { "value": "#hex", "usage": "where and why" },
      "primary": { "value": "#hex", "usage": "where and why" },
      "primaryHover": { "value": "#hex", "usage": "where and why" },
      "accent": { "value": "#hex", "usage": "where and why" },
      "border": { "value": "#hex", "usage": "where and why" },
      "error": { "value": "#hex", "usage": "where and why" },
      "success": { "value": "#hex", "usage": "where and why" }
    },
    "typography": {
      "fontFamily": "Font name with fallbacks",
      "scale": {
        "xs": "size/lineHeight for small text",
        "sm": "size/lineHeight for secondary text",
        "base": "size/lineHeight for body",
        "lg": "size/lineHeight for emphasis",
        "xl": "size/lineHeight for headings",
        "2xl": "size/lineHeight for page titles"
      },
      "weights": "Which weights to use and when"
    },
    "spacing": {
      "unit": "base unit in px",
      "scale": "multipliers used (e.g., 4, 8, 12, 16, 24, 32, 48)"
    },
    "radius": {
      "sm": "value and usage",
      "md": "value and usage",
      "lg": "value and usage",
      "full": "value and usage"
    },
    "shadows": {
      "subtle": "shadow value and usage",
      "medium": "shadow value and usage",
      "strong": "shadow value and usage"
    }
  },
  "componentPatterns": {
    "buttons": {
      "primary": "Exact styling and behavior",
      "secondary": "Exact styling and behavior",
      "ghost": "Exact styling and behavior",
      "states": "Hover, active, disabled, loading behaviors"
    },
    "inputs": {
      "default": "Styling, focus state, placeholder behavior",
      "error": "How errors are shown",
      "sizes": "Available sizes and when to use each"
    },
    "cards": {
      "default": "Border, shadow, padding, hover behavior",
      "interactive": "How clickable cards indicate affordance"
    },
    "feedback": {
      "loading": "Skeleton vs spinner vs progress - when to use each",
      "empty": "How to handle empty states (illustration style, copy tone)",
      "error": "Error message styling and positioning",
      "success": "Success confirmation approach"
    },
    "navigation": {
      "pattern": "Sidebar, topbar, or hybrid - with specifics",
      "activeState": "How current page/section is indicated",
      "transitions": "Page transition approach"
    }
  },
  "interactionPatterns": {
    "animations": {
      "duration": "Default duration and easing",
      "microInteractions": "Specific micro-interactions to include",
      "pageTransitions": "How pages/views transition"
    },
    "feedback": {
      "clickFeedback": "How clicks are acknowledged",
      "hoverStates": "What changes on hover",
      "focusRing": "Focus indicator style for accessibility"
    }
  },
  "responsiveApproach": {
    "breakpoints": "Specific breakpoints and what changes",
    "mobileFirst": "Key differences in mobile layout",
    "touchTargets": "Minimum touch target sizes"
  },
  "accessibilityRequirements": {
    "contrastRatio": "Minimum ratio",
    "focusManagement": "Tab order and focus trap rules",
    "screenReader": "ARIA patterns to follow",
    "motionSensitivity": "prefers-reduced-motion handling"
  },
  "contentGuidelines": {
    "toneOfVoice": "How the UI speaks (with examples)",
    "microcopy": {
      "buttons": "Examples of button text patterns",
      "errors": "How to write error messages",
      "empty": "Empty state copy approach"
    }
  }
}

IMPORTANT: Every value must be SPECIFIC. No placeholders, no "TBD", no generic options.`;

  const featuresFormatted = features.map(f => `- ${f.name}: ${f.description}`).join('\n');
  const insightsSummary = typeof insights === 'object'
    ? Object.entries(insights).map(([key, values]) => {
        if (Array.isArray(values)) return `${key}:\n${values.slice(0, 3).map(v => `  - ${v}`).join('\n')}`;
        return `${key}: ${values}`;
      }).join('\n\n')
    : String(insights);

  const userMessage = `Create a SPECIFIC design brief for this product. No generic terms.

PRODUCT CONTEXT:
${productContext || 'A new product based on the research provided'}

TARGET USERS (from research):
${insightsSummary.substring(0, 1500)}

KEY FEATURES:
${featuresFormatted}

RESEARCH HIGHLIGHTS:
${research.substring(0, 1500)}

Generate a design brief with:
1. Specific visual references (name real products to learn from)
2. Exact color values in hex
3. Precise typography specs
4. Concrete component behaviors
5. Anti-patterns to explicitly avoid

Remember: "Clean and modern" is banned. Be SPECIFIC.`;

  try {
    const config = MODEL_CONFIGS.designBrief;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);
    const parsed = parseJSON(content);

    if (parsed) {
      return {
        success: true,
        designBrief: parsed,
        _meta: {
          model: usage.model,
          tokens: usage.totalTokens,
          cost: usage.cost.total,
          timestamp: new Date().toISOString(),
        },
      };
    }
    throw new Error('Failed to parse design brief');
  } catch (error) {
    console.error('Design brief generation error:', error);
    throw error;
  }
}

// ============================================================================
// EXPORT CHAT/IDEATION - Refine outputs through conversation
// ============================================================================
export async function chatWithExport(message, context) {
  const { research, insights, features, prd, designBrief, stories, currentFocus } = context;

  const systemPrompt = `You are a senior product strategist and design lead helping refine product documentation for AI coding agents.

The user is on the Export step of IdeaForge and wants to improve their outputs. They may ask about:
- PRD refinements (Functional/Non-Functional Requirements)
- Design brief adjustments (colors, typography, patterns)
- Story file improvements (acceptance criteria, tasks)
- Agent prompt optimization (Claude, Cursor, Gemini)
- General ideation and suggestions

YOUR CAPABILITIES:
1. **Suggest specific improvements** - Don't be vague. Give exact changes.
2. **Generate updated sections** - If they ask to change something, provide the new version.
3. **Explain trade-offs** - Help them understand design decisions.
4. **Ideate new features** - If they want to brainstorm, be creative but practical.
5. **Optimize for AI agents** - Know what makes prompts effective for Claude/Cursor/Gemini.

RESPONSE FORMAT:
- Be conversational but efficient
- Use markdown for structure
- When suggesting changes, show the BEFORE and AFTER
- If generating new content, format it ready to copy
- Keep responses focused - don't ramble

CURRENT CONTEXT:
${currentFocus ? `User is currently focused on: ${currentFocus}` : 'User is exploring export options'}

${prd ? `PRD Summary (first 500 chars): ${prd.substring(0, 500)}...` : 'No PRD generated yet'}

${designBrief ? `Design Brief available with ${Object.keys(designBrief).length} sections` : 'No design brief generated yet'}

${stories?.length ? `${stories.length} story files generated` : 'No stories generated yet'}

${features?.length ? `${features.length} features accepted` : 'No features accepted'}`;

  const userMessage = `${message}

---
Research context (abbreviated): ${(research || '').substring(0, 800)}

Features: ${(features || []).map(f => f.name).join(', ')}`;

  try {
    const config = MODEL_CONFIGS.chatWithExport;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);
    return {
      success: true,
      response: content,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Export chat error:', error);
    throw error;
  }
}

// ============================================================================
// DESIGN SYSTEM CHAT - Conversational design token editing
// ============================================================================
export async function chatWithDesignBrief(message, designBrief) {
  const systemPrompt = `You are a design system editor AI. Parse user requests to update design tokens in a design brief JSON.

Your job: Understand conversational requests about design changes and return updated design tokens.

SUPPORTED EDITS:
1. **Color changes**
   - "make primary darker" → reduce lightness by 15-20%
   - "more saturated blue" → increase saturation
   - "use a warmer palette" → shift to oranges/reds
   - "change background to off-white" → update background color

2. **Typography changes**
   - "use a serif font" → change fontFamily to serif stack
   - "bigger headings" → increase heading scale values
   - "tighter line spacing" → reduce line-height values

3. **Spacing changes**
   - "more spacious" → increase spacing scale values
   - "tighter layout" → reduce spacing scale
   - "bigger padding" → increase spacing unit

4. **Component style changes**
   - "more rounded corners" → increase border radius values
   - "softer shadows" → reduce shadow intensity
   - "remove shadows" → set all shadows to 'none'

5. **Mood/personality changes**
   - "feel more playful" → suggest brighter colors, rounder corners, looser spacing
   - "more professional" → suggest neutral colors, cleaner typography, tighter spacing

RESPONSE FORMAT:
Return JSON with:
{
  "changes": [
    {
      "path": "designTokens.colors.primary.value",
      "from": "#6B8AFF",
      "to": "#4A5FD9",
      "reasoning": "Reduced lightness by 20% for darker, more saturated blue"
    }
  ],
  "updatedBrief": { ...full updated design brief... },
  "preview": "Updated primary color from light blue to deeper blue. This gives a more confident, professional feel while maintaining the cool palette."
}

IMPORTANT:
- Make SPECIFIC changes based on user request
- Always include reasoning for each change
- Update the FULL design brief, not just changed tokens
- If request is unclear, suggest options in preview
- Maintain consistency across design tokens (e.g., if changing colors, update all related shades)

CURRENT DESIGN BRIEF:
${JSON.stringify(designBrief, null, 2)}`;

  const userMessage = message;

  try {
    const config = MODEL_CONFIGS.refineFeatures; // Use SPEED tier (Gemini 2.5 Flash Lite)
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    // Parse JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || content.match(/\`\`\`\n([\s\S]*?)\n\`\`\`/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, return error
      return {
        success: false,
        error: 'Failed to parse AI response as JSON',
        rawResponse: content,
      };
    }

    return {
      success: true,
      changes: parsedResponse.changes || [],
      updatedBrief: parsedResponse.updatedBrief || designBrief,
      preview: parsedResponse.preview || 'Design system updated.',
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Design chat error:', error);
    throw error;
  }
}

// ============================================================================
// DESIGN BRIEF REGENERATION - Update design brief based on edited tokens
// ============================================================================
export async function regenerateDesignBrief(editedDesignBrief, originalDesignBrief = null) {
  // Detect what changed between original and edited versions
  let changesSummary = "User has edited design tokens.";
  if (originalDesignBrief?.designTokens && editedDesignBrief?.designTokens) {
    const changes = [];

    // Check for color changes
    const origColors = originalDesignBrief.designTokens.colors || {};
    const editColors = editedDesignBrief.designTokens.colors || {};
    for (const key in editColors) {
      if (origColors[key]?.value !== editColors[key]?.value) {
        changes.push(`- ${key} color changed from ${origColors[key]?.value} to ${editColors[key]?.value}`);
      }
    }

    // Check for typography changes
    const origTypo = originalDesignBrief.designTokens.typography?.fontFamilies || {};
    const editTypo = editedDesignBrief.designTokens.typography?.fontFamilies || {};
    for (const key in editTypo) {
      if (origTypo[key]?.value !== editTypo[key]?.value) {
        changes.push(`- ${key} font changed from ${origTypo[key]?.value} to ${editTypo[key]?.value}`);
      }
    }

    if (changes.length > 0) {
      changesSummary = "SPECIFIC CHANGES THE USER MADE:\n" + changes.join('\n');
    }
  }

  const systemPrompt = `You are a senior product designer regenerating a design brief to match user-edited design tokens.

${changesSummary}

Your job: Update ALL sections of the design brief to reflect these specific changes while keeping the edited token values exactly as-is.

WHAT YOU MUST UPDATE:
1. **Visual Identity** - Completely rewrite mood and philosophy to match the NEW color palette and fonts
2. **Component Patterns** - Update ALL button/input/card styles to use the NEW token values
3. **Interaction Patterns** - Adjust hover/focus states to match NEW colors
4. **Design References** - Update product comparisons to match the NEW aesthetic
5. **Accessibility** - Recalculate contrast ratios for NEW colors

CRITICAL RULES:
- DO NOT just copy the input - you must ACTIVELY UPDATE descriptions to match the new tokens
- If primary color changed, completely rewrite the mood description
- Update component pattern hex values to use the new color tokens
- Update ALL references to colors, fonts, sizes in component patterns
- Be specific about the aesthetic shift (e.g., "from professional blue to energetic purple")

EDITED DESIGN BRIEF TO REGENERATE:
${JSON.stringify(editedDesignBrief, null, 2)}

Respond ONLY with a complete JSON design brief that has been FULLY UPDATED to reflect the new tokens.`;

  const userMessage = `Regenerate this design brief with ALL sections updated to match the edited tokens. This is not a copy job - you must actively update visual identity, component patterns, and references to reflect the new aesthetic created by the token changes.`;

  try {
    const config = MODEL_CONFIGS.prd; // Use MAX tier for critical specifications
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    // Parse JSON response
    let parsedBrief;
    try {
      const jsonMatch = content.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || content.match(/\`\`\`\n([\s\S]*?)\n\`\`\`/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedBrief = JSON.parse(jsonString);
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse regenerated design brief as JSON',
        rawResponse: content,
      };
    }

    return {
      success: true,
      designBrief: parsedBrief,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Design brief regeneration error:', error);
    throw error;
  }
}

// ============================================================================
// TEMPLATE INSPIRATION - Screenshot analysis and generation
// ============================================================================

// Vision-capable AI call for image analysis
async function callOpenRouterVision(systemPrompt, userMessage, imageBase64, config) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in .env');
  }

  const model = config.primary;
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  // Build messages with image content
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: systemPrompt + '\n\n' + userMessage
        },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64, // Should be data:image/jpeg;base64,... format
            detail: 'high' // High detail for better analysis
          }
        }
      ]
    }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ideaforge.app',
      'X-Title': 'IdeaForge',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config.maxTokens || 4000,
      temperature: config.temperature ?? 0.5,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`OpenRouter Vision API error: ${data.error?.message || response.statusText}`);
  }

  const content = data.choices[0].message.content;
  const usage = data.usage || {};

  // Calculate cost
  const cost = calculateCost(
    model,
    usage.prompt_tokens || 0,
    usage.completion_tokens || 0
  );

  console.log(`[AI] ✓ ${model} (vision)`);
  console.log(`[AI]   Input: ${usage.prompt_tokens || 0} tokens (${formatCost(cost.input)}) | Output: ${usage.completion_tokens || 0} tokens (${formatCost(cost.output)}) | Total: ${formatCost(cost.total)}`);

  return {
    content,
    usage: {
      model,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      cost,
    },
  };
}

// Analyze design screenshot with Gemini Flash 3 vision
export async function analyzeDesignScreenshot(imageBase64, userNotes = '') {
  const systemPrompt = `You are a senior UI/UX designer analyzing a design screenshot.

Extract the following information and return ONLY valid JSON (no markdown, no code blocks, just pure JSON):

{
  "layout": "Describe layout structure (e.g., 'sidebar-left + top-nav + 3-column-grid')",
  "components": ["List component types", "e.g. metric cards", "data table", "line chart", "navigation menu"],
  "colorPalette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "background": "#HEX",
    "text": "#HEX"
  },
  "typography": {
    "style": "Sans-serif / Serif / Monospace",
    "weight": "Light / Regular / Medium / Bold",
    "feel": "Modern, clean, professional"
  },
  "spacing": "Compact / Balanced / Generous",
  "mood": "Professional / Playful / Minimal / Bold / Elegant / Data-dense / Creative",
  "patterns": ["List UI patterns", "e.g. Hover lift effect", "Icon buttons", "Rounded corners", "Card shadows"],
  "category": "dashboard / landing / settings / admin / ecommerce / portfolio / blog",
  "referenceProducts": ["Similar to...", "e.g. Linear", "Stripe", "Notion", "Figma"],
  "gridSystem": "12-column / Flexbox / CSS Grid / Custom",
  "responsiveness": "Desktop-first / Mobile-first / Responsive"
}

Be specific and detailed. Extract exact hex colors from the image if visible. Identify all major components.`;

  const userMessage = userNotes
    ? `User notes about this design: "${userNotes}"\n\nAnalyze this UI design screenshot in detail.`
    : 'Analyze this UI design screenshot in detail. Be specific about layout, colors, and components.';

  try {
    const config = MODEL_CONFIGS.templateVision; // Gemini 3 Flash with vision
    console.log(`[AI] Calling vision model: ${config.primary}`);

    const { content, usage } = await callOpenRouterVision(systemPrompt, userMessage, imageBase64, config);

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON from various formats
      let jsonString = content.trim();

      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[0];
      }

      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse vision analysis:', parseError);
      console.error('Raw content:', content);
      return {
        success: false,
        error: 'Failed to parse design analysis. AI did not return valid JSON.',
        rawResponse: content
      };
    }

    return {
      success: true,
      analysis,
      cost: usage.cost.total,
      model: usage.model,
      tokens: usage.totalTokens
    };
  } catch (error) {
    console.error('Vision analysis error:', error);

    // Try fallback model (Claude vision) if Gemini fails
    if (error.message.includes('terminated') || error.message.includes('failed') || error.message.includes('timeout')) {
      console.log('[AI] Primary vision model failed, trying fallback...');
      try {
        const fallbackConfig = {
          ...MODEL_CONFIGS.templateVision,
          primary: MODEL_CONFIGS.templateVision.fallback
        };
        const { content, usage } = await callOpenRouterVision(systemPrompt, userMessage, imageBase64, fallbackConfig);

        let analysis;
        let jsonString = content.trim();
        const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[1] || jsonMatch[0];
        }
        analysis = JSON.parse(jsonString);

        return {
          success: true,
          analysis,
          cost: usage.cost.total,
          model: usage.model + ' (fallback)',
          tokens: usage.totalTokens
        };
      } catch (fallbackError) {
        console.error('Fallback vision model also failed:', fallbackError);
        throw new Error('Both primary and fallback vision models failed: ' + fallbackError.message);
      }
    }

    throw error;
  }
}

// ============================================================================
// GENERATE FROM TEMPLATE - Apply user's design tokens to template structure
// ============================================================================
export async function generateFromTemplate(templateAnalysis, designBrief, pageType = 'dashboard') {
  console.log(`[TEMPLATE] Generating ${pageType} from template structure`);

  const systemPrompt = `You are generating a ${pageType} UI based on a template structure analysis.

TEMPLATE STRUCTURE TO FOLLOW:
${JSON.stringify(templateAnalysis, null, 2)}

USER'S DESIGN BRIEF (apply these tokens):
- Primary Color: ${designBrief.designTokens?.colors?.primary?.value || '#6366F1'}
- Secondary Color: ${designBrief.designTokens?.colors?.secondary?.value || '#8B5CF6'}
- Accent Color: ${designBrief.designTokens?.colors?.accent?.value || '#10B981'}
- Background: ${designBrief.designTokens?.colors?.background?.value || '#09090B'}
- Font Family: ${designBrief.designTokens?.typography?.fontFamilies?.primary?.value || 'Inter'}
- Brand Mood: ${designBrief.visualIdentity?.mood || 'Professional and modern'}
- Product Name: ${designBrief.projectOverview?.productName || 'Your Product'}

CRITICAL REQUIREMENTS:
1. **KEEP** the template's layout structure (${templateAnalysis.layout || 'grid-based layout'})
2. **KEEP** the template's component types (${(templateAnalysis.components || []).join(', ')})
3. **APPLY** user's colors - replace template palette with user's exact hex codes
4. **APPLY** user's font family
5. **MATCH** user's brand mood in content/copy
6. **USE** the template's patterns (${(templateAnalysis.patterns || []).join(', ')})
7. **MATCH** the template's spacing style (${templateAnalysis.spacing || 'balanced'})

OUTPUT REQUIREMENTS:
- Return ONLY production-ready HTML with inline CSS (single self-contained file)
- Use user's exact color values from design brief
- Maintain template's grid system (${templateAnalysis.gridSystem || 'CSS Grid'})
- Apply template's responsiveness approach (${templateAnalysis.responsiveness || 'responsive'})
- Keep layout proportions from template screenshot
- Replace all placeholder content with product-specific copy
- NO comments, NO explanations, ONLY the HTML code

The output should look like the template structure but feel like the user's brand.`;

  const userMessage = `Generate a ${pageType} page following the template structure but with my design tokens.`;

  try {
    const config = MODEL_CONFIGS.expandHomepage; // Claude Sonnet for quality
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    // Extract HTML from response
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const html = htmlMatch ? htmlMatch[1] : content;

    console.log(`[TEMPLATE] ✓ Generated from template (${usage.totalTokens} tokens, $${usage.cost.total.toFixed(4)})`);

    return {
      success: true,
      html,
      templateUsed: templateAnalysis.category || 'custom',
      cost: usage.cost.total,
      tokens: usage.totalTokens,
      model: usage.model,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[TEMPLATE] Generation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate from template',
    };
  }
}

// ============================================================================
// PROMPT GENERATION - Agent-specific coding instructions
// ============================================================================
export async function generatePrompt(format, research, insights, features, prd, designBrief, options = {}) {
  // Detect and load relevant skills
  const skillsBundle = buildSkillsBundle(
    { research, features, prd },
    'quick-start' // Use quick-start for concise patterns
  );

  const featuresFormatted = (features || []).map(f => {
    let text = `### ${f.name}`;
    if (f.userStory) text += `\n${f.userStory}`;
    text += `\n${f.description}`;
    if (f.acceptanceCriteria?.length) {
      text += `\n\nAcceptance Criteria:\n${f.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}`;
    }
    return text;
  }).join('\n\n');

  const formatPrompts = {
    claude: `You are an expert at writing executable instructions for Claude Code.

Create a CLAUDE.md that is ACTIONABLE, SPECIFIC, and EXECUTABLE - not generic boilerplate.

CRITICAL REQUIREMENTS:
1. Include EXACT commands Claude can run
2. Provide REAL code examples (not placeholders like [X])
3. Specify file paths and structure
4. Include validation steps after each phase
5. Reference actual features from the PRD

STRUCTURE:
\`\`\`markdown
# [Specific Project Name from Research]

> **Project Type:** [Web App | Mobile App | API | etc.]
> **Target Launch:** MVP in [timeframe if mentioned]
> **Primary User:** [Specific user from research]

---

## 📋 What We're Building

[2-3 sentences describing the SPECIFIC product, not generic descriptions]

**Core Value Proposition:**
[The ONE thing this product does better than alternatives - quote from research if possible]

**Success Metric:**
[How we'll know if this succeeded - from research or implied]

---

## 🎯 Features to Implement

[For EACH feature from the PRD, create a section like this:]

### Feature: [Exact Feature Name from PRD]

**User Story:** [Exact user story from features]

**What It Does:**
[Specific 2-3 sentence description from the feature]

**Acceptance Criteria:**
[Copy exact criteria from features - these are testable!]
- [ ] [Criterion 1 - must be specific and testable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Implementation Checklist:**
- [ ] Create [specific file path]
- [ ] Install [exact npm package]
- [ ] Configure [specific setting]
- [ ] Test [specific scenario]

**Edge Cases to Handle:**
[List actual edge cases from the feature definition]

**Dependencies:**
[List what must exist before building this - from feature dependencies]

---

## 🏗️ PHASE 1: Project Setup & Environment

### Step 1.1: Initialize Project

\\\`\\\`\\\`bash
# Create project directory
mkdir [project-name]
cd [project-name]

# Initialize with [specific framework - e.g., Next.js 14, Vite + React, etc.]
[EXACT initialization command - e.g., npx create-next-app@latest . --typescript --tailwind --app]

# Install core dependencies
npm install [list EXACT packages needed]

# Install dev dependencies
npm install -D [exact dev packages]
\\\`\\\`\\\`

**Validation:**
\\\`\\\`\\\`bash
# Verify setup
npm run dev
# Should start on http://localhost:[port]
# You should see: [what the default page shows]
\\\`\\\`\\\`

### Step 1.2: Environment Configuration

Create \`.env.local\` with:
\\\`\\\`\\\`env
# [Service Name - e.g., Stripe]
[EXACT_ENV_VAR_NAME]=[placeholder with instructions]
# Get from: [exact URL to get the key]

# [Next service]
[NEXT_ENV_VAR]=...
\\\`\\\`\\\`

**Security Check:**
- [ ] \`.env.local\` is in \`.gitignore\`
- [ ] No hardcoded secrets in code
- [ ] Environment variables validated on startup

### Step 1.3: Project Structure

Create this EXACT structure:
\\\`\\\`\\\`
[project-root]/
├── src/
│   ├── app/                  # [or pages/ if Next.js Pages Router]
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── [feature]/        # Feature routes
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   └── [domain]/         # Feature-specific components
│   ├── lib/
│   │   ├── [integration].ts  # E.g., stripe.ts, firebase.ts
│   │   └── utils.ts          # Helper functions
│   └── types/
│       └── index.ts          # TypeScript types
├── public/
└── [config files]
\\\`\\\`\\\`

**Create structure:**
\\\`\\\`\\\`bash
mkdir -p src/{app,components/ui,lib,types}
touch src/lib/utils.ts
touch src/types/index.ts
\\\`\\\`\\\`

---

## 🏗️ PHASE 2: Core Implementation

[For EACH feature, in order of dependencies:]

### Implement: [Feature Name]

**Build Order:**
1. [Specific file or component] - [why first]
2. [Next file] - [why second]
3. [Integration point] - [why third]

**Step 2.X.1: [Component/Function Name]**

Create \`src/[exact/file/path].tsx\`:
\\\`\\\`\\\`typescript
// ACTUAL CODE EXAMPLE (not pseudocode!):
// Show the component structure, imports, props, etc.
// Use REAL patterns from the tech stack

[Provide actual starter code with:]
- Exact imports
- Component structure
- Props interface
- Key logic (not full implementation, but real patterns)
- Error handling skeleton
\\\`\\\`\\\`

**Step 2.X.2: [Integration Name]**

[If this feature needs Stripe/Firebase/etc, show EXACT integration code]

\\\`\\\`\\\`typescript
// src/lib/[service].ts
import { ... } from '[exact package]';

export const [serviceName] = {
  // Real initialization code
  // Real helper functions
  // Real error handling
};
\\\`\\\`\\\`

**Validation:**
\\\`\\\`\\\`bash
# Test this feature
npm run dev
# Navigate to [exact URL]
# You should see: [exact behavior]
# Test scenario: [exact steps]
\\\`\\\`\\\`

**Acceptance Criteria Check:**
- [ ] [Criterion 1 from feature] ✓ or ✗
- [ ] [Criterion 2] ✓ or ✗

---

## 🧪 PHASE 3: Testing & Validation

### Unit Tests

\\\`\\\`\\\`bash
# Install testing dependencies
npm install -D [exact testing packages]
\\\`\\\`\\\`

### Integration Tests

[Specific tests for integrations - Stripe checkout, Firebase auth, etc.]

\\\`\\\`\\\`typescript
// tests/integration/[feature].test.ts
// Real test structure
\\\`\\\`\\\`

### Manual Testing Checklist

[For each feature:]
- [ ] [Feature name]: [exact test scenario]
  - Navigate to [URL]
  - Perform [action]
  - Expect [result]

---

## 🚀 PHASE 4: Deployment Preparation

### Build Verification

\\\`\\\`\\\`bash
npm run build
# Should complete without errors
# Check output: [what to look for]
\\\`\\\`\\\`

### Pre-Deploy Checklist

- [ ] All features pass acceptance criteria
- [ ] No console errors or warnings
- [ ] Environment variables documented in README
- [ ] [Integration] tested in test mode
- [ ] Performance: Pages load < 2s

### Deployment Steps

\\\`\\\`\\\`bash
# [Specific deployment command for platform - Vercel, Netlify, etc.]
[exact commands]
\\\`\\\`\\\`

---

## 🎯 Success Criteria

This project is complete when:
- [ ] All features meet their acceptance criteria
- [ ] [Specific success metric from research]
- [ ] User can [complete specific workflow from features]
- [ ] No critical bugs or errors
- [ ] Deployed and accessible

---

## ⚠️ Critical Constraints

**DO NOT:**
- Build features not in the PRD (scope creep)
- Use deprecated packages or patterns
- Hardcode API keys or secrets
- Skip error handling for [critical flows]

**DEFER to v2:**
[List features that should wait - from research]

---

## 🔌 MCP Servers Setup (Claude Code Enhancement)

MCP servers give Claude Code access to real-time documentation and integrations. Install these **before** starting implementation:

### Install Context7 (Documentation Access)
\\\`\\\`\\\`bash
# Install context7 MCP for latest docs
claude mcp add context7 -- npx -y @upstash/context7-mcp

# Verify installation
claude mcp list
# Should show: context7 - active
\\\`\\\`\\\`

**Usage in Claude Code:**
\\\`\\\`\\\`typescript
// When you need latest docs, Claude will automatically use context7
// Example: "Use context7 to get latest Next.js App Router docs"
// Claude will fetch current documentation and use it
\\\`\\\`\\\`

### Install Integration MCPs (Based on Project)

[If Stripe detected:]
**Stripe MCP:**
\\\`\\\`\\\`bash
# Install Stripe MCP
claude mcp add stripe -- npx -y @stripe/mcp

# Set Stripe API key
export STRIPE_API_KEY=sk_test_...
# Or add to ~/.claude/mcp.json config

# Verify
claude mcp list
# Should show: stripe - active
\\\`\\\`\\\`

[If Firebase detected:]
**Firebase MCP:**
\\\`\\\`\\\`bash
# Install Firebase MCP
claude mcp add firebase -- npx -y @firebase/mcp

# Login to Firebase
firebase login

# Verify
claude mcp list
# Should show: firebase - active
\\\`\\\`\\\`

### Why Use MCPs?

**Without MCP:**
- Claude uses knowledge cutoff (Jan 2025)
- Documentation may be outdated
- Manual copy-paste from docs

**With MCP:**
- ✅ Real-time documentation (always current)
- ✅ Claude fetches latest API changes
- ✅ Faster, more accurate code generation

### MCP Commands Reference

\\\`\\\`\\\`bash
# List installed MCPs
claude mcp list

# Remove an MCP
claude mcp remove [name]

# Restart MCP server
claude mcp restart [name]
\\\`\\\`\\\`

---

## 🎯 Claude Agent Skills Setup (Recommended)

Your export includes **Claude Agent Skills** - reusable capabilities that Claude automatically uses when relevant.

### What are Skills?

Skills are model-invoked capabilities that extend Claude's knowledge. When you install Skills in your \`~/.claude/skills/\` directory, Claude autonomously decides when to use them based on your requests.

### Install Your Project Skills

Your export includes these Skills (in separate .md files):
[List detected skills - e.g., nextjs-app-router-SKILL.md, stripe-billing-SKILL.md]

**Installation:**
\\\`\\\`\\\`bash
# Option 1: Install globally (available for all projects)
mkdir -p ~/.claude/skills/
cp nextjs-app-router-SKILL.md ~/.claude/skills/nextjs-app-router/SKILL.md
cp stripe-billing-SKILL.md ~/.claude/skills/stripe-billing/SKILL.md
# Repeat for each skill file

# Option 2: Install per-project (team-shared via git)
mkdir -p .claude/skills/
cp nextjs-app-router-SKILL.md .claude/skills/nextjs-app-router/SKILL.md
cp stripe-billing-SKILL.md .claude/skills/stripe-billing/SKILL.md
# Commit to git so team members get them automatically
\\\`\\\`\\\`

**Verify Installation:**
\\\`\\\`\\\`bash
# Restart Claude Code to load Skills
# Then ask Claude:
"What Skills are available?"

# You should see your installed Skills listed
\\\`\\\`\\\`

### How Skills Work

**Without Skills:** You manually provide integration patterns in every conversation

**With Skills:** Claude automatically knows how to implement integrations
- Mention "Next.js" → nextjs-app-router Skill activates
- Mention "Stripe" → stripe-billing Skill activates
- Mention "Firebase" → firebase-auth Skill activates

**Benefits:**
- ✅ No repetitive prompting for common patterns
- ✅ Always use best practices (Skills contain vetted patterns)
- ✅ Consistent across your team (project Skills shared via git)
- ✅ Progressive disclosure (Claude loads details only when needed)

### Skills vs MCP Servers

| Feature | Skills | MCP Servers |
|---------|--------|-------------|
| **Purpose** | Knowledge & patterns | Real-time API access |
| **Invocation** | Model-invoked (automatic) | Tool-based (on-demand) |
| **Example** | "Use Next.js App Router patterns" | "Fetch latest Next.js docs" |
| **Use Together** | ✅ Skills reference MCP for latest docs | ✅ MCP provides data for Skills |

**Recommended:** Install both Skills AND MCPs for best results.

---

## 📚 Reference

**Key Documentation:**
- [Framework]: Use context7 to get latest docs
- [Integration 1]: Use context7 to get [package] docs
- [Integration 2]: Use [MCP] to verify configuration

**Common Patterns:**
[If Skills Library detected integrations, reference them]
\\\`\\\`\\\`typescript
// Pattern: [Name]
// See: [skill file if applicable]
\\\`\\\`\\\`

\\\`\\\`\\\`

REMEMBER:
- Replace ALL placeholders with ACTUAL values from the research/features/PRD
- Provide REAL code examples, not pseudocode
- Include EXACT commands Claude can copy-paste
- Make it so specific that Claude knows exactly what to build`,

    cursor: `You are an expert at writing executable Cursor rules that enable Cursor AI to build with precision.

Create a .cursorrules file (MDC format) with ACTIONABLE, SPECIFIC patterns from the actual project.

CRITICAL: Use REAL examples from features/PRD, not generic placeholders.

STRUCTURE:
\`\`\`markdown
---
description: [Exact one-line from research - what this builds]
globs: ["src/**/*.{ts,tsx,js,jsx}", "app/**/*.{ts,tsx}", "components/**/*.tsx", "lib/**/*.ts", "**/*.css"]
alwaysApply: true
---

# [Project Name from Research] - Cursor Rules

## 🎯 Project Mission
[2-3 specific sentences from research about WHAT this solves and FOR WHOM]

**Key Constraint:** [Primary constraint from research - e.g., "Must handle 1000+ concurrent users", "Mobile-first design"]

---

## 🏗️ Architecture Overview

**Stack:**
- Framework: [Exact framework - e.g., Next.js 14 with App Router]
- Language: [TypeScript | JavaScript]
- Styling: [Tailwind CSS | CSS Modules | styled-components]
- State: [Zustand | Redux | Context]
- Backend: [Next.js API Routes | Express | Supabase]
- Database: [PostgreSQL | Firebase | MongoDB]
- Auth: [NextAuth | Firebase Auth | Clerk]

**Key Integrations:**
[List from Skills Library if detected - e.g., Stripe, Firebase, etc.]

---

## 📁 File Structure (EXACT)

\\\`\\\`\\\`
[project-name]/
├── src/
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Protected routes
│   │   ├── api/               # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # Reusable primitives
│   │   ├── [feature]/         # Feature-specific components
│   │   └── providers/         # Context providers
│   ├── lib/
│   │   ├── [service].ts       # E.g., stripe.ts, firebase.ts
│   │   ├── hooks/             # Custom hooks
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
└── .env.local
\\\`\\\`\\\`

---

## 🎨 Component Patterns (REAL Examples)

### Pattern 1: Server Components (Default)
\\\`\\\`\\\`typescript
// app/[feature]/page.tsx
import { [Service] } from '@/lib/[service]';

export default async function [Feature]Page() {
  // Fetch data in Server Component
  const data = await [service].get[Data]();

  return (
    <main>
      <[FeatureComponent] data={data} />
    </main>
  );
}
\\\`\\\`\\\`

### Pattern 2: Client Components (When Interactive)
\\\`\\\`\\\`typescript
'use client';

import { useState } from 'react';
import { use[Feature]Store } from '@/lib/store';

export function [Feature]Component() {
  // 1. State & stores at top
  const { [state], [action] } = use[Feature]Store();
  const [localState, setLocalState] = useState();

  // 2. Derived state
  const [computed] = useMemo(() => ...);

  // 3. Effects
  useEffect(() => { ... }, []);

  // 4. Handlers
  const handleClick = () => { ... };

  // 5. Render
  return <div>...</div>;
}
\\\`\\\`\\\`

### Pattern 3: API Routes
\\\`\\\`\\\`typescript
// app/api/[feature]/route.ts
import { NextResponse } from 'next/server';
import { [service] } from '@/lib/[service]';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate
    if (!body.[field]) {
      return NextResponse.json({ error: 'Missing [field]' }, { status: 400 });
    }

    // Process
    const result = await [service].[action](body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Feature] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
\\\`\\\`\\\`

---

## 🔧 Integration Patterns

[For EACH integration detected (Stripe, Firebase, etc.), provide REAL pattern:]

### [Integration Name - e.g., Stripe]

**Initialization** (\`lib/stripe.ts\`):
\\\`\\\`\\\`typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
\\\`\\\`\\\`

**Usage Pattern**:
\\\`\\\`\\\`typescript
// Creating a checkout session
import { stripe } from '@/lib/stripe';

const session = await stripe.checkout.sessions.create({
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: \`\${origin}/success\`,
  cancel_url: \`\${origin}/cancel\`,
});
\\\`\\\`\\\`

**Environment Variables**:
\\\`\\\`\\\`env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
\\\`\\\`\\\`

---

## 📝 Naming Conventions (Enforced)

**Files:**
- Components: PascalCase - \`FeatureName.tsx\`
- Utilities: camelCase - \`formatCurrency.ts\`
- Routes: kebab-case - \`user-profile/page.tsx\`

**Code:**
- Components: PascalCase - \`export function UserProfile() {}\`
- Hooks: camelCase with "use" - \`useUserData()\`
- Server Actions: camelCase - \`async function updateUser() {}\`
- Types: PascalCase - \`interface UserProfile {}\`

---

## 🚫 Critical Constraints

**DO:**
- ✅ Use Server Components by default
- ✅ Add 'use client' only when needed (interactivity, hooks, browser APIs)
- ✅ Validate ALL user inputs
- ✅ Handle errors with try/catch
- ✅ Use environment variables for secrets
- ✅ Follow the exact patterns above

**DO NOT:**
- ❌ Hardcode API keys or secrets
- ❌ Skip error handling on external calls
- ❌ Use 'any' type (use proper TypeScript types)
- ❌ Build features not in the PRD
- ❌ Make Client Components unnecessarily

---

## 🎯 Feature-Specific Guidance

[For EACH feature from PRD:]

### [Feature Name from PRD]
**User Story:** [Exact story from features]

**Implementation Path:**
1. Create \`[exact file path]\` - [what it does]
2. Add \`[specific function]\` - [what it handles]
3. Connect to \`[integration]\` - [how]

**Acceptance Criteria:**
[Copy from feature definition]

**Edge Cases:**
[List from feature]

---

## 🧪 Testing Checklist

**Before Committing:**
- [ ] No TypeScript errors (\`npm run type-check\`)
- [ ] No ESLint warnings (\`npm run lint\`)
- [ ] Manual test: [specific scenario from feature]
- [ ] Error states handled
- [ ] Loading states shown

---

## 📚 Quick Reference

**Start Dev Server:**
\\\`\\\`\\\`bash
npm run dev
# http://localhost:3000
\\\`\\\`\\\`

**Common Commands:**
\\\`\\\`\\\`bash
npm run build          # Production build
npm run type-check     # TypeScript validation
npm run lint           # ESLint check
\\\`\\\`\\\`

**Environment Setup:**
See \`.env.example\` for required variables.

---

## 🔗 Context

**MCP Servers Available:**
[List detected MCPs - context7, stripe, firebase]

**Skills Loaded:**
[List detected skills from Skills Library]

**When Stuck:**
- Use context7 to fetch latest docs for [framework/library]
- Reference the patterns above
- Check feature acceptance criteria

\\\`\\\`\\\`

REMEMBER:
- Every pattern must be REAL code from the tech stack
- Every path must be EXACT, not \`[placeholder]\`
- Every feature must reference the actual PRD
- Make Cursor feel like it knows THIS specific project intimately`,

    gemini: `You are an expert at writing prompts optimized for Gemini's hierarchical processing and step-by-step execution.

Create a GEMINI.md file with DETAILED, NUMBERED, HIERARCHICAL instructions that Gemini can execute sequentially.

CRITICAL REQUIREMENTS:
1. Every step must be NUMBERED hierarchically (1, 1.1, 1.1.1, etc.)
2. Include EXACT commands Gemini can run
3. Provide REAL code examples with specific imports and patterns
4. Every task must have a VERIFICATION step
5. Structure must be deep - break complex tasks into substeps

STRUCTURE:
\`\`\`markdown
# [Specific Project Name from Research]

> **Project Type:** [Web App | Mobile App | API | CLI Tool]
> **Tech Stack:** [Specific stack from PRD]
> **Primary Goal:** [One sentence from research]
> **Success Metric:** [Specific metric if available]

---

## 📊 Project Overview

### What We're Building
[2-3 specific sentences from research - not generic]

**Problem Being Solved:**
[Quote pain point from research with evidence]

**Target Users:**
[Specific user types from research, not demographics]

**Core Value Proposition:**
[The ONE thing this does better - from research]

**Out of Scope (v1):**
[Features deferred to v2 - from research]

---

## 🏗️ Development Phases

### PHASE 1: Environment Setup & Project Initialization

**Goal:** Create a working development environment with all dependencies installed and verified.

#### 1.1 Project Initialization

**Step 1.1.1: Create Project Directory**
\\\`\\\`\\\`bash
# Create and navigate to project
mkdir [project-name]
cd [project-name]

# Initialize with [specific framework - e.g., Next.js 14, Vite + React]
[EXACT initialization command - e.g.:]
npx create-next-app@latest . --typescript --tailwind --app --src-dir
# OR for Vite:
npm create vite@latest . -- --template react-ts
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Verify project created
ls -la
# You should see: package.json, src/, [framework-specific files]

# Test dev server
npm install
npm run dev
# Should start on http://localhost:[port]
# You should see: [describe default page]
\\\`\\\`\\\`

**Step 1.1.2: Install Core Dependencies**
\\\`\\\`\\\`bash
# Install production dependencies
npm install [list EXACT packages needed for features]
# Example for common integrations:
# npm install @stripe/stripe-js stripe
# npm install firebase
# npm install zustand
# npm install date-fns
# npm install zod

# Install development dependencies
npm install -D [exact dev packages]
# Example:
# npm install -D @types/node
# npm install -D prettier eslint-config-prettier
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Check package.json
cat package.json
# Verify all dependencies are listed

# Test build
npm run build
# Should complete without errors
\\\`\\\`\\\`

**Step 1.1.3: Environment Configuration**

Create \`.env.local\`:
\\\`\\\`\\\`env
# [List ALL environment variables needed]

# [Service 1 - e.g., Stripe]
[EXACT_VAR_NAME]=[where to get it]
# Get your key from: https://dashboard.stripe.com/apikeys

# [Service 2 - e.g., Firebase]
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# Get from: https://console.firebase.google.com/project/[project]/settings/general

# [Database]
DATABASE_URL=
# Format: postgresql://user:password@host:port/database

# [Other services from PRD]
[CONTINUE for all integrations...]
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Check .gitignore includes env files
grep -q ".env" .gitignore && echo "✓ .env gitignored" || echo "✗ Add .env to .gitignore"

# Create env example
cp .env.local .env.example
# Remove actual values, keep variable names
\\\`\\\`\\\`

#### 1.2 Project Structure Setup

**Step 1.2.1: Create Directory Structure**
\\\`\\\`\\\`bash
# Create EXACT directory structure for this project:
mkdir -p src/{app,components/{ui,[feature-name]},lib/{hooks,utils},types,config}

# If using API routes:
mkdir -p src/app/api/[feature-name]

# If using server actions:
mkdir -p src/actions

# If using middleware:
touch src/middleware.ts

# Create initial files
touch src/lib/utils.ts
touch src/types/index.ts
touch src/config/constants.ts
\\\`\\\`\\\`

**Expected Structure:**
\\\`\\\`\\\`
[project-name]/
├── src/
│   ├── app/                     # App Router (Next.js) or pages
│   │   ├── (auth)/             # Route groups
│   │   ├── (dashboard)/
│   │   ├── api/                # API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Reusable components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/
│   │   ├── [integration].ts    # E.g., stripe.ts, firebase.ts
│   │   ├── hooks/              # Custom hooks
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── config/
│       └── constants.ts
├── public/
└── [config files]
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Verify structure
tree src -L 3
# Should match structure above
\\\`\\\`\\\`

**Step 1.2.2: Setup Configuration Files**

Create \`src/config/constants.ts\`:
\\\`\\\`\\\`typescript
// Application constants
export const APP_NAME = '[Project Name]';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// [Feature-specific constants from PRD]
export const [FEATURE_CONSTANT] = '[value]';

// Validation constants
export const MAX_[FIELD]_LENGTH = [number];
export const MIN_[FIELD]_LENGTH = [number];
\\\`\\\`\\\`

Create \`src/lib/utils.ts\`:
\\\`\\\`\\\`typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// [Add utility functions specific to this project]
export function format[DataType](data: [Type]): [ReturnType] {
  // Implementation
}
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Test imports
npx tsc --noEmit
# Should have no errors
\\\`\\\`\\\`

---

### PHASE 2: Core Integrations Setup

[For EACH integration detected from Skills Library or PRD:]

#### 2.[N] [Integration Name - e.g., Stripe Payment Integration]

**Step 2.[N].1: Install Integration SDK**
\\\`\\\`\\\`bash
# Install [integration] packages
npm install [exact-package-name] [exact-package-name-2]
# Example:
# npm install stripe @stripe/stripe-js
\\\`\\\`\\\`

**Step 2.[N].2: Create Integration Client**

Create \`src/lib/[integration].ts\`:
\\\`\\\`\\\`typescript
// REAL CODE for this integration:
import [Package] from '[exact-package-name]';

// Initialize client
export const [clientName] = new [Package](
  process.env.[ENV_VAR_NAME]!,
  {
    apiVersion: '[specific-version]',
    // [Other config specific to this integration]
  }
);

// Helper functions for this project:
export async function [specificFunction]([params]: [Types]) {
  try {
    const result = await [clientName].[method]({
      // Real parameters from PRD features
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[Integration] error:', error);
    return { success: false, error: error.message };
  }
}
\\\`\\\`\\\`

**Step 2.[N].3: Create Type Definitions**

Add to \`src/types/index.ts\`:
\\\`\\\`\\\`typescript
// [Integration] Types
export interface [IntegrationData] {
  [fields from PRD/features]
}

export type [IntegrationStatus] = 'pending' | 'active' | 'failed';
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Test integration initialization
# Create test file:
cat > src/lib/__test-[integration].ts << 'EOF'
import { [clientName] } from './[integration]';
console.log('[Integration] client initialized:', !![clientName]);
EOF

# Run test
npx tsx src/lib/__test-[integration].ts
# Should output: [Integration] client initialized: true

# Clean up test
rm src/lib/__test-[integration].ts
\\\`\\\`\\\`

[Repeat 2.N for each integration: Stripe, Firebase, Database, etc.]

---

### PHASE 3: Feature Implementation

[For EACH feature from PRD, in dependency order:]

#### 3.[N] Feature: [Exact Feature Name from PRD]

**User Story:** [Copy exact user story from features]

**Description:** [Copy description from features]

**Acceptance Criteria:**
[Copy ALL acceptance criteria from features]
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Dependencies:** [List from feature dependencies]

**Implementation Complexity:** [small | medium | large]

---

**Step 3.[N].1: Create Data Layer**

**Sub-step 3.[N].1.1: Define Types**

Add to \`src/types/index.ts\`:
\\\`\\\`\\\`typescript
// [Feature] Types
export interface [FeatureData] {
  id: string;
  [fields specific to this feature from PRD]
  createdAt: Date;
  updatedAt: Date;
}

export interface [FeatureInput] {
  [input fields for creating/updating]
}

export type [FeatureStatus] = [possible statuses from PRD];
\\\`\\\`\\\`

**Sub-step 3.[N].1.2: Create Database Schema (if applicable)**
\\\`\\\`\\\`typescript
// If using Prisma:
// Add to prisma/schema.prisma:
model [FeatureName] {
  id        String   @id @default(cuid())
  [fields]  [Type]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  [relations based on PRD]
}

// If using Firebase:
// Document structure in src/lib/firebase-schema.ts:
export const [featureName]Schema = {
  [field]: '[type - string | number | boolean | timestamp]',
  // [continue for all fields]
};
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# If Prisma:
npx prisma generate
npx prisma db push
# Should create tables without errors

# If Firebase:
# Verify schema exports
npx tsc --noEmit
\\\`\\\`\\\`

**Step 3.[N].2: Create API Layer**

**Sub-step 3.[N].2.1: Create API Route (if using Next.js)**

Create \`src/app/api/[feature]/route.ts\`:
\\\`\\\`\\\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { [integration] } from '@/lib/[integration]';
import { [FeatureInput] } from '@/types';

// GET - Fetch [feature data]
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const [param] = searchParams.get('[param]');

    // Validate input
    if (![param]) {
      return NextResponse.json(
        { error: '[Param] is required' },
        { status: 400 }
      );
    }

    // Fetch from [integration/database]
    const data = await [integration].[method]([param]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Feature] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch [feature]' },
      { status: 500 }
    );
  }
}

// POST - Create/Update [feature]
export async function POST(request: NextRequest) {
  try {
    const body: [FeatureInput] = await request.json();

    // Validate input
    if (!body.[requiredField]) {
      return NextResponse.json(
        { error: '[Field] is required' },
        { status: 400 }
      );
    }

    // Process
    const result = await [integration].[createMethod](body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Feature] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create [feature]' },
      { status: 500 }
    );
  }
}
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Test API endpoint
npm run dev

# In another terminal:
curl -X GET http://localhost:3000/api/[feature]?[param]=[value]
# Should return: {"success":true,"data":{...}}

curl -X POST http://localhost:3000/api/[feature] \\
  -H "Content-Type: application/json" \\
  -d '{"[field]":"[value]"}'
# Should return: {"success":true,"data":{...}}
\\\`\\\`\\\`

**Step 3.[N].3: Create UI Components**

**Sub-step 3.[N].3.1: Create Base Component**

Create \`src/components/[feature]/[Component].tsx\`:
\\\`\\\`\\\`typescript
'use client'; // If interactive

import { useState, useEffect } from 'react';
import { [FeatureData] } from '@/types';

interface [Component]Props {
  [props from feature requirements]
}

export function [Component]({ [props] }: [Component]Props) {
  // 1. State management
  const [data, setData] = useState<[FeatureData][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Data fetching
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/[feature]');
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load [feature]');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 3. Event handlers
  const handle[Action] = async ([params]) => {
    try {
      const response = await fetch('/api/[feature]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([data]),
      });
      const result = await response.json();
      if (result.success) {
        // Update UI
        setData([...data, result.data]);
      }
    } catch (err) {
      setError('Failed to [action]');
    }
  };

  // 4. Render
  if (loading) return <div>Loading [feature]...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="[tailwind-classes]">
      {/* Actual UI implementation based on PRD */}
      <h2>[Feature Title]</h2>
      {data.map(item => (
        <div key={item.id}>
          {/* Render item based on feature specs */}
        </div>
      ))}
    </div>
  );
}
\\\`\\\`\\\`

**Sub-step 3.[N].3.2: Create Supporting Components**
\\\`\\\`\\\`typescript
// If feature needs forms:
// Create src/components/[feature]/[Feature]Form.tsx

// If feature needs modals:
// Create src/components/[feature]/[Feature]Modal.tsx

// If feature needs custom hooks:
// Create src/lib/hooks/use[Feature].ts
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Test component renders
npm run dev
# Navigate to page using component
# Open browser: http://localhost:3000/[route]
# You should see: [expected UI elements]

# Check console for errors:
# Should be: No errors
\\\`\\\`\\\`

**Step 3.[N].4: Integration & Testing**

**Sub-step 3.[N].4.1: Add Component to Page**

Update \`src/app/[route]/page.tsx\`:
\\\`\\\`\\\`typescript
import { [Component] } from '@/components/[feature]/[Component]';

export default function [Route]Page() {
  return (
    <main className="container mx-auto p-4">
      <h1>[Page Title from PRD]</h1>
      <[Component] [props]={[values]} />
    </main>
  );
}
\\\`\\\`\\\`

**Sub-step 3.[N].4.2: Test Acceptance Criteria**

Test each criterion from the feature:

**Criterion 1:** [Copy criterion]
\\\`\\\`\\\`bash
# Test steps:
1. Navigate to http://localhost:3000/[route]
2. [Specific action to test]
3. Expected result: [What should happen]
\\\`\\\`\\\`
**Status:** [ ] Pass / [ ] Fail

**Criterion 2:** [Copy criterion]
\\\`\\\`\\\`bash
# Test steps:
[continue for each criterion...]
\\\`\\\`\\\`

**Sub-step 3.[N].4.3: Test Edge Cases**

[Copy edge cases from feature definition and test each:]
- Edge Case 1: [Description]
  - Test: [How to trigger]
  - Expected: [How it should be handled]
  - Result: [ ] Pass / [ ] Fail

**Sub-step 3.[N].4.4: Performance Check**
\\\`\\\`\\\`bash
# Measure performance
# Use browser DevTools:
# - Network tab: Check API response times
# - Performance tab: Check render times
# - Console: Check for memory leaks

# Targets:
# - Page load: < 2s
# - API response: < 500ms
# - No console errors
\\\`\\\`\\\`

[Repeat 3.N for EACH feature in PRD]

---

### PHASE 4: Testing & Quality Assurance

#### 4.1 Setup Testing Infrastructure

**Step 4.1.1: Install Testing Dependencies**
\\\`\\\`\\\`bash
# Install testing libraries
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D jest jest-environment-jsdom
npm install -D @types/jest

# Setup Jest config
npx jest --init
\\\`\\\`\\\`

**Step 4.1.2: Write Unit Tests**

Create \`src/components/[feature]/__tests__/[Component].test.tsx\`:
\\\`\\\`\\\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { [Component] } from '../[Component]';

describe('[Component]', () => {
  it('renders [feature] correctly', () => {
    render(<[Component] />);
    expect(screen.getByText('[expected text]')).toBeInTheDocument();
  });

  it('handles [action] correctly', async () => {
    render(<[Component] />);
    const [element] = screen.getByRole('[role]');
    fireEvent.click([element]);
    // Assert expected behavior
  });

  // [Add tests for each acceptance criterion]
});
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Run tests
npm test
# All tests should pass
\\\`\\\`\\\`

#### 4.2 Manual Testing Checklist

**For Each Feature:**
- [ ] **[Feature 1 Name]**
  - [ ] Acceptance Criterion 1: [Test and verify]
  - [ ] Acceptance Criterion 2: [Test and verify]
  - [ ] Edge Case 1: [Test and verify]
  - [ ] Performance: API < 500ms, Page < 2s

[Continue for all features...]

#### 4.3 Integration Testing

**Step 4.3.1: Test Complete User Flows**

**Flow 1: [Primary User Journey from PRD]**
\\\`\\\`\\\`
1. Start: User lands on [page]
2. Action: User [does something]
3. Verify: System shows [expected result]
4. Action: User [next action]
5. Verify: System [expected behavior]
6. Success: User sees [final state]
\\\`\\\`\\\`
**Status:** [ ] Pass / [ ] Fail

[Continue for each user flow from PRD]

---

### PHASE 5: Deployment Preparation

#### 5.1 Build & Optimization

**Step 5.1.1: Production Build**
\\\`\\\`\\\`bash
# Create production build
npm run build

# Check build output
ls -lh .next/static/
# Should show optimized bundles

# Analyze bundle size (if configured)
npm run analyze
# Check for large dependencies
\\\`\\\`\\\`

**Verification:**
- [ ] Build completes without errors
- [ ] No TypeScript errors: \`npx tsc --noEmit\`
- [ ] No ESLint errors: \`npm run lint\`
- [ ] Bundle size reasonable (< 500kb main bundle)

**Step 5.1.2: Environment Variables Documentation**

Create \`.env.example\`:
\\\`\\\`\\\`env
# Copy .env.local structure but remove actual values
[ENV_VAR_NAME]=get_from_[source]
[NEXT_ENV_VAR]=see_docs_at_[url]
\\\`\\\`\\\`

Create deployment docs in \`README.md\`:
\\\`\\\`\\\`markdown
## Environment Variables

| Variable | Purpose | Get From |
|----------|---------|----------|
| [NAME] | [What it's for] | [Where to get it] |
\\\`\\\`\\\`

#### 5.2 Pre-Deployment Checklist

**Security:**
- [ ] No API keys in code
- [ ] .env files in .gitignore
- [ ] HTTPS enforced (production)
- [ ] CORS configured correctly
- [ ] Input validation on all endpoints

**Performance:**
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] API responses < 500ms
- [ ] Page load < 2s on 3G

**Features:**
- [ ] All acceptance criteria met
- [ ] All edge cases handled
- [ ] Error states implemented
- [ ] Loading states implemented

#### 5.3 Deployment Steps

**For Vercel:**
\\\`\\\`\\\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# https://vercel.com/[team]/[project]/settings/environment-variables
\\\`\\\`\\\`

**For Netlify:**
\\\`\\\`\\\`bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
\\\`\\\`\\\`

**Verification:**
\\\`\\\`\\\`bash
# Test deployed URL
curl https://[your-domain].vercel.app
# Should return HTML

# Test API endpoint
curl https://[your-domain].vercel.app/api/[feature]
# Should return JSON
\\\`\\\`\\\`

---

## 🎯 Project Completion Criteria

This project is COMPLETE when ALL of the following are true:

### Feature Completeness
- [ ] All [N] features from PRD are implemented
- [ ] Every acceptance criterion passes
- [ ] All edge cases are handled
- [ ] All user flows work end-to-end

### Quality Gates
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests pass
- [ ] No console errors in production
- [ ] Performance targets met:
  - [ ] API responses < 500ms
  - [ ] Page load < 2s
  - [ ] Lighthouse score > 90

### Security & Best Practices
- [ ] No hardcoded secrets
- [ ] All inputs validated
- [ ] Error handling on all external calls
- [ ] HTTPS enforced
- [ ] Security headers configured

### Deployment
- [ ] Production build succeeds
- [ ] Deployed to [platform]
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### Documentation
- [ ] README.md updated
- [ ] .env.example created
- [ ] API documented (if applicable)
- [ ] Deployment steps documented

---

## 📚 Reference & Resources

### Tech Stack Documentation
**Framework:** [Framework name]
- Use context7 to get latest docs: \`@context7 [framework-name] [query]\`

**Key Libraries:**
[For each major library:]
- [Library name]: Use context7 for latest docs

### Integration Documentation
[For each integration:]
**[Integration Name]:**
- Official docs: [URL]
- Use context7: \`@context7 [integration-name] [feature]\`
- Configuration file: \`src/lib/[integration].ts\`

### Common Commands

**Development:**
\\\`\\\`\\\`bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check
npm test             # Run tests
\\\`\\\`\\\`

**Database (if using Prisma):**
\\\`\\\`\\\`bash
npx prisma generate  # Generate client
npx prisma db push   # Push schema changes
npx prisma studio    # Open admin UI
\\\`\\\`\\\`

---

## ⚠️ Critical Constraints

**DO:**
- ✅ Follow the numbered steps in order
- ✅ Verify after each phase
- ✅ Test acceptance criteria for each feature
- ✅ Use exact patterns provided
- ✅ Keep features in PRD scope

**DO NOT:**
- ❌ Skip verification steps
- ❌ Build features not in PRD
- ❌ Use deprecated packages
- ❌ Hardcode secrets
- ❌ Deploy without testing

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Build fails with "[error message]"**
- Check: [Specific thing to check]
- Fix: [Specific solution]

**Issue: API returns 500 error**
- Check: Environment variables are set
- Check: Database connection is working
- Check: Logs for specific error

**Issue: Component not rendering**
- Check: 'use client' directive if interactive
- Check: Imports are correct
- Check: Data is being fetched

[Add project-specific troubleshooting based on integrations]

---

## 📋 Next Steps After MVP

**Deferred to v2:**
[List features marked for v2 from research]

**Potential Enhancements:**
[Based on research, list possible future features]

**Metrics to Monitor:**
[From success metrics in research]
- [Metric 1]: Target [value]
- [Metric 2]: Target [value]

\\\`\\\`\\\`

CRITICAL RULES FOR GENERATION:
1. Replace ALL [placeholders] with ACTUAL values from the research/features/PRD
2. Provide REAL code examples with exact imports
3. Number every step hierarchically (1, 1.1, 1.1.1)
4. Include verification steps after each major task
5. Reference actual features by name
6. Include real edge cases from feature definitions
7. Make it so detailed that Gemini can execute sequentially without guessing`,

    universal: `You are an expert at writing coding instructions that work across different AI assistants.

Create an AGENTS.md file that any AI coding assistant can use effectively.

STRUCTURE:
\`\`\`markdown
# [Project Name] - Agent Instructions

## Quick Start
**What is this?** [One sentence]
**Who is it for?** [Target users]
**Core value:** [Key differentiator]

## Features to Build

### 1. [Feature Name] (MVP)
**User Story:** [As a... I want... so that...]

**What it does:**
[2-3 sentence description]

**Acceptance Criteria:**
- [ ] [Specific criterion]
- [ ] [Specific criterion]

**Implementation Hint:**
[Brief guidance on approach]

---

[Repeat for each feature]

## Tech Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | [X] | [Why for THIS project] |
| State | [X] | [Why] |
| Styling | [X] | [Why] |
| Backend | [X] | [Why] |

## Project Structure
\\\`\\\`\\\`
[Specific structure for this project]
\\\`\\\`\\\`

## Implementation Order
1. **Start with:** [What and why]
2. **Then:** [What and why]
3. **Finally:** [What and why]

## Coding Guidelines
- [Specific pattern for this project]
- [Another guideline]

## Common Patterns

### [Pattern Name]
\\\`\\\`\\\`typescript
[Example code]
\\\`\\\`\\\`

## Edge Cases to Handle
- [Specific edge case]
- [Another edge case]

## What NOT to Build
- [Deferred feature] - [why it's deferred]

## Testing Requirements
- [What needs testing]
- [How to verify]
\\\`\\\`\\\`

Make it practical and specific to this project.`,
  };

  const systemPrompt = formatPrompts[format] || formatPrompts.universal;

  // Build user message with skills injection
  let userMessage = `Create ${format.toUpperCase()} instructions for this specific project.

PROJECT FEATURES:
${featuresFormatted}

PRD CONTEXT:
${(prd || '').substring(0, 4000)}
`;

  // Inject detected skills if any
  if (skillsBundle.detectedSkills.length > 0) {
    const separator = '='.repeat(80);
    userMessage += '\n\n' + separator + '\n';
    userMessage += 'DETECTED INTEGRATIONS:\n';
    userMessage += skillsBundle.detectedSkills.map(s =>
      `- ${s.name} (${s.category})${s.matchedKeywords.length > 0 ? ` - matched: ${s.matchedKeywords.join(', ')}` : ''}`
    ).join('\n');
    userMessage += '\n' + separator + '\n\n';

    // Add MCP instructions
    if (skillsBundle.mcpInstructions) {
      userMessage += skillsBundle.mcpInstructions;
      userMessage += '\n\n';
    }

    // Add skills content
    if (skillsBundle.skillsContent) {
      userMessage += skillsBundle.skillsContent;
      userMessage += '\n\n' + separator + '\n\n';
    }

    userMessage += `IMPORTANT: Use the integration patterns above when generating the ${format.toUpperCase()} file. `;
    userMessage += `Include MCP usage instructions so the coding agent knows to fetch latest documentation.\n\n`;
  }

  userMessage += `Generate comprehensive, PROJECT-SPECIFIC instructions. Not generic templates.`;

  try {
    const config = MODEL_CONFIGS.export;
    // Allow model override for benchmarking, otherwise use fallback logic
    const { content, usage } = options.model
      ? await callAI(systemPrompt, userMessage, {
          model: options.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          ...options
        })
      : await callAIWithFallback(systemPrompt, userMessage, config);
    return {
      success: true,
      prompt: content,
      detectedSkills: skillsBundle.detectedSkills, // Return detected skills for UI
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Prompt generation error:', error);
    throw error;
  }
}

// ============================================================================
// DESIGN VARIATIONS - Multi-model UI component generation
// ============================================================================
export async function generateDesignVariations(designBrief, pageType = 'landing', options = {}) {
  // Page-specific component prompts
  const pageTypePrompts = {
    landing: 'Generate a HERO SECTION with headline, subheadline, CTA buttons, and visual element. Focus on conversion and impact.',
    dashboard: 'Generate a DATA DASHBOARD component with cards, charts placeholder, and navigation. Focus on information density and scannability.',
    settings: 'Generate a SETTINGS FORM section with form controls, toggles, and save/cancel actions. Focus on clarity and safety.',
    profile: 'Generate a PROFILE HEADER with avatar, user info, stats cards, and action buttons. Focus on identity and social elements.',
  };

  const systemPrompt = `You are an expert UI/UX designer creating a self-contained, production-ready ${pageType} component.

TASK: ${pageTypePrompts[pageType] || pageTypePrompts.landing}

REQUIREMENTS:
1. **Self-contained**: All CSS in a <style> tag, all JS in <script> tags
2. **Modern & Distinctive**: Use the exact design system from the brief (colors, typography, spacing)
3. **Production-ready**: Clean, semantic HTML with proper accessibility
4. **Material metaphors only**: NO artist names, NO copyrighted references
5. **Responsive**: Mobile-first, works 320px-2560px
6. **Interactive**: Include subtle hover effects, transitions where appropriate
7. **Page-appropriate**: Design specifically for a ${pageType} page context

OUTPUT FORMAT: Return a complete HTML document with inline styles and scripts.
Start with <!DOCTYPE html> and include everything in one file.
NO markdown formatting, NO explanations, JUST the HTML.`;

  const userMessage = `Design Brief:
${JSON.stringify(designBrief, null, 2)}

Page Type: ${pageType}

Create a distinctive, production-ready ${pageType} component that embodies this design system.`;

  const config = MODEL_CONFIGS.designVariations;
  const models = config.models;

  try {
    // Generate 3 variations in parallel using different models
    const variationPromises = models.map(async (model, index) => {
      try {
        const { content, usage } = await callAI(systemPrompt, userMessage, {
          model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
        });

        // Parse HTML response (no JSON needed!)
        let html = content.trim();

        // Remove markdown code blocks if present
        const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/) ||
                         content.match(/```\s*(<!DOCTYPE[\s\S]*?)\s*```/);

        if (htmlMatch && htmlMatch[1]) {
          html = htmlMatch[1].trim();
        }

        // Extract CSS and JS from the HTML for separate storage (optional)
        const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        const jsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);

        const css = cssMatch ? cssMatch[1].trim() : '';
        const js = jsMatch ? jsMatch[1].trim() : '';

        // Simple component type detection
        const componentType = html.includes('hero') ? 'hero' :
                            html.includes('pricing') ? 'pricing' :
                            html.includes('card') ? 'card' : 'component';

        return {
          id: `variation-${index + 1}`,
          model,
          html,
          css,
          js,
          componentType,
          description: `${model.split('/')[1]} design variation`,
          _meta: {
            model: usage.model,
            tokens: usage.totalTokens,
            cost: usage.cost.total,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error(`[Variation ${index + 1}] Model ${model} failed:`, error);
        // Return placeholder if a model fails
        return {
          id: `variation-${index + 1}`,
          model,
          html: '<div>Error generating variation</div>',
          css: '',
          js: '',
          componentType: 'error',
          description: `Failed: ${error.message}`,
          _meta: {
            model,
            tokens: 0,
            cost: 0,
            timestamp: new Date().toISOString(),
            error: error.message,
          },
        };
      }
    });

    const variations = await Promise.all(variationPromises);

    // Calculate total cost across all variations
    const totalCost = variations.reduce((sum, v) => sum + (v._meta.cost || 0), 0);
    const totalTokens = variations.reduce((sum, v) => sum + (v._meta.tokens || 0), 0);

    return {
      success: true,
      variations,
      _meta: {
        models: models,
        totalVariations: variations.length,
        tokens: totalTokens,
        cost: totalCost,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Design variations generation error:', error);
    throw error;
  }
}

// ============================================================================
// EXPAND TO FULL PAGE - Transform component into complete page
// ============================================================================
export async function expandToHomepage(selectedVariation, designBrief, pageType = 'landing', options = {}) {
  // Page-specific section structures
  const pageSections = {
    landing: {
      count: 8,
      sections: [
        '**Hero**: Attention-grabbing introduction (use/adapt the selected component)',
        '**Features**: 3-6 key product features with icons/images',
        '**How It Works**: Step-by-step process (numbered or visual)',
        '**Social Proof**: Testimonials or customer logos',
        '**Pricing**: Tiered pricing table (if applicable) or value proposition',
        '**FAQ**: Common questions with expandable answers',
        '**CTA**: Final call-to-action with conversion focus',
        '**Footer**: Links, legal, social media',
      ],
      context: 'marketing homepage focused on conversion',
    },
    dashboard: {
      count: 6,
      sections: [
        '**Header**: Navigation with logo, search, notifications, user menu',
        '**Sidebar**: Main navigation menu with sections/categories',
        '**Main Content**: Overview cards, stats, recent activity (use/adapt selected component)',
        '**Data Visualization**: Charts, graphs, analytics section',
        '**Tables**: Data tables with filtering and sorting',
        '**Footer/Actions**: Quick actions, help links',
      ],
      context: 'application dashboard for data visualization and navigation',
    },
    settings: {
      count: 5,
      sections: [
        '**Header**: Settings title with breadcrumb/back button',
        '**Sidebar Navigation**: Settings categories (Profile, Account, Privacy, etc)',
        '**Form Sections**: Multiple sections with form controls (use/adapt selected component)',
        '**Danger Zone**: Delete account/critical actions section',
        '**Save Actions**: Sticky footer with Save/Cancel buttons and status',
      ],
      context: 'settings page for user preferences and configuration',
    },
    profile: {
      count: 6,
      sections: [
        '**Header**: Profile banner with avatar, name, bio (use/adapt selected component)',
        '**Navigation Tabs**: About, Activity, Settings tabs',
        '**Info Cards**: Personal information, stats, achievements',
        '**Activity Feed**: Recent actions, posts, contributions',
        '**Social Section**: Connections, followers, following',
        '**Footer**: Additional info, links',
      ],
      context: 'user profile page for identity and activity display',
    },
  };

  const pageConfig = pageSections[pageType] || pageSections.landing;

  const systemPrompt = `You are a senior frontend developer expanding a component into a complete ${pageType} page.

TASK: Transform the provided component into a FULL ${pageConfig.count}-SECTION ${pageType.toUpperCase()} PAGE while maintaining design consistency.

SECTIONS TO INCLUDE:
${pageConfig.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CONTEXT: This is a ${pageConfig.context}.

REQUIREMENTS:
1. **Design Consistency**: Maintain exact colors, typography, spacing from the component
2. **Responsive**: Mobile-first, works 320px-2560px
3. **Semantic HTML**: Proper heading hierarchy, ARIA labels
4. **Self-contained**: All CSS in <style> tag, JS in <script> tags
5. **Production-ready**: No placeholders, realistic copy based on design brief
6. **Interactive**: Smooth transitions, interactive elements appropriate for ${pageType} pages
7. **Page-appropriate**: Design specifically for ${pageType} page patterns and user expectations

OUTPUT FORMAT: Return a complete HTML document with all sections, inline styles, and scripts.
Start with <!DOCTYPE html> and include everything in one file.
NO markdown formatting, NO explanations, JUST the HTML.`;

  const userMessage = `Original Component:
${selectedVariation.html}

Original Component CSS:
${selectedVariation.css}

Original Component JS:
${selectedVariation.js}

Design Brief:
${JSON.stringify(designBrief, null, 2)}

Page Type: ${pageType}

Expand this component into a complete, production-ready ${pageType} page with all ${pageConfig.count} sections. Maintain the design system perfectly.`;

  try {
    const config = MODEL_CONFIGS.expandHomepage;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    // Parse HTML response (no JSON needed!)
    let html = content.trim();

    // Remove markdown code blocks if present
    const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*(<!DOCTYPE[\s\S]*?)\s*```/);

    if (htmlMatch && htmlMatch[1]) {
      html = htmlMatch[1].trim();
    }

    // Extract CSS and JS from the HTML
    const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const jsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);

    const css = cssMatch ? cssMatch[1].trim() : '';
    const js = jsMatch ? jsMatch[1].trim() : '';

    // Detect sections in the HTML (simple check)
    const sections = [];
    if (html.includes('hero') || html.includes('Hero')) sections.push('hero');
    if (html.includes('feature') || html.includes('Feature')) sections.push('features');
    if (html.includes('works') || html.includes('Works')) sections.push('how-it-works');
    if (html.includes('testimonial') || html.includes('Testimonial')) sections.push('social-proof');
    if (html.includes('pricing') || html.includes('Pricing')) sections.push('pricing');
    if (html.includes('faq') || html.includes('FAQ')) sections.push('faq');
    if (html.includes('cta') || html.includes('CTA')) sections.push('cta');
    if (html.includes('footer') || html.includes('Footer')) sections.push('footer');

    return {
      success: true,
      homepage: {
        html,
        css,
        js,
        sections,
        description: 'Full homepage with 8 sections',
      },
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Homepage expansion error:', error);
    throw error;
  }
}

// ============================================================================
// DESIGN STUDIO V2 - Design Language & Layout-Based Generation
// ============================================================================

/**
 * Generate design language tokens from PRD context
 * Used in Design Studio Step 1 when user chooses "Generate from PRD"
 */
export async function generateDesignLanguage(context) {
  const { research, insights, features, prd } = context;

  const systemPrompt = `You are a design system expert. Based on the provided product context (research, features, PRD), generate a comprehensive design language specification.

Your output MUST be valid JSON with this exact structure:
{
  "colors": {
    "primary": "#hex",
    "primaryHover": "#hex",
    "secondary": "#hex",
    "secondaryHover": "#hex",
    "accent": "#hex",
    "accentHover": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "surfaceHover": "#hex",
    "surfaceActive": "#hex",
    "text": "#hex",
    "textSecondary": "#hex",
    "textMuted": "#hex",
    "border": "#hex",
    "borderHover": "#hex",
    "error": "#hex",
    "success": "#hex",
    "warning": "#hex",
    "info": "#hex"
  },
  "typography": {
    "fontFamily": "Font Name",
    "headingFont": "Font Name",
    "monoFont": "Monospace Font",
    "baseSize": 16,
    "scaleRatio": 1.25
  },
  "radii": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16
  },
  "mood": ["tag1", "tag2", "tag3"],
  "references": ["Product1", "Product2"],
  "rationale": "Brief explanation of design choices"
}

Guidelines:
- Choose colors that reflect the product's personality and target audience
- For B2B/enterprise: professional, muted palettes with blues/purples
- For consumer apps: vibrant, engaging colors
- For creative tools: bold, expressive palettes
- Dark mode should use zinc/slate backgrounds with high contrast text
- Light mode should use subtle grays with dark text
- Font choices should match the mood (Inter for modern, Plus Jakarta for friendly, etc.)
- Mood tags should be 2-4 descriptive words (minimal, bold, professional, etc.)
- References should be 1-3 real products whose aesthetic you're drawing from

IMPORTANT: Return ONLY valid JSON, no markdown or explanation.`;

  const userMessage = `Create a design language for this product:

RESEARCH:
${research?.substring(0, 2000) || 'No research provided'}

KEY INSIGHTS:
${JSON.stringify(insights || {}, null, 2).substring(0, 1000)}

FEATURES:
${features?.map(f => `- ${f.name}: ${f.description}`).join('\n').substring(0, 1000) || 'No features provided'}

PRD EXCERPT:
${prd?.substring(0, 2000) || 'No PRD provided'}

Generate a cohesive design language that reflects this product's identity.`;

  try {
    const config = MODEL_CONFIGS.designBrief;
    const result = await callAIWithFallback(systemPrompt, userMessage, config);
    const usage = result.usage;

    // Parse the JSON response
    let designLanguage;
    try {
      let cleanedContent = result.content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      designLanguage = JSON.parse(cleanedContent.trim());
    } catch (e) {
      console.error('Failed to parse design language JSON:', e);
      throw new Error('Invalid JSON response from AI');
    }

    return {
      success: true,
      designLanguage,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Design language generation error:', error);
    throw error;
  }
}

/**
 * Chat with design language to modify tokens
 * Used in Design Studio Step 2 for conversational refinement
 */
export async function chatWithDesignLanguage(message, currentTokens) {
  const systemPrompt = `You are a design system assistant helping refine design tokens through conversation.

Current design tokens:
${JSON.stringify(currentTokens, null, 2)}

When the user asks to change something:
1. Identify what they want to change (colors, fonts, spacing, mood, etc.)
2. Suggest appropriate modifications
3. Return your response with updated tokens

Your response MUST be valid JSON with this structure:
{
  "message": "Friendly response explaining what you changed",
  "updatedTokens": {
    // Only include the tokens that changed, partial update
    // e.g., {"colors": {"primary": "#newcolor"}} for just primary color
  }
}

If you can't understand the request or it's not about design tokens, respond with:
{
  "message": "Your clarification message",
  "updatedTokens": null
}

IMPORTANT:
- Be concise and helpful
- Only modify what the user asks for
- Return ONLY valid JSON, no markdown`;

  const userMessage = message;

  try {
    const config = MODEL_CONFIGS.refineFeatures; // Use fast model for chat
    const result = await callAIWithFallback(systemPrompt, userMessage, config);
    const usage = result.usage;

    // Parse the JSON response
    let response;
    try {
      let cleanedContent = result.content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      response = JSON.parse(cleanedContent.trim());
    } catch (e) {
      console.error('Failed to parse chat response JSON:', e);
      return {
        success: false,
        error: 'Failed to parse AI response',
      };
    }

    return {
      success: true,
      message: response.message,
      updatedTokens: response.updatedTokens,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Design language chat error:', error);
    throw error;
  }
}

/**
 * Generate a design variation using design language + layout
 * Used in Design Studio Step 4
 */
export async function generateDesignVariation(params) {
  const { pageType, layout, designLanguage, variationIndex = 0, prdContext = {} } = params;

  // Extract product info from PRD context
  const productName = extractProductName(prdContext);
  const features = prdContext.features || [];
  const topFeatures = features.slice(0, 5).map(f => `• ${f.name}: ${f.description || ''}`).join('\n');

  const systemPrompt = `You are an expert UI/UX designer generating HTML code for a ${pageType} page.

=== PRODUCT CONTEXT (CRITICAL - USE THIS FOR ALL COPY!) ===
Product Name: ${productName}
${prdContext.prd ? `
PRD Summary:
${prdContext.prd.substring(0, 2000)}
` : ''}
${topFeatures ? `
Key Features:
${topFeatures}
` : ''}

=== DESIGN TOKENS ===
${JSON.stringify(designLanguage, null, 2)}

=== LAYOUT STRUCTURE ===
${layout?.name || 'Default'} - ${layout?.description || ''}
Sections: ${layout?.sections?.join(', ') || 'hero, features, cta'}

=== REQUIREMENTS ===
1. Use REAL product copy based on the PRD context above - NO generic placeholders!
2. The headline, subheadline, and all text must be about "${productName}"
3. Feature cards must describe the actual features from the PRD
4. Use EXACTLY the colors from design tokens
5. Use the specified fonts from typography tokens
6. Use the specified border radii and spacing
7. Follow the layout structure provided
8. Variation #${variationIndex + 1} - add creative differences while staying on-brand

Return ONLY the HTML with embedded styles. The HTML should be:
- Self-contained (all CSS in <style> tag)
- Responsive (mobile-first)
- Modern and polished
- Using semantic HTML
- With REAL product content, not lorem ipsum!

IMPORTANT: Return ONLY the HTML code, no markdown or explanation.`;

  const userMessage = `Generate ${pageType} page variation #${variationIndex + 1} for "${productName}".

CRITICAL: Use the actual product information from the PRD context. Do NOT use:
- "Lorem ipsum" or placeholder text
- "Your Company" or "Company Name"
- Generic feature descriptions
- Placeholder images or icons without meaning

Make this variation unique by:
- ${variationIndex === 0 ? 'Using a clean, balanced layout' : ''}
- ${variationIndex === 1 ? 'Emphasizing bold typography and larger elements' : ''}
- ${variationIndex === 2 ? 'Using more whitespace and minimalist approach' : ''}
- ${variationIndex > 2 ? 'Adding creative visual interest while staying professional' : ''}

Generate the complete HTML now with REAL product content.`;

  try {
    const config = MODEL_CONFIGS.designVariation; // Use singular config with primary/fallback
    const result = await callAIWithFallback(systemPrompt, userMessage, config);
    const usage = result.usage;

    let html = result.content.trim();

    // Clean up markdown if present
    if (html.startsWith('```html')) {
      html = html.slice(7);
    }
    if (html.startsWith('```')) {
      html = html.slice(3);
    }
    if (html.endsWith('```')) {
      html = html.slice(0, -3);
    }

    return {
      success: true,
      variation: {
        html: html.trim(),
        code: html.trim(),
        description: `${pageType} variation ${variationIndex + 1} - ${layout?.name || 'Custom'} layout`,
      },
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Design variation generation error:', error);
    throw error;
  }
}

// ============================================================================
// CODE TEMPLATE CONTENT ADAPTATION
// ============================================================================
//
// Fills content slots in code templates based on PRD context.
// Much more efficient than generating full pages - only ~800 tokens.
//
// ============================================================================

/**
 * Adapt template content slots based on PRD context
 * This is the KEY cost-saving function:
 * - Only generates content strings (~500-1000 tokens)
 * - Does NOT regenerate HTML structure
 * - Uses PRD context for personalization
 * - Now archetype-aware for brand-matching content
 */
export async function adaptTemplateContent(templateSlots, prdContext, designIntent = null) {
  // Build a summary of what data is available
  const contextSummary = {
    hasResearch: !!prdContext.research,
    hasInsights: !!prdContext.insights,
    featureCount: prdContext.features?.length || 0,
    hasPRD: !!prdContext.prd,
    hasDesignIntent: !!designIntent?.archetype,
  };

  // Build archetype context if available
  let archetypeContext = '';
  if (designIntent?.archetype) {
    const archetypeGuidance = {
      'enterprise-technical': `
ARCHETYPE: Enterprise Technical
- Lead with metrics, scale, reliability numbers
- Use confident, technical tone - avoid playful or casual
- CTAs: "Book a Demo", "Contact Sales", "View Documentation"
- Trust: certifications, SLAs, enterprise logos, uptime stats
- Headlines: capability-focused, metric-driven`,
      'creator-aspirational': `
ARCHETYPE: Creator Aspirational
- Lead with transformation, journey, potential
- Use inspiring, warm tone - avoid corporate jargon
- CTAs: "Start Creating", "Join Free", "See Examples"
- Trust: creator stories, community size, success results
- Headlines: benefit-focused, aspirational`,
      'consumer-premium': `
ARCHETYPE: Consumer Premium
- Lead with experience, feeling, lifestyle
- Use sophisticated, aspirational tone - avoid salesy or cheap
- CTAs: "Get Access", "Join Waitlist", "Discover More"
- Trust: press logos, awards, ratings, exclusivity
- Headlines: experience-focused, elegant`,
      'startup-velocity': `
ARCHETYPE: Startup Velocity
- Lead with speed, efficiency, results
- Use energetic, direct tone - avoid slow or bureaucratic
- CTAs: "Try Free", "Get Started", "Start Now"
- Trust: user count, growth metrics, investor backing
- Headlines: benefit-first, action-oriented`,
    };

    archetypeContext = archetypeGuidance[designIntent.archetype] || '';

    // Add tone guidance
    if (designIntent.tone) {
      archetypeContext += `\n\nTONE GUIDANCE:
- Primary: ${designIntent.tone.primary || 'professional'}
- Secondary: ${designIntent.tone.secondary || 'clear'}
- AVOID: ${designIntent.tone.avoid?.join(', ') || 'none specified'}`;
    }

    // Add key messages to incorporate
    if (designIntent.keyMessages?.length > 0) {
      archetypeContext += `\n\nKEY MESSAGES TO INCORPORATE:
${designIntent.keyMessages.map((m, i) => `${i + 1}. ${m.message}`).join('\n')}`;
    }

    // Add trust signals
    if (designIntent.trustSignals?.length > 0) {
      archetypeContext += `\n\nTRUST SIGNALS TO USE:
${designIntent.trustSignals.map(t => `- ${t.value} (${t.type})`).join('\n')}`;
    }
  }

  const systemPrompt = `You are a conversion copywriter filling content slots for a web page.
${archetypeContext}

PRODUCT CONTEXT:
${prdContext.prd ? `PRD:\n${prdContext.prd.substring(0, 3000)}...` : 'No PRD provided'}

${prdContext.insights ? `INSIGHTS:\n${JSON.stringify(prdContext.insights, null, 2).substring(0, 1500)}` : ''}

${prdContext.features?.length > 0 ? `FEATURES (${prdContext.features.length} total):\n${prdContext.features.slice(0, 5).map(f => `- ${f.name}: ${f.description}`).join('\n')}` : 'No features provided'}

You will receive a list of content slots that need to be filled.
For each slot, generate compelling, specific content based on the product context.
${archetypeContext ? 'IMPORTANT: Follow the archetype guidance above for tone, CTAs, and messaging.' : ''}

CRITICAL RULES:
1. Use SPECIFIC details from the PRD - never generic phrases like "powerful solution"
2. Headlines must be punchy and benefit-focused (not feature-focused)
3. CTAs must be action-oriented ("Start Free Trial", "Get Started", not "Submit" or "Click Here")
4. Feature descriptions must highlight USER BENEFITS, not just capabilities
5. Keep text concise - respect the maxLength constraints when provided
6. Match the tone to the product type (B2B = professional, consumer = friendly/approachable)
7. For logo_initials, use 2-3 letter abbreviation of the product name
8. For features list, adapt the accepted features from the context
${archetypeContext ? '9. ARCHETYPE COMPLIANCE: Ensure all content matches the specified archetype guidance' : ''}

Return ONLY valid JSON with this EXACT structure (no markdown, no explanation):
{
  "logo_initials": "XX",
  "product_name": "Product Name",
  "nav_cta": "Get Started",
  "page_title": "Product Name - Tagline",
  "hero_badge": "Status Badge Text",
  "hero_headline": "Main headline with <br><span class=\\"text-gradient\\">gradient text</span>",
  "hero_subheadline": "Supporting description text",
  "cta_primary": "Primary Action",
  "cta_secondary": "Secondary Action",
  "features_headline": "Section Headline",
  "features_subheadline": "Section description",
  "features": [
    { "icon": "lucide-icon-name", "title": "Feature Title", "description": "Feature description", "tags": ["tag1", "tag2"] }
  ],
  "roadmap_headline": "What's Next",
  "roadmap": [
    { "title": "Phase Title", "description": "Phase description", "status": "completed|in-progress|planned" }
  ],
  "tech_stack": [
    { "name": "Technology Name", "icon": "lucide-icon-name" }
  ],
  "footer_logo_initials": "XX",
  "footer_copyright": "© 2025 Product Name"
}`;

  // Build user message with slot details
  const slotDetails = templateSlots.map(slot => {
    const maxLen = slot.validation?.maxLength ? ` (max ${slot.validation.maxLength} chars)` : '';
    const required = slot.validation?.required ? ' [REQUIRED]' : '';
    return `- ${slot.id}: ${slot.label}${maxLen}${required}
    Description: ${slot.description || 'No description'}
    Type: ${slot.type}`;
  }).join('\n');

  const userMessage = `Fill these content slots for the product:

SLOTS TO FILL:
${slotDetails}

Context available: ${contextSummary.hasResearch ? 'Research ✓' : 'No research'}, ${contextSummary.hasInsights ? 'Insights ✓' : 'No insights'}, ${contextSummary.featureCount} features, ${contextSummary.hasPRD ? 'PRD ✓' : 'No PRD'}

Generate compelling, specific content that makes this landing page sell the product. Return ONLY the JSON object.`;

  try {
    const config = MODEL_CONFIGS.templateContent;
    const result = await callAIWithFallback(systemPrompt, userMessage, config);
    const usage = result.usage;

    // Parse JSON response
    let filledContent;
    let content = result.content.trim();

    // Clean up markdown if present
    if (content.startsWith('```json')) {
      content = content.slice(7);
    }
    if (content.startsWith('```')) {
      content = content.slice(3);
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3);
    }

    try {
      filledContent = JSON.parse(content.trim());
    } catch (parseError) {
      console.error('Failed to parse template content JSON:', parseError);
      console.error('Raw content:', content.substring(0, 500));
      throw new Error('AI response was not valid JSON');
    }

    return {
      success: true,
      filledContent,
      _meta: {
        model: usage.model,
        tokens: usage.totalTokens,
        cost: usage.cost.total,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Template content adaptation error:', error);
    throw error;
  }
}

// ============================================================================
// DESIGN INTENT EXTRACTION - Extract structured design intent from PRD context
// ============================================================================

/**
 * Extract structured design intent from PRD context
 * Returns archetype, audience, positioning, trust signals, tone, key messages
 */
export async function extractDesignIntent(prdContext) {
  const { research, insights, features, prd } = prdContext || {};

  // Build context string
  const contextParts = [];
  if (prd) contextParts.push(`PRD:\n${prd.substring(0, 2000)}`);
  if (research) contextParts.push(`Research:\n${research.substring(0, 500)}`);
  if (insights) contextParts.push(`Insights:\n${JSON.stringify(insights).substring(0, 500)}`);
  if (features?.length) {
    const featureSummary = features.slice(0, 5).map(f => f.name || f.title).join(', ');
    contextParts.push(`Key Features: ${featureSummary}`);
  }

  const context = contextParts.join('\n\n');

  if (!context || context.length < 50) {
    return {
      success: false,
      error: 'Insufficient PRD context for intent extraction',
    };
  }

  const systemPrompt = `You are a design strategist extracting structured design intent from product context.

OUTPUT VALID JSON with this exact structure:
{
  "archetype": "enterprise-technical" | "creator-aspirational" | "consumer-premium" | "startup-velocity",
  "archetypeConfidence": 0-100,
  "archetypeReasoning": "Brief explanation of why this archetype",

  "audience": {
    "primary": "developers" | "creators" | "consumers" | "teams" | "enterprise",
    "sophistication": "beginner" | "intermediate" | "expert",
    "buyingPower": "individual" | "team" | "enterprise"
  },

  "positioning": {
    "category": "Product category in 2-4 words",
    "versus": ["Competitor 1", "Alternative approach"],
    "uniqueAngle": "What makes this different in one sentence"
  },

  "trustSignals": [
    { "type": "metric" | "certification" | "social" | "press", "value": "Specific signal", "priority": 1-3 }
  ],

  "tone": {
    "primary": "confident" | "inspiring" | "sophisticated" | "energetic" | "friendly",
    "secondary": "technical" | "warm" | "aspirational" | "direct" | "playful",
    "avoid": ["List of tones to avoid"]
  },

  "keyMessages": [
    { "priority": 1, "message": "Primary value proposition" },
    { "priority": 2, "message": "Secondary benefit" }
  ]
}

ARCHETYPE SELECTION RULES:
- enterprise-technical: B2B, APIs, DevTools, Infrastructure, Security-focused
- creator-aspirational: Creative tools, Courses, Community platforms, Personal brands
- consumer-premium: Lifestyle apps, Premium subscriptions, Luxury experiences
- startup-velocity: SaaS, Productivity tools, Fast-moving startups, Growth-focused

RULES:
1. Every decision must cite EVIDENCE from the provided context
2. If context is vague, use lower confidence (50-70)
3. Trust signals must be extractable from context, not invented
4. Maximum 3 trust signals, maximum 3 key messages
5. Output ONLY valid JSON, no markdown or explanation`;

  const userPrompt = `Extract design intent from this product context:\n\n${context}`;

  try {
    const config = MODEL_CONFIGS.designIntent || {
      primary: 'google/gemini-2.5-flash-lite',
      fallback: 'anthropic/claude-3.5-haiku',
      maxTokens: 1500,
      temperature: 0.5,
    };

    const response = await callAIWithFallback(systemPrompt, userPrompt, config);

    // Parse JSON from response
    let intent;
    try {
      // Clean response - remove markdown code blocks if present
      let cleaned = response.content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      intent = JSON.parse(cleaned.trim());
    } catch (parseError) {
      console.error('[INTENT] Failed to parse JSON:', parseError);
      return {
        success: false,
        error: 'Failed to parse design intent response',
        raw: response.content,
      };
    }

    // Validate required fields
    if (!intent.archetype || !intent.audience || !intent.tone) {
      return {
        success: false,
        error: 'Incomplete design intent response',
        partial: intent,
      };
    }

    return {
      success: true,
      intent,
    };
  } catch (error) {
    console.error('[INTENT] Extraction failed:', error);
    return {
      success: false,
      error: error.message || 'Design intent extraction failed',
    };
  }
}

// ============================================================================
// MILESTONE-BASED EXPORT - Design OS inspired incremental implementation
// ============================================================================

/**
 * Generates a complete milestone-based export package inspired by Design OS
 * Includes: product overview, numbered milestones, prompts, and test instructions
 */
export async function generateMilestoneExport(research, insights, features, prd, specifications = {}) {
  console.log('[MILESTONE] Starting milestone export generation');

  const { databaseSchema, apiEndpoints, componentTree } = specifications;

  // Sort features by priority and dependencies
  const sortedFeatures = [...features].sort((a, b) => {
    const priorityOrder = { mvp: 0, high: 1, medium: 2, low: 3 };
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  // Generate product overview
  const productOverview = generateProductOverview(research, insights, sortedFeatures, prd);

  // Generate foundation milestone
  const foundationMilestone = generateFoundationMilestone(sortedFeatures, databaseSchema, apiEndpoints);

  // Generate feature milestones (one per feature)
  const featureMilestones = sortedFeatures.map((feature, index) =>
    generateFeatureMilestone(feature, index + 3, sortedFeatures, componentTree) // Start at 03
  );

  // Generate prompts
  const oneShotPrompt = generateOneShotPrompt(sortedFeatures);
  const incrementalPrompt = generateIncrementalPrompt();

  // Generate test instructions for each feature
  const testInstructions = sortedFeatures.map(feature =>
    generateTestInstructions(feature)
  );

  // Generate clarifying questions
  const clarifyingQuestions = generateClarifyingQuestions(sortedFeatures);

  return {
    success: true,
    export: {
      productOverview,
      milestones: {
        foundation: foundationMilestone,
        features: featureMilestones,
      },
      prompts: {
        oneShot: oneShotPrompt,
        incremental: incrementalPrompt,
      },
      tests: testInstructions,
      clarifyingQuestions,
    },
    _meta: {
      featureCount: sortedFeatures.length,
      milestoneCount: featureMilestones.length + 2, // foundation + shell + features
      timestamp: new Date().toISOString(),
    },
  };
}

function generateProductOverview(research, insights, features, prd) {
  const mvpFeatures = features.filter(f => f.priority === 'mvp');
  const deferredFeatures = features.filter(f => f.priority === 'low');

  return `# Product Overview

## What We're Building

${prd ? prd.substring(0, 500) : 'A product designed to solve user pain points identified in research.'}

## Problem Statement

${insights?.painPoints?.slice(0, 3).map(p => `- ${p}`).join('\n') || 'Key pain points from user research.'}

## Target Users

Based on research insights:
${insights?.marketInsights?.slice(0, 2).map(m => `- ${m}`).join('\n') || '- Primary user persona'}

## Success Metrics

${insights?.successMetrics?.slice(0, 3).map(m => `- ${m}`).join('\n') || '- Key success metrics'}

---

## Feature Summary

### MVP Features (${mvpFeatures.length})
${mvpFeatures.map(f => `- **${f.name}**: ${f.description?.substring(0, 100) || ''}`).join('\n')}

### Deferred to v2 (${deferredFeatures.length})
${deferredFeatures.map(f => `- ${f.name}`).join('\n') || '- None specified'}

---

## Technical Requirements

${insights?.technicalRequirements?.slice(0, 5).map(t => `- ${t}`).join('\n') || '- See PRD for details'}

---

*Always provide this file for context in every implementation session.*
`;
}

function generateFoundationMilestone(features, databaseSchema, apiEndpoints) {
  return `# Milestone 01: Foundation

## Goal
Set up the project foundation: design tokens, data model, routing, and core infrastructure.

---

## Before You Start: Clarifying Questions

**You MUST ask these questions before implementing:**

### 1. Authentication & Authorization
- What authentication method? (Email/password, OAuth, Magic links, etc.)
- Are there user roles? (Admin, User, Guest, etc.)
- What resources need authorization checks?

### 2. User & Account Modeling
- Single-user or multi-user accounts?
- Teams/workspaces/organizations?
- How are users related to data? (Owner, collaborator, viewer)

### 3. Tech Stack
- Backend framework preference? (Next.js API routes, Express, etc.)
- Database? (PostgreSQL, MongoDB, Supabase, Firebase)
- Hosting target? (Vercel, AWS, Railway)

### 4. Existing Patterns
- Is there an existing codebase to integrate with?
- Any required patterns or conventions?
- Existing component library?

---

## Step 1.1: Project Initialization

\`\`\`bash
# Initialize project (adjust based on tech stack answer)
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Install core dependencies
npm install zod date-fns

# Install dev dependencies
npm install -D @types/node prettier
\`\`\`

**Verification:**
\`\`\`bash
npm run dev
# Should start on http://localhost:3000
\`\`\`

---

## Step 1.2: Design Tokens

Create \`src/lib/design-tokens.ts\`:
\`\`\`typescript
// Design tokens from design brief
export const colors = {
  primary: {
    DEFAULT: '#6366f1', // Indigo-500
    hover: '#4f46e5',
    light: '#e0e7ff',
  },
  // ... extend based on design brief
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  // ... extend based on design brief
};
\`\`\`

---

## Step 1.3: Data Model Types

${databaseSchema ? `Based on DATABASE_SCHEMA.md, create TypeScript interfaces:

\`\`\`typescript
// src/types/index.ts
// Copy interfaces from DATABASE_SCHEMA.md
\`\`\`
` : `Create TypeScript interfaces based on features:

${features.slice(0, 3).map(f => `// ${f.name} types\nexport interface ${f.name.replace(/\s+/g, '')} {\n  id: string;\n  // ... define properties\n}`).join('\n\n')}
`}

---

## Step 1.4: Routing Structure

\`\`\`bash
# Create route structure
mkdir -p src/app/(auth)/{login,register}
mkdir -p src/app/(dashboard)/{${features.slice(0, 3).map(f => f.name.toLowerCase().replace(/\s+/g, '-')).join(',')}}
mkdir -p src/app/api
\`\`\`

---

## Step 1.5: Environment Configuration

Create \`.env.local\`:
\`\`\`env
# Database
DATABASE_URL=

# Authentication (if applicable)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# External services (based on detected integrations)
# Add as needed based on clarifying questions
\`\`\`

---

## Completion Checklist

- [ ] Project initialized with chosen framework
- [ ] Design tokens configured
- [ ] TypeScript types created for core entities
- [ ] Route structure matches feature list
- [ ] Environment variables documented
- [ ] Dev server runs without errors

---

**Next:** Proceed to Milestone 02 (Shell) after this checklist is complete.
`;
}

function generateFeatureMilestone(feature, milestoneNumber, allFeatures, componentTree) {
  const paddedNum = String(milestoneNumber).padStart(2, '0');
  const featureSlug = feature.name.toLowerCase().replace(/\s+/g, '-');

  // Find dependencies
  const dependencies = feature.dependencies || [];
  const dependentFeatures = allFeatures.filter(f =>
    dependencies.some(d => f.name.toLowerCase().includes(d.toLowerCase()))
  );

  return `# Milestone ${paddedNum}: ${feature.name}

## Goal
Implement ${feature.name}: ${feature.description?.substring(0, 200) || 'See user story below.'}

---

## User Story

${feature.userStory || `As a user, I want to ${feature.name.toLowerCase()} so that I can achieve my goals.`}

---

## Prerequisites

${dependentFeatures.length > 0
  ? `Complete these milestones first:\n${dependentFeatures.map(f => `- ${f.name}`).join('\n')}`
  : '- Milestone 01 (Foundation)\n- Milestone 02 (Shell)'}

---

## Acceptance Criteria

${feature.acceptanceCriteria?.map((c, i) => `- [ ] AC${i + 1}: ${c}`).join('\n') || '- [ ] Feature works as described'}

---

## Implementation Steps

### Step ${paddedNum}.1: Create Components

\`\`\`bash
mkdir -p src/components/${featureSlug}
touch src/components/${featureSlug}/index.ts
\`\`\`

**Components to create:**
${componentTree
  ? `- See COMPONENT_TREE.md for ${feature.name} component hierarchy`
  : `- \`${feature.name.replace(/\s+/g, '')}List.tsx\` - List/grid view
- \`${feature.name.replace(/\s+/g, '')}Card.tsx\` - Individual item display
- \`${feature.name.replace(/\s+/g, '')}Form.tsx\` - Create/edit form
- \`${feature.name.replace(/\s+/g, '')}Detail.tsx\` - Detail view`}

### Step ${paddedNum}.2: Create API Routes

\`\`\`bash
mkdir -p src/app/api/${featureSlug}
touch src/app/api/${featureSlug}/route.ts
\`\`\`

**Endpoints needed:**
- \`GET /api/${featureSlug}\` - List all
- \`POST /api/${featureSlug}\` - Create new
- \`GET /api/${featureSlug}/[id]\` - Get single
- \`PUT /api/${featureSlug}/[id]\` - Update
- \`DELETE /api/${featureSlug}/[id]\` - Delete

### Step ${paddedNum}.3: Create Page Routes

\`\`\`bash
mkdir -p src/app/(dashboard)/${featureSlug}
touch src/app/(dashboard)/${featureSlug}/page.tsx
touch src/app/(dashboard)/${featureSlug}/[id]/page.tsx
touch src/app/(dashboard)/${featureSlug}/new/page.tsx
\`\`\`

### Step ${paddedNum}.4: Wire Up Data

1. Create data fetching hooks in \`src/lib/hooks/use-${featureSlug}.ts\`
2. Connect API routes to database
3. Add loading states and error handling
4. Implement empty states (when no data exists)

---

## Edge Cases to Handle

${feature.edgeCases?.map(e => `- ${e}`).join('\n') || `- Empty state: No ${feature.name.toLowerCase()} exist yet
- Error state: API request fails
- Loading state: Data is being fetched
- Validation: Invalid form input`}

---

## Test Instructions

See \`tests/${featureSlug}-tests.md\` for detailed test-writing instructions.

**Quick verification:**
1. Navigate to \`/dashboard/${featureSlug}\`
2. Verify empty state displays correctly
3. Create a new item - verify it appears in list
4. Edit the item - verify changes persist
5. Delete the item - verify removal

---

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] Components created and styled
- [ ] API routes implemented
- [ ] Pages display data correctly
- [ ] Empty states handled
- [ ] Error states handled
- [ ] Tests passing (see tests/${featureSlug}-tests.md)

---

**Next:** Proceed to Milestone ${String(milestoneNumber + 1).padStart(2, '0')} after this checklist is complete.
`;
}

function generateOneShotPrompt(features) {
  return `# One-Shot Implementation Prompt

Copy this prompt into your coding agent (Claude Code, Cursor, etc.) to implement the entire product in one session.

---

## Prompt

I have a complete product design ready for implementation. Before we begin, I need you to review the specifications and ask me some clarifying questions.

**Files to read:**
- \`product-plan/product-overview.md\` - Product summary and context
- \`product-plan/milestones/01-foundation.md\` - Foundation setup
- \`product-plan/milestones/*.md\` - All feature milestones

**Before implementing, please ask me about:**

1. **Authentication & Authorization**
   - What login method should we use?
   - Are there different user roles?
   - What needs authorization checks?

2. **Tech Stack Decisions**
   - Database preference?
   - Hosting platform?
   - Any existing patterns to follow?

3. **User Modeling**
   - Single-user or multi-user accounts?
   - Teams or organizations?

4. **Scope Confirmation**
   - Which features are MVP (must have)?
   - Anything to defer to v2?

After I answer these questions, please:

1. Create a technical implementation plan
2. Implement each milestone in order
3. Verify each acceptance criterion
4. Handle empty states and errors
5. Write tests based on \`tests/*.md\` instructions

**Features to implement (${features.length} total):**
${features.map((f, i) => `${i + 1}. ${f.name} (${f.priority})`).join('\n')}

Let's begin with your clarifying questions.

---

*This prompt ensures the agent understands the full context and asks important questions before implementation.*
`;
}

function generateIncrementalPrompt() {
  return `# Incremental Implementation Prompt

Use this template to implement one milestone at a time. Copy and customize for each session.

---

## Prompt Template

I'm implementing **[MILESTONE_NAME]** from my product plan.

**Context files (always provide these):**
- \`product-plan/product-overview.md\` - Product context
- \`product-plan/milestones/[NN]-[milestone-name].md\` - This milestone's instructions
- \`product-plan/tests/[feature-name]-tests.md\` - Test instructions (if applicable)

**Previous milestones completed:**
- [List completed milestones, or "None - this is the first"]

**Implementation notes:**
- [Add any specific decisions made in previous sessions]
- [Tech stack: Next.js 14, PostgreSQL, etc.]
- [Auth approach: NextAuth with email/password]

**Please:**
1. Review the milestone instructions
2. Ask any clarifying questions
3. Implement step by step
4. Verify each acceptance criterion
5. Write tests based on test instructions

---

## Example: Foundation Milestone

I'm implementing **Milestone 01: Foundation** from my product plan.

**Context files:**
- \`product-plan/product-overview.md\`
- \`product-plan/milestones/01-foundation.md\`

**Previous milestones completed:** None - this is the first

**Implementation notes:**
- Using Next.js 14 with App Router
- PostgreSQL via Supabase
- Tailwind CSS for styling

Please review the foundation instructions and ask any clarifying questions before we begin.

---

## Example: Feature Milestone

I'm implementing **Milestone 03: Invoice Management** from my product plan.

**Context files:**
- \`product-plan/product-overview.md\`
- \`product-plan/milestones/03-invoice-management.md\`
- \`product-plan/tests/invoice-management-tests.md\`

**Previous milestones completed:**
- 01-foundation: Design tokens, types, routing
- 02-shell: Navigation, layout, user menu

**Implementation notes:**
- Using Next.js 14 with App Router
- PostgreSQL via Supabase (tables created in 01)
- Auth: NextAuth with email/password

Please review the milestone and test instructions, then implement step by step.

---

*Incremental implementation lets you review progress after each milestone and catch issues early.*
`;
}

function generateTestInstructions(feature) {
  const featureSlug = feature.name.toLowerCase().replace(/\s+/g, '-');

  return {
    featureName: feature.name,
    fileName: `${featureSlug}-tests.md`,
    content: `# Test Instructions: ${feature.name}

## Overview

These are **framework-agnostic test instructions**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, etc.).

---

## User Flow Tests

### Happy Path: Create ${feature.name}

**Scenario:** User successfully creates a new ${feature.name.toLowerCase()}

**Steps:**
1. Navigate to \`/${featureSlug}/new\`
2. Fill in required fields
3. Submit the form
4. Verify redirect to list/detail page
5. Verify new item appears

**Assertions:**
- Form submits without errors
- Success message displays
- New item visible in list
- Data persists on page refresh

### Happy Path: Edit ${feature.name}

**Scenario:** User successfully edits an existing ${feature.name.toLowerCase()}

**Steps:**
1. Navigate to \`/${featureSlug}/[id]/edit\`
2. Modify field values
3. Save changes
4. Verify changes persist

**Assertions:**
- Form pre-populates with existing data
- Changes save successfully
- Updated values display correctly

### Happy Path: Delete ${feature.name}

**Scenario:** User deletes a ${feature.name.toLowerCase()}

**Steps:**
1. Click delete button on item
2. Confirm deletion in modal
3. Verify item removed from list

**Assertions:**
- Confirmation modal appears
- Item removed from UI
- Item no longer accessible via direct URL

---

## Empty State Tests

### No ${feature.name} Exist

**Scenario:** User views ${featureSlug} page with no data

**Assertions:**
- Empty state message displays
- "Create" CTA is visible and functional
- No errors in console

### After Deleting Last Item

**Scenario:** User deletes the only ${feature.name.toLowerCase()}

**Assertions:**
- Empty state displays after deletion
- User can create new item

---

## Error State Tests

### Network Error

**Scenario:** API request fails

**Assertions:**
- Error message displays to user
- User can retry the action
- No unhandled exceptions

### Validation Error

**Scenario:** User submits invalid data

**Assertions:**
- Validation errors display inline
- Form is not submitted
- User can correct and resubmit

---

## Acceptance Criteria Verification

${feature.acceptanceCriteria?.map((c, i) => `### AC${i + 1}: ${c}

**Test:**
- [ ] Verify this behavior works as expected
- [ ] Test edge cases
- [ ] Confirm no regressions
`).join('\n') || `### Verify Core Functionality

- [ ] Feature works as described in user story
- [ ] All happy paths pass
- [ ] Error handling works correctly
`}

---

## Edge Cases

${feature.edgeCases?.map(e => `- [ ] ${e}`).join('\n') || `- [ ] Very long text input
- [ ] Special characters in fields
- [ ] Rapid successive actions
- [ ] Concurrent edits (if applicable)`}

---

## Performance Considerations

- [ ] List renders efficiently with 100+ items
- [ ] Form submission responds within 2 seconds
- [ ] No memory leaks on repeated navigation

---

*Write these tests before or alongside implementation (TDD approach recommended).*
`,
  };
}

function generateClarifyingQuestions(features) {
  const integrations = [];
  const featureNames = features.map(f => f.name.toLowerCase()).join(' ');

  // Detect likely integrations
  if (featureNames.includes('payment') || featureNames.includes('billing') || featureNames.includes('subscription')) {
    integrations.push('Stripe');
  }
  if (featureNames.includes('auth') || featureNames.includes('login') || featureNames.includes('user')) {
    integrations.push('Authentication');
  }
  if (featureNames.includes('email') || featureNames.includes('notification')) {
    integrations.push('Email/Notifications');
  }
  if (featureNames.includes('file') || featureNames.includes('upload') || featureNames.includes('image')) {
    integrations.push('File Storage');
  }

  return `# Clarifying Questions

Before implementing, your coding agent should ask these questions:

---

## 1. Authentication & Authorization

- [ ] What authentication method? (Email/password, OAuth providers, Magic links)
- [ ] Which OAuth providers? (Google, GitHub, etc.)
- [ ] Are there user roles? What are they?
- [ ] What resources need authorization checks?
- [ ] Session handling? (JWT, server sessions, cookies)

---

## 2. User & Account Modeling

- [ ] Single-user accounts or multi-user/team accounts?
- [ ] If teams: How are teams created? Invitations?
- [ ] Workspaces or organizations?
- [ ] How is data scoped? (Per-user, per-team, global)
- [ ] User profile fields needed?

---

## 3. Tech Stack Preferences

- [ ] Frontend framework? (Next.js, Vite + React, etc.)
- [ ] Backend approach? (API routes, separate Express, serverless)
- [ ] Database? (PostgreSQL, MongoDB, Supabase, Firebase)
- [ ] ORM/Query builder? (Prisma, Drizzle, raw SQL)
- [ ] Hosting target? (Vercel, AWS, Railway, self-hosted)

---

## 4. Detected Integrations

${integrations.length > 0 ? integrations.map(i => `### ${i}

- [ ] Which provider/service?
- [ ] Test mode vs production?
- [ ] Required features? (e.g., for Stripe: one-time, subscriptions, metered)
`).join('\n') : 'No specific integrations detected. Ask about:

- [ ] Payment processing?
- [ ] Email sending?
- [ ] File storage?
- [ ] Third-party APIs?'}

---

## 5. Existing Codebase

- [ ] Is there an existing codebase to integrate with?
- [ ] Required patterns or conventions?
- [ ] Existing component library? (shadcn/ui, Radix, etc.)
- [ ] Existing API contracts to maintain?

---

## 6. Scope & Priority

- [ ] Confirm MVP features (must ship in v1)
- [ ] Features to defer to v2?
- [ ] Any hard deadlines?
- [ ] Testing requirements? (Unit, integration, E2E)

---

*Get answers to these questions before starting implementation to avoid rework.*
`;
}

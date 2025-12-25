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
// STORY FILES GENERATION - Atomic, AI-digestible story files (BMAD-inspired)
// ============================================================================
export async function generateStoryFiles(features, prd) {
  const systemPrompt = `You are a Scrum Master generating story files for AI coding agents.

Each story file is ATOMIC and SELF-CONTAINED - a coding agent can implement it without needing other context.

STORY FILE FORMAT:

For each feature, generate a story file with this EXACT structure:

\`\`\`markdown
# Story [EPIC].[STORY]: [Title]

**Status:** ready-for-dev
**Priority:** [mvp|high|medium|low]
**Complexity:** [small|medium|large]

---

## User Story

As a [specific user role],
I want to [specific action],
so that [measurable benefit].

---

## Acceptance Criteria

1. [ ] [Specific, testable criterion - starts with "Given/When/Then" or imperative]
2. [ ] [Another criterion - UNIQUE to this story]
3. [ ] [Include at least one UX/performance criterion]
4. [ ] [Include error state handling]

---

## Implementation Tasks

- [ ] **Task 1:** [Specific implementation step] (AC: #1)
  - [ ] Subtask 1.1: [Detailed step]
  - [ ] Subtask 1.2: [Detailed step]
- [ ] **Task 2:** [Another step] (AC: #2, #3)
  - [ ] Subtask 2.1: [Detailed step]
- [ ] **Task 3:** [Testing/validation] (AC: #4)

---

## Dev Notes

### Architecture
- [Which component/module this belongs to]
- [Key patterns to follow]
- [State management approach for this feature]

### API/Data
- [Endpoints needed, if any]
- [Data models involved]

### Edge Cases
- [What happens when X fails]
- [Empty states]
- [Loading states]

### Testing
- [Key test scenarios]
- [What to verify]

---

## Dependencies

- **Requires:** [What must exist before this can be built]
- **Blocks:** [What depends on this being complete]

---

## Out of Scope

- [What this story explicitly does NOT cover]

---

## References

- PRD: [Relevant FR numbers, e.g., "FR1, FR2, FR5"]
- Design: [Link or description if applicable]
\`\`\`

CRITICAL RULES:
1. Each story must be INDEPENDENTLY IMPLEMENTABLE
2. Tasks must reference which Acceptance Criteria they satisfy
3. No vague tasks like "implement feature" - be specific
4. Include error states and edge cases
5. Complexity: small = 1-2 days, medium = 3-5 days, large = 1-2 weeks

Respond with JSON:
{
  "stories": [
    {
      "epicNumber": 1,
      "storyNumber": 1,
      "title": "Story title",
      "filename": "story-1-1-title-slug.md",
      "content": "Full markdown content of the story file"
    }
  ],
  "epicSummary": {
    "1": "Epic 1 name/description",
    "2": "Epic 2 name/description"
  },
  "implementationOrder": ["story-1-1-...", "story-1-2-...", "story-2-1-..."],
  "totalComplexity": "X small, Y medium, Z large stories"
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

  const userMessage = `Generate atomic story files for each of these features.

FEATURES TO CONVERT TO STORIES:
${featuresFormatted}

PRD CONTEXT (for FR references):
${(prd || '').substring(0, 3000)}

Requirements:
- One story file per feature (complex features may become 2-3 stories)
- Group related features into epics
- Each story must be independently implementable
- Tasks must reference Acceptance Criteria numbers
- Include implementation order based on dependencies`;

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
export async function generateDesignVariations(designBrief, options = {}) {
  const systemPrompt = `You are an expert UI/UX designer creating a self-contained, production-ready component.

TASK: Generate HTML/CSS/JS for a SINGLE KEY COMPONENT from the design brief.
Focus on creating ONE visually distinctive element (like a hero section, pricing card, or feature showcase).

REQUIREMENTS:
1. **Self-contained**: All CSS inline or in a <style> tag, all JS in <script> tags
2. **Modern & Distinctive**: Use the exact design system from the brief (colors, typography, spacing)
3. **Production-ready**: Clean, semantic HTML with proper accessibility
4. **Material metaphors only**: NO artist names, NO copyrighted references
5. **Responsive**: Mobile-first, works 320px-2560px
6. **Interactive**: Include subtle hover effects, transitions where appropriate

OUTPUT FORMAT (JSON):
{
  "html": "<!DOCTYPE html>...",
  "css": "/* Component styles */",
  "js": "// Interactive behaviors",
  "componentType": "hero|pricing|feature|card",
  "description": "Brief description of the design approach"
}

Return ONLY valid JSON. No markdown formatting, no explanations outside the JSON.`;

  const userMessage = `Design Brief:
${JSON.stringify(designBrief, null, 2)}

Create a distinctive, production-ready component that embodies this design system.`;

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

        // Parse JSON response
        let parsed;
        try {
          // Try to extract JSON if wrapped in markdown
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        } catch (parseError) {
          console.error(`[Variation ${index + 1}] JSON parse error:`, parseError);
          throw new Error(`Failed to parse JSON from ${model}`);
        }

        return {
          id: `variation-${index + 1}`,
          model,
          html: parsed.html || '',
          css: parsed.css || '',
          js: parsed.js || '',
          componentType: parsed.componentType || 'component',
          description: parsed.description || `Variation ${index + 1}`,
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
// EXPAND TO HOMEPAGE - Transform component into full 8-section homepage
// ============================================================================
export async function expandToHomepage(selectedVariation, designBrief, options = {}) {
  const systemPrompt = `You are a senior frontend developer expanding a component into a complete homepage.

TASK: Transform the provided component into a FULL 8-SECTION HOMEPAGE while maintaining design consistency.

SECTIONS TO INCLUDE:
1. **Hero**: Attention-grabbing introduction (use/adapt the selected component)
2. **Features**: 3-6 key product features with icons/images
3. **How It Works**: Step-by-step process (numbered or visual)
4. **Social Proof**: Testimonials or customer logos
5. **Pricing**: Tiered pricing table (if applicable) or value proposition
6. **FAQ**: Common questions with expandable answers
7. **CTA**: Final call-to-action with conversion focus
8. **Footer**: Links, legal, social media

REQUIREMENTS:
1. **Design Consistency**: Maintain exact colors, typography, spacing from the component
2. **Responsive**: Mobile-first, works 320px-2560px
3. **Semantic HTML**: Proper heading hierarchy, ARIA labels
4. **Self-contained**: All CSS inline or in <style> tag, JS in <script> tags
5. **Production-ready**: No placeholders, realistic copy based on design brief
6. **Interactive**: Smooth scrolling, FAQ toggles, mobile menu (if header included)

OUTPUT FORMAT (JSON):
{
  "html": "<!DOCTYPE html>...",
  "css": "/* Full homepage styles */",
  "js": "// Interactive behaviors for all sections",
  "sections": ["hero", "features", "how-it-works", "social-proof", "pricing", "faq", "cta", "footer"],
  "description": "Overview of the homepage design"
}

Return ONLY valid JSON. No markdown, no explanations.`;

  const userMessage = `Original Component:
${selectedVariation.html}

Original Component CSS:
${selectedVariation.css}

Original Component JS:
${selectedVariation.js}

Design Brief:
${JSON.stringify(designBrief, null, 2)}

Expand this component into a complete, production-ready homepage with all 8 sections. Maintain the design system perfectly.`;

  try {
    const config = MODEL_CONFIGS.expandHomepage;
    const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

    // Parse JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error('Homepage expansion JSON parse error:', parseError);
      throw new Error('Failed to parse homepage JSON response');
    }

    return {
      success: true,
      homepage: {
        html: parsed.html || '',
        css: parsed.css || '',
        js: parsed.js || '',
        sections: parsed.sections || [],
        description: parsed.description || 'Full homepage expansion',
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

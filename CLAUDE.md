# CLAUDE.md - IdeaForge Documentation

This file provides guidance to Claude Code and serves as the source of truth for how IdeaForge works.
**Last Updated:** 2025-12-31

---

## Project Overview

IdeaForge is a research-to-code ideation assistant that transforms research dossiers into production-ready coding agent instructions. It analyzes user-provided research, extracts insights, generates features, creates PRDs, and outputs optimized prompts for Claude Code, Cursor, and Gemini.

---

## Quick Start

### Frontend (React + Vite)
```bash
cd ideaforge
npm run dev      # Starts on http://localhost:8000
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (Express + Gemini API)
```bash
cd ideaforge/backend
npm run dev      # Starts on http://localhost:3001
npm start        # Production start
```

### Environment Variables

**backend/.env:**
```env
GEMINI_API_KEY=your-key-from-aistudio.google.com
VERTEX_AI_MODEL=gemini-2.0-flash-001
PORT=3001
```

---

## Architecture Overview

### 5-Step Workflow

```
RESEARCH → ANALYSIS → FEATURES → PRD → EXPORT
   │          │          │        │       │
   ▼          ▼          ▼        ▼       ▼
 Paste     AI extracts  Accept/  Generate  Agent prompts,
 research  insights     reject   PRD doc   design brief,
                        features           story files
```

### Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **State:** Zustand with localStorage persistence
- **Backend:** Express.js
- **AI:** Google Gemini API (gemini-2.0-flash-001)

---

## File Structure

```
ideaforge/
├── CLAUDE.md                        # THIS FILE - source of truth
├── vite.config.js                   # Vite config (port 8000)
├── package.json                     # Frontend dependencies
├── src/
│   ├── App.jsx                      # Routes: / (main flow), /design-studio
│   ├── main.jsx                     # Entry point with BrowserRouter
│   ├── index.css                    # Global styles + Tailwind
│   ├── pages/
│   │   ├── LandingPage.jsx         # Main 7-step workflow
│   │   └── DesignStudioPage.jsx    # Standalone design studio
│   ├── stores/
│   │   ├── useAppStore.js          # Main app state (~800 lines)
│   │   ├── useDesignStudioStore.js # Design studio state (~1100 lines)
│   │   └── useAuthStore.js         # Firebase auth state
│   ├── hooks/
│   │   └── useDesignStudioAdapter.js # Backward compatibility for design components
│   ├── utils/
│   │   └── designStudioMigration.js # Migration from old to new state format
│   ├── services/
│   │   ├── aiService.js            # Frontend API client + mock fallbacks
│   │   └── archetypeMatchingService.js # Template matching algorithm
│   ├── data/
│   │   └── templates/
│   │       ├── archetypes/
│   │       │   ├── schema.js       # 4 archetype definitions
│   │       │   └── index.js        # Archetype utilities
│   │       ├── builtInTemplates.js # Pre-analyzed templates
│   │       └── codeTemplates/      # HTML/CSS template files
│   └── components/
│       ├── layout/
│       │   ├── Header.jsx          # Top bar with Design Studio link
│       │   └── Sidebar.jsx         # Step navigation (7 steps)
│       ├── MainFlow.jsx            # Extracted main workflow
│       ├── research/
│       │   └── ResearchStep.jsx    # Step 1: Paste/upload research
│       ├── analysis/
│       │   └── AnalysisStep.jsx    # Step 2: View extracted insights
│       ├── features/
│       │   ├── FeaturesStep.jsx    # Step 3: Accept/reject features
│       │   └── ChatRefinement.jsx  # Chat panel for feature mods
│       ├── prd/
│       │   └── PRDStep.jsx         # Step 4: View/edit PRD
│       ├── export/
│       │   └── ExportStep.jsx      # Step 5: Export all formats
│       └── design/
│           ├── workflow/           # 5-step design workflow
│           │   ├── Step1_ImportContext.jsx
│           │   ├── Step2_DesignIntent.jsx
│           │   ├── Step3_TemplateSelection.jsx
│           │   ├── Step4_ContentEditing.jsx
│           │   └── Step5_Export.jsx
│           ├── TemplateUploadModal.jsx    # Screenshot upload UI
│           ├── TemplateLibraryGrid.jsx    # Template grid display
│           ├── TemplateCard.jsx           # Template card component
│           ├── ArchetypeIndicator.jsx     # Archetype badge
│           ├── MatchScoreCard.jsx         # Match score display
│           ├── ImportContextModal.jsx     # Import from PRD modal
│           ├── DesignStudioStep.jsx       # Main design UI
│           ├── DesignVariationsStep.jsx   # Variation generation
│           ├── DesignSystemEditor.jsx     # Token editing
│           ├── DesignChatPanel.jsx        # AI chat refinement
│           └── PageSelector.jsx           # Multi-page selection
│
└── backend/
    ├── server.js                    # Express server + 30+ API routes
    ├── package.json                 # Backend dependencies
    ├── .env                         # API keys (gitignored)
    ├── config/
    │   └── models.js               # Multi-tier model configuration
    ├── services/
    │   ├── aiService.js            # ALL AI LOGIC (5300+ lines)
    │   └── skillsService.js        # Skills library management
    └── tests/
        └── benchmark/              # Evaluation framework
            ├── benchmark.js
            ├── evaluators/
            └── fixtures/
```

---

## State Management (Zustand Store)

**File:** `src/stores/useAppStore.js`

### Full State Shape

```javascript
{
  // Current step
  currentStep: 'research' | 'analysis' | 'features' | 'prd' | 'export',

  // Step 1 data
  research: {
    content: '',           // Raw research text
    fileName: null,        // If file was uploaded
    uploadedAt: null,
  },

  // Step 2 data
  insights: {
    marketInsights: [],    // Array of insight strings
    competitorGaps: [],
    painPoints: [],
    technicalRequirements: [],
    successMetrics: [],
    isAnalyzed: false,
    isAnalyzing: false,
  },

  // Step 3 data
  features: {
    items: [{
      id: 'uuid',
      name: 'Feature Name',
      description: '...',
      userStory: 'As a user...',
      acceptanceCriteria: ['...'],
      edgeCases: ['...'],
      dependencies: ['...'],
      priority: 'mvp' | 'high' | 'medium' | 'low',
      status: 'pending' | 'accepted' | 'rejected',
      reasoning: 'Why from research...',
      estimatedComplexity: 'small' | 'medium' | 'large',
    }],
    isGenerating: false,
  },

  // Step 4 data
  prd: {
    content: null,         // Full PRD as markdown string
    isGenerating: false,
  },

  // Step 5 data
  exportFormat: 'claude' | 'cursor' | 'gemini' | 'universal',
  chatMessages: [],        // Chat history for refinement
}
```

### Key Actions

```javascript
// Navigation
setCurrentStep(step)

// Research (resets ALL downstream data when called!)
setResearch(content, fileName)
clearResearch()

// Insights
setInsights(insights)
setAnalyzing(boolean)

// Features
setFeatures(items)
updateFeature(id, updates)
addFeature(feature)
removeFeature(id)

// PRD
setPRD({ content })

// Helpers
canProceedToAnalysis()   // research.content.length > 100
canProceedToFeatures()   // insights.isAnalyzed === true
canProceedToPRD()        // features.items.some(f => f.status === 'accepted')
canProceedToExport()     // prd.content exists
getAcceptedFeatures()    // filters for status === 'accepted'
```

### Persistence

State is auto-saved to `localStorage` under key `ideaforge-storage`.
Only these fields are persisted: `research`, `insights`, `features`, `prd`, `currentStep`

---

## Data Flow Between Steps

### Does the LLM know about previous steps? YES!

Each API call passes accumulated data forward:

| Step | API Call | Data Sent to LLM |
|------|----------|------------------|
| 2. Analysis | `analyzeResearch(research)` | research text |
| 3. Features | `generateFeatures(research, insights)` | research + all insights |
| 4. PRD | `generatePRD(research, insights, acceptedFeatures)` | everything above + features |
| 5. Export | `generatePrompt(format, research, insights, features, prd)` | FULL CONTEXT |

This means the LLM has full context at every step.

---

## API Endpoints

**Base URL:** `http://localhost:3001/api`

### Core Workflow
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| GET | `/health` | Health check | - |
| POST | `/analyze` | Analyze research | `{ research }` |
| POST | `/features/generate` | Generate features | `{ research, insights }` |
| POST | `/features/refine` | Chat refinement | `{ message, features }` |
| POST | `/prd/generate` | Generate PRD | `{ research, insights, features }` |
| POST | `/stories/generate` | Generate story files | `{ features, prd, specifications }` |
| POST | `/export/chat` | Export ideation chat | `{ message, context }` |
| POST | `/export/:format` | Generate agent prompts | `{ research, insights, features, prd }` |

### Specification Framework
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/schema/generate` | Generate database schema | `{ prd, features }` |
| POST | `/endpoints/generate` | Generate API endpoints | `{ prd, features, schema }` |
| POST | `/components/generate` | Generate component tree | `{ prd, features }` |

### Design Studio
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/design/generate` | Generate design brief | `{ research, insights, features }` |
| POST | `/design/chat` | Chat with design brief | `{ message, brief }` |
| POST | `/design/regenerate` | Regenerate on token edits | `{ brief, changes }` |
| POST | `/design/variations` | Generate 3 variations | `{ brief, pageType }` |
| POST | `/design/expand` | Expand to full page | `{ variation, brief }` |
| POST | `/design/extract-intent` | Extract design intent | `{ prdContext }` |
| POST | `/design/language/generate` | Generate design language | `{ context }` |
| POST | `/design/language/chat` | Chat with design language | `{ message, language }` |
| POST | `/design/variation/generate` | Generate single variation | `{ brief, template }` |

### Template Inspiration System
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/templates/analyze` | Analyze screenshot | `{ imageBase64, name, category, notes }` |
| POST | `/templates/generate` | Generate from template | `{ templateAnalysis, designBrief, pageType }` |
| POST | `/templates/adapt` | Adapt content to PRD | `{ templateSlots, prdContext, designIntent }` |

### Milestone-Based Export (Design OS Inspired)
| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/export/milestone` | Generate complete milestone export | `{ research, insights, features, prd, specifications }` |

**Returns:**
- `productOverview` - Product summary and context
- `milestones.foundation` - 01-foundation.md (setup, tokens, types)
- `milestones.features[]` - One milestone per feature (03-feature-name.md)
- `prompts.oneShot` - Full implementation prompt
- `prompts.incremental` - Section-by-section template
- `tests[]` - Test instructions per feature
- `clarifyingQuestions` - Questions to ask before implementing

---

## LLM Configuration

**Config File:** `backend/config/models.js`
**Service File:** `backend/services/aiService.js`
**API:** OpenRouter (https://openrouter.ai) - unified access to all models

### Multi-Model Strategy (Tier-Based Routing)

IdeaForge uses a **tier-based model routing strategy** to optimize for both quality and cost:

| Tier | Use Case | Primary Model | Fallback | Cost |
|------|----------|---------------|----------|------|
| **⚡ SPEED** | Pattern extraction, chat | Gemini 2.5 Flash Lite | Grok 4.1 Fast | $0.10/$0.40 |
| **🧠 MEDIUM** | Structured generation | Claude 4.5 Haiku | Gemini 3 Flash | $1/$5 |
| **🚀 MAX BRAIN** | Critical specifications | Claude 4.5 Sonnet | GPT-5.2 | $3/$15 |

### Task-to-Model Mapping

| Task | Tier | Primary Model | Tokens | Temp | Rationale |
|------|------|---------------|--------|------|-----------|
| `analyzeResearch()` | SPEED | gemini-2.5-flash-lite | 6000 | 0.7 | Pattern extraction |
| `refineFeatures()` | SPEED | gemini-2.5-flash-lite | 4000 | 0.7 | Chat iteration |
| `chatWithExport()` | SPEED | gemini-2.5-flash-lite | 3000 | 0.7 | Quick advice |
| `generateFeatures()` | MEDIUM | claude-4.5-haiku | 8000 | 0.7 | Structured JSON |
| `designBrief()` | MEDIUM | gemini-3-flash | 8000 | 0.7 | UI generation |
| `generatePRD()` | MAX | claude-4.5-sonnet | 12000 | 0.7 | **SOTA coding** |
| `generateStoryFiles()` | MAX | claude-4.5-sonnet | 15000 | 0.5 | **Critical specs** |
| `generatePrompt()` | MAX | claude-4.5-sonnet | 8000 | 0.7 | **Agent instructions** |

### Fallback Logic

Every task has automatic fallback retry:
```javascript
try {
  return await callAI(primaryModel);  // Try primary first
} catch (error) {
  return await callAI(fallbackModel); // Auto-retry with fallback
}
```

If **both** primary and fallback fail, the error is thrown to the client.

### Cost Analysis

**Estimated cost per full session** (all 8 tasks):

| Previous (GLM-4.7) | New (Tier-Based) | All-Claude Sonnet |
|--------------------|------------------|-------------------|
| ~$0.03/session | ~$0.11/session | ~$0.80/session |

**Trade-offs:**
- ✅ **75% cheaper** on high-volume tasks (analysis, chat) vs old config
- ✅ **SOTA quality** (77.2% SWE-bench) for critical tasks (PRD, stories, prompts)
- ✅ **Better instruction following** overall (Claude models)
- ⚠️ **~4x more expensive** than GLM-4.7 all-tasks (~$0.11 vs $0.03)
- ✅ **86% cheaper** than all-Claude Sonnet (~$0.11 vs $0.80)

**Why the upgrade:**
- GLM-4.7 was cheap ($0.03) but lacked the sophistication for complex PRDs and agent prompts
- Claude 4.5 Sonnet (77.2% SWE-bench) is proven SOTA for coding tasks
- Tier-based routing saves massively on routine tasks while splurging on critical outputs

See **[API INFO & PRICING.md](./API%20INFO%20&%20PRICING.md)** for detailed model pricing.

### Prompt Philosophy

All prompts are designed to **reject generic output**:
- Require specific evidence/quotes from research
- Ban phrases like "clean and modern", "user-friendly", "professional"
- Use FR format: "FR#: [Actor] can [capability]"
- Design briefs require exact hex colors, named product references (e.g., "like Linear's command palette")
- Features must have unique acceptance criteria, not copy-paste boilerplate

---

## Chat Integration

### Two Chat Systems

#### 1. Feature Refinement Chat (Step 3)
**Location:** `ChatRefinement.jsx`
**Purpose:** Modify features through conversation
**Actions Available:** `add`, `modify`, `remove` features
**Modifies State:** YES - directly updates Zustand store

#### 2. Export Ideation Chat (Step 5)
**Location:** `ExportStep.jsx`
**Purpose:** Get advice on improving exports
**Actions Available:** None (advisory only)
**Modifies State:** NO - just shows suggestions

---

## Export Formats

### Agent Prompts
| Format | File | Optimized For |
|--------|------|---------------|
| Claude | `CLAUDE.md` | Claude Code with XML tags |
| Cursor | `.cursorrules` | MDC format with globs |
| Gemini | `GEMINI.md` | Hierarchical step-by-step |
| Universal | `AGENTS.md` | Works across all agents |

### Design Brief
- JSON with exact design tokens (colors, typography, spacing)
- Named product references (e.g., "Stripe's tables", "Vercel's dark theme")
- Anti-patterns list (things to NEVER do)
- Component patterns with specific behaviors

### Story Files (BMAD Method 2025)
- **BMAD-style atomic story files** with enhanced best practices
- **Status:** Stories start as `draft` (not `ready-for-dev`)
- **PRD Traceability:** Every story links back to specific FR/NFR numbers from PRD
- **Security Requirements:** Explicit security section in every story (auth, authz, validation, rate limiting)
- **Architectural Decisions:** Explains WHY patterns were chosen, not just WHAT
- **Research Validation:** Includes direct quotes from original research
- Each story independently implementable
- Tasks reference acceptance criteria numbers
- Includes dependencies and implementation order
- **Validation Checkpoints:** Functional, Technical, and Security test gates

---

## Template Inspiration System

Upload designs you love and generate customized versions with your brand tokens.

### How It Works

```
1. USER UPLOADS SCREENSHOT
   ↓ (PNG/JPG, max 5MB)
2. VISION ANALYSIS
   ↓ (Gemini 3 Flash Preview analyzes image)
3. EXTRACT STRUCTURE
   ↓ (layout, components, colors, typography, mood)
4. STORE IN TEMPLATE LIBRARY
   ↓ (with preview thumbnail)
5. SELECT TEMPLATE + DESIGN BRIEF
   ↓ (match template structure with user's tokens)
6. GENERATE CUSTOMIZED UI
   → (production-ready HTML/CSS)
```

### Vision Analysis Output

The AI vision model extracts:
- **Layout:** Spatial organization (e.g., "sidebar-left + top-nav + 3-column-grid")
- **Components:** UI elements (cards, tables, forms, navigation)
- **Color Palette:** Primary, secondary, accent, background, text (hex values)
- **Typography:** Style, weight, aesthetic feel
- **Spacing:** Compact / Balanced / Generous
- **Mood:** Professional, Playful, Minimal, Bold, Elegant, Data-dense
- **UI Patterns:** Effects (glassmorphism, gradients, shadows)
- **Grid System:** 12-column / Flexbox / CSS Grid
- **Reference Products:** Similar products (Linear, Stripe, Notion)

### Template Generation

When generating from a template:
- **KEEPS:** Layout structure, component types, patterns, spacing, grid
- **APPLIES:** User's design tokens (colors, fonts, brand mood)
- **MAINTAINS:** Template's responsiveness and proportions
- **REPLACES:** Placeholder content with product-specific copy

### Cost

| Operation | Model | Cost |
|-----------|-------|------|
| Screenshot Analysis | Gemini 3 Flash Preview | ~$0.015 |
| Template Generation | Claude 4.5 Sonnet | ~$0.03-0.05 |
| Content Adaptation | Gemini 2.5 Flash Lite | ~$0.005 |

### Implementation Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Screenshot upload + vision analysis | ✅ Complete |
| 1 | Template generation from screenshot | ✅ Complete |
| 1 | Template library UI | ✅ Complete |
| 2 | Code/HTML upload parsing | ⏳ Not Started |
| 2 | URL scraping | ⏳ Not Started |
| 3 | Template library search/browse | ⏳ Not Started |
| 4 | Figma integration | ⏳ Not Started |

---

## Milestone-Based Export System

Inspired by Design OS, IdeaForge now generates incremental implementation packages.

### Two Export Modes

**One-Shot Mode:**
- Single prompt for full implementation
- Agent asks clarifying questions first
- Implements all milestones in sequence
- Best for: Smaller projects, experienced developers

**Incremental Mode:**
- Implement one milestone at a time
- Review progress after each milestone
- Catch issues early
- Best for: Larger projects, learning, teams

### Milestone Structure

```
product-plan/
├── product-overview.md           # Always provide for context
├── milestones/
│   ├── 01-foundation.md         # Design tokens, types, routing
│   ├── 02-shell.md              # Application shell (TBD)
│   ├── 03-[feature-1].md        # First feature
│   ├── 04-[feature-2].md        # Second feature
│   └── ...
├── prompts/
│   ├── one-shot-prompt.md       # Full implementation prompt
│   └── incremental-prompt.md    # Section-by-section template
├── tests/
│   ├── [feature-1]-tests.md     # TDD specs for feature 1
│   └── [feature-2]-tests.md     # TDD specs for feature 2
└── clarifying-questions.md      # Questions to ask before implementing
```

### Clarifying Questions

Before implementing, the AI agent asks about:
1. **Authentication** - Login method, OAuth providers, user roles
2. **User Modeling** - Single-user vs teams, data scoping
3. **Tech Stack** - Framework, database, hosting preference
4. **Integrations** - Payment, email, file storage
5. **Existing Code** - Patterns, component libraries, conventions
6. **Scope** - MVP features, what to defer

### Test Instructions (TDD)

Each feature includes framework-agnostic test instructions:
- **User Flow Tests** - Happy path for create/edit/delete
- **Empty State Tests** - Behavior when no data exists
- **Error State Tests** - Network errors, validation errors
- **Acceptance Criteria Verification** - Tests for each AC
- **Edge Cases** - From feature definition

---

## Key Design Decisions

### Why Zustand?
- Simple API, no boilerplate
- Built-in persistence middleware
- Works with React 19

### Why Gemini?
- Generous free tier
- Good at structured JSON output
- Fast response times

### Why localStorage persistence?
- No backend user accounts needed
- Works offline
- User data stays on their machine

### Why separate mock fallbacks?
- Frontend works without backend running
- Faster development iteration
- Demo mode without API keys

---

## Common Tasks

### Adding a new export format
1. Add format to `formats` array in `ExportStep.jsx`
2. Add prompt template to `formatPrompts` object in `backend/services/aiService.js`
3. Test with existing research/features

### Modifying an AI prompt
1. Find the function in `backend/services/aiService.js`
2. Edit the `systemPrompt` string
3. Test with varied research inputs

### Adding a new insight category
1. Add to initial state in `useAppStore.js`
2. Add to `insightCategories` array in `AnalysisStep.jsx`
3. Update `analyzeResearch()` prompt to output new category

### Changing the workflow order
1. Update `currentStep` logic in `App.jsx`
2. Update navigation guards (`canProceedTo*` functions)
3. Update Sidebar step order

---

## Styling

- **Framework:** Tailwind CSS v4 with `@tailwindcss/postcss`
- **Theme:** Dark mode only (zinc palette, indigo/violet accents)
- **Background:** `#09090B` with subtle gradient orbs
- **Cards:** `bg-zinc-900/50 border border-zinc-800/50 rounded-xl`
- **Primary button:** `bg-indigo-500 hover:bg-indigo-400`

---

## Troubleshooting

### "Failed to fetch" errors
- Check backend is running on port 3001
- Check VITE_API_URL in frontend .env (should be `http://localhost:3001/api`)

### "GEMINI_API_KEY is not set"
- Create `backend/.env` with your API key from aistudio.google.com

### Features not generating
- Check insights.isAnalyzed is true
- Check research has >100 characters

### State not persisting
- Check localStorage isn't disabled/full
- Key is `ideaforge-storage`

---

## MCP Servers (Claude Code Tools)

The following MCP servers are installed for this project:

| MCP | Purpose | Status |
|-----|---------|--------|
| `context7` | Fetch up-to-date docs for any library | ✅ Active |
| `firebase` | Firebase project access, Auth, Firestore | ✅ Active |
| `stripe` | Stripe API access, payment patterns | ⚠️ Needs API key |
| `filesystem` | Local file operations | ✅ Active |

### Usage in Prompts
When generating code for integrations, use:
- `use context7` - to fetch current library documentation
- `use firebase` - to interact with Firebase projects
- `use stripe` - for Stripe payment integration (after auth)

### Setup Stripe MCP
```bash
# Add your Stripe API key to authenticate
export STRIPE_API_KEY=sk_test_...
```

---

## Skills Library (Integration Patterns)

IdeaForge includes a **modular Skills library** for common integrations. Skills provide production-ready patterns, gotchas, and examples that Claude Code can use when generating prompts.

### Location
```
.claude/skills/
├── index.json                    # Skills registry
├── _template/                    # Template for creating new skills
│   ├── skill.md
│   └── README.md
├── nextjs-app-router/            # Next.js 14+ App Router patterns
│   ├── skill.md
│   └── examples/
├── firebase-auth/                # Firebase Authentication
│   ├── skill.md
│   └── examples/
└── stripe-billing/               # Stripe payments & subscriptions
    ├── skill.md
    └── examples/
```

### Available Skills

| Skill | Category | Description |
|-------|----------|-------------|
| `nextjs-app-router` | Framework | Server Components, Server Actions, Middleware |
| `firebase-auth` | Auth | Email/password, OAuth, session cookies |
| `stripe-billing` | Payments | Checkout, subscriptions, webhooks, portal |

### Skill Structure

Each skill contains:
- **skill.md** - Complete documentation with:
  - Quick Start (minimum viable implementation)
  - Full Implementation (production patterns)
  - Architecture diagrams
  - Common Gotchas (problems + solutions)
  - Security & Testing checklists
- **examples/** - Ready-to-use code files

### Using Skills in Prompts

When IdeaForge detects an integration need (e.g., "add Stripe payments"), it should:
1. Check `index.json` for matching skill
2. Inject the skill's Quick Start or Full Implementation
3. Include relevant gotchas and security notes

### Adding New Skills

1. Copy `_template/` to new folder
2. Follow the structure in `skill.md`
3. Add examples in `examples/`
4. Register in `index.json`

### Detection Patterns

From `index.json`:
```json
{
  "trigger": ["stripe", "payment", "checkout", "subscription"],
  "skill": "stripe-billing"
},
{
  "trigger": ["firebase", "auth", "login", "oauth", "google sign"],
  "skill": "firebase-auth"
}
```

---

## Changelog

### 2025-12-31
- **🎯 Milestone-Based Export System (Design OS Inspired)**
  - **Two Export Modes**: One-shot (full implementation) vs Incremental (milestone-by-milestone)
  - **Numbered Milestones**: 01-foundation → 02-shell → 03-[feature]...
  - **Clarifying Questions**: Prompts ask about auth, tech stack, user modeling before implementing
  - **TDD Test Instructions**: Framework-agnostic test specs for each feature
    - User flow tests (happy path)
    - Empty state tests
    - Error state tests
    - Acceptance criteria verification
  - **New Endpoint**: `POST /api/export/milestone`
  - **New Function**: `generateMilestoneExport()` in aiService.js
  - **Inspired By**: [Design OS](https://buildermethods.com/design-os) by Brian Casel

- **📸 Template Inspiration System: Phase 1 Complete**
  - **Screenshot Upload**: Drag & drop upload (PNG, JPG, max 5MB) with image preview and compression
  - **Vision Analysis**: AI extracts layout, components, colors, typography, spacing, mood, UI patterns, grid system
  - **Template Generation**: Generates customized HTML/CSS preserving template structure with user's design tokens
  - **Template Library UI**: Grid display with built-in + user-uploaded templates, preview thumbnails, category filtering
  - **Vision Model**: Google Gemini 3 Flash Preview (primary) with Claude Sonnet fallback
  - **Cost**: ~$0.015 per screenshot analysis, ~$0.03-0.05 per template generation
  - **New Files**:
    - `src/components/design/TemplateUploadModal.jsx` - Upload UI with drag & drop
    - `src/components/design/TemplateLibraryGrid.jsx` - Template grid display
    - `src/components/design/TemplateCard.jsx` - Individual template cards
  - **Backend Functions**:
    - `analyzeDesignScreenshot(imageBase64, userNotes)` - Vision analysis
    - `generateFromTemplate(templateAnalysis, designBrief, pageType)` - Template-based generation
    - `adaptTemplateContent(templateSlots, prdContext, designIntent)` - Archetype-aware slot filling
  - **API Endpoints**:
    - `POST /api/templates/analyze` - Analyze uploaded screenshot
    - `POST /api/templates/generate` - Generate UI from template
    - `POST /api/templates/adapt` - Fill content slots
  - **Phase 2+ (Not Started)**: Code/HTML upload parsing, URL scraping, Figma integration

- **📋 Specification Framework Complete**
  - **Database Schema Generation**: `POST /api/schema/generate` → `DATABASE_SCHEMA.md`
  - **API Endpoints Specification**: `POST /api/endpoints/generate` → `API_ENDPOINTS.md`
  - **Component Tree Specification**: `POST /api/components/generate` → `COMPONENT_TREE.md`
  - **Spec-Focused Story Files**: Stories reference specifications instead of containing code examples
  - **Backend Functions**: `generateDatabaseSchema()`, `generateApiEndpoints()`, `generateComponentTree()`
  - **Impact**: AI developers use specifications with context7 and LSP, not code examples

- **🏗️ Design Studio Refactor Status**
  - ✅ `useDesignStudioStore.js` - New dedicated store with flat state structure (1100+ lines)
  - ✅ `useDesignStudioAdapter.js` - Backward compatibility hook for existing components
  - ✅ `/design-studio` route - Lazy-loaded standalone page
  - ✅ Migration utilities - Auto-migrate from old localStorage format
  - ⏳ **Phase 5 Cleanup Pending**: `designVariations` (~435 lines) still in `useAppStore.js`
    - Removal deferred until full testing confirms new store works correctly
    - ExportStep and FinalExportStep still read from old store

- **🔍 Codebase Health**
  - Zero TODO/FIXME markers in entire codebase
  - All 30+ API endpoints fully implemented
  - 3 Zustand stores: `useAppStore`, `useDesignStudioStore`, `useAuthStore`
  - Complete benchmark/evaluation framework in `backend/tests/benchmark/`

### 2025-12-28
- **🎨 Design Studio V3: Intent-Driven Architecture**
  - **Template Archetypes System**: 4 core archetypes (enterprise-technical, creator-aspirational, consumer-premium, startup-velocity) with full metadata including tone, audience match, content strategy, and CTA patterns
  - **Design Intent Extraction**: AI extracts structured intent from PRD (~500 tokens) including archetype, audience, positioning, trust signals, tone, and key messages
  - **Template Matching Algorithm**: Weighted scoring (archetype 40%, audience 25%, tone 20%, content 15%) ranks templates by fit
  - **New 5-Step Workflow**: Context → Intent → Template → Content → Export (added Intent step between Context and Template)
  - **Archetype-Aware Content Generation**: Slot filling now uses archetype content strategy, incorporates key messages and trust signals
  - **New Files Created**:
    - `src/data/templates/archetypes/schema.js` - Archetype definitions + detection signals
    - `src/data/templates/archetypes/index.js` - Archetype utility functions
    - `src/services/archetypeMatchingService.js` - Template matching algorithm
    - `src/components/design/workflow/Step2_DesignIntent.jsx` - Intent extraction UI
    - `src/components/design/ArchetypeIndicator.jsx` - Archetype badge component
    - `src/components/design/MatchScoreCard.jsx` - Match score display component
    - `src/components/design/workflow/Step3_TemplateSelection.jsx` - Enhanced template selection
    - `src/components/design/workflow/Step4_ContentEditing.jsx` - Content editing step
    - `src/components/design/workflow/Step5_Export.jsx` - Export step
  - **Modified Files**:
    - `backend/services/aiService.js` - Added `extractDesignIntent()`, enhanced `adaptTemplateContent()`
    - `backend/server.js` - Added `/api/design/extract-intent` endpoint
    - `backend/config/models.js` - Added designIntent model config (SPEED tier)
    - `src/services/aiService.js` - Added frontend `extractDesignIntent()` method
    - `src/stores/useDesignStudioStore.js` - Added designIntent, templateSelection, contentGeneration state
    - `src/components/design/CodeTemplateSelector.jsx` - Integrated match scoring
    - `src/components/design/workflow/*.jsx` - Updated workflow navigation
    - All 4 code templates - Added archetype metadata
  - **Cost**: ~$0.0025 per session (25% more than before, 10x better quality)
  - **Impact**: Generated content now matches product brand (enterprise vs startup vs creator) instead of generic output

### 2025-12-26
- **🎯 Enhanced BMAD Story Files with 2025 Best Practices:**
  - **PRD Traceability Section**: Every story now links back to specific PRD FR/NFR numbers, success metrics, and original research quotes
  - **Security Requirements Section**: Explicit security requirements in every story (Authentication, Authorization, Data Validation, Rate Limiting, Sensitive Data, Audit Trail)
  - **Architectural Decisions Section**: Documents WHY architectural patterns were chosen, trade-offs made, and alternatives considered
  - **Research Validation**: Includes direct quotes from original research to validate feature needs
  - **Status Field Updated**: Stories now start as `draft` (BMAD 2025 standard) instead of `ready-for-dev`
  - **Enhanced Validation Checkpoints**: Added Security Tests section alongside Functional and Technical tests
  - **Updated System Prompt**: Added BMAD 2025 best practices guidance (Traceability First, Security by Default, Architectural Context, Self-Contained)
  - **9 Critical Rules**: Expanded from 5 to 9 rules including PRD traceability, security-first, architectural context, and research validation
  - File: `backend/services/aiService.js` (lines 1117-1356)
  - **Impact**: Story files now exceed official BMAD Method standards with better traceability and security coverage

### 2025-12-25
- **🚀 Upgraded to Multi-Model Routing Strategy:**
  - **Tier-based model selection** for optimal quality/cost balance
  - **SPEED tier** ($0.10/$0.40): Gemini 2.5 Flash Lite for analysis, chat, refinement
  - **MEDIUM tier** ($1/$5): Claude 4.5 Haiku for features, design briefs
  - **MAX BRAIN tier** ($3/$15): Claude 4.5 Sonnet for PRD, story files, agent prompts
  - **Automatic fallback logic**: Each task retries with fallback model if primary fails
  - **Cost impact**: ~$0.11/session (4x more than GLM-4.7, but 86% cheaper than all-Claude Sonnet)
  - **Quality upgrade**: SOTA coding model (77.2% SWE-bench) for critical specifications
  - Updated `backend/config/models.js` with new MODEL_CONFIGS
  - Updated `backend/services/aiService.js` with `callAIWithFallback()` retry logic
  - Updated `.env.example` to use OPENROUTER_API_KEY (unified access to all models)
  - See **[API INFO & PRICING.md](./API%20INFO%20&%20PRICING.md)** for verified pricing data

### 2024-12-24
- Frontend port changed to 8000 (was 5173)
- Created comprehensive CLAUDE.md documentation
- **Bug fix:** Research textarea now allows pasting directly (dropzone overlay no longer blocks clicks)
  - Changed: `noClick: true` on dropzone config
  - Overlay only appears during drag events
  - Upload button at bottom explicitly triggers file dialog
- **Added MCP servers:** context7, firebase, stripe for real-time docs and integrations
- **Added Skills Library** at `.claude/skills/`:
  - `nextjs-app-router` - Server Components, Actions, Middleware patterns
  - `firebase-auth` - Complete auth with session cookies, OAuth, protected routes
  - `stripe-billing` - Checkout, subscriptions, webhooks, customer portal
  - Skills registry (`index.json`) with detection patterns
  - Template for creating new skills
- **Integrated Skills into Prompt Generation**:
  - Created `skillsService.js` with detection and loading logic
  - `generatePrompt()` now auto-detects integrations from research/features/PRD
  - Injects Quick Start patterns from Skills Library into prompts
  - Adds MCP usage instructions (e.g., "use context7 for latest Stripe docs")
  - Frontend shows detected integrations with badges in ExportStep
  - Foundational skills (like nextjs-app-router) always included

---

## Architecture Documentation

For detailed technical architecture and implementation plans:
- **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** - 📋 **START HERE** - Complete step-by-step implementation guide
- **[ARCHITECTURE-FINAL.md](./ARCHITECTURE-FINAL.md)** - Final multi-model strategy with benchmark plan
- **[API INFO & PRICING.md](./API%20INFO%20&%20PRICING.md)** - ⭐ **ALWAYS CHECK THIS FIRST** when selecting AI models - Verified OpenRouter pricing data (updated 2025-12-25)
- **[MODEL-ANALYSIS.md](./MODEL-ANALYSIS.md)** - Model tier rankings and task-specific recommendations
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Original analysis (historical reference)

---

## Files to Edit for Common Changes

| What to Change | File |
|----------------|------|
| AI prompts/behavior | `backend/services/aiService.js` |
| AI architecture/models | `backend/config/models.js` |
| Main app state | `src/stores/useAppStore.js` |
| Design studio state | `src/stores/useDesignStudioStore.js` |
| Template archetypes | `src/data/templates/archetypes/schema.js` |
| Template matching | `src/services/archetypeMatchingService.js` |
| API client | `src/services/aiService.js` |
| Main workflow components | `src/components/{step}/*.jsx` |
| Design workflow components | `src/components/design/workflow/*.jsx` |
| Backend routes | `backend/server.js` |
| Styling | `src/index.css` + component classes |
| Dev server port | `vite.config.js` |

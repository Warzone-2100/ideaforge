# IdeaForge - Overview for Claude Assistant

**Last Updated:** December 27, 2025

---

## What is IdeaForge?

IdeaForge is a **research-to-code ideation assistant** that transforms raw research into production-ready coding instructions and design systems. It's built for product builders who want to go from idea validation to implementation quickly and systematically.

**Core Philosophy:**
- Research-driven: Everything starts from user research and market insights
- AI-augmented: Uses multiple AI models (Claude, Gemini, GPT) strategically based on task complexity
- Specification-focused: Creates detailed specs (PRDs, design briefs, user stories) before code
- Agent-ready: Outputs optimized prompts for Claude Code, Cursor, and other AI coding agents

---

## Current Features (Production)

### 1. Research Analysis
- **Input:** Raw research text (interviews, surveys, competitor analysis, market reports)
- **Output:** Structured insights across 5 categories
  - Market insights
  - Competitor gaps
  - Pain points
  - Technical requirements
  - Success metrics
- **AI Model:** Gemini 2.5 Flash Lite (SPEED tier - pattern extraction)

### 2. Feature Generation
- **Input:** Research + insights
- **Output:** Detailed feature specifications with:
  - User stories
  - Acceptance criteria
  - Edge cases
  - Dependencies
  - Priority levels
  - Complexity estimates
- **Interactive:** Accept/reject features, chat to refine
- **AI Model:** Claude 4.5 Haiku (MEDIUM tier - structured generation)

### 3. PRD Generation
- **Input:** Accepted features + research context
- **Output:** Complete Product Requirements Document
  - Executive summary
  - User personas
  - Feature breakdown
  - Technical requirements
  - Success metrics
  - Timeline considerations
- **AI Model:** Claude 4.5 Sonnet (MAX tier - critical specifications)

### 4. Technical Specifications (NEW)
Three specialized documents that reference the PRD:
- **Database Schema:** Tables, relationships, indexes, constraints
- **API Endpoints:** Routes, request/response formats, auth patterns
- **Component Tree:** Frontend component hierarchy and data flow

### 5. Design System Studio
Multi-step collaborative design workflow:

**Step A: Design Brief Generation**
- Input: Research, insights, features
- Output: Complete design system specification
  - Visual identity (mood, philosophy, brand personality)
  - Design tokens (colors, typography, spacing, shadows, transitions)
  - Component patterns (buttons, inputs, cards, navigation)
  - Interaction patterns (hover, focus, loading states)
  - Accessibility guidelines
  - Product references (e.g., "like Linear's command palette")
- AI Model: Gemini 3 Flash (MEDIUM tier)

**Step B: Design System Editor** ⭐ NEW
Collaborative refinement interface:
- **Chat Tab:** Conversational editing ("make primary color more vibrant")
- **Manual Edit Tab:** Direct control over color tokens and typography
- **Live Preview:** Real-time preview of changes
- **Regenerate Brief:** AI updates entire design brief when tokens change
  - Detects what changed (e.g., "primary changed from blue to purple")
  - Rewrites visual identity, mood, component patterns to match
  - Maintains consistency across all sections
- AI Models:
  - Chat: Gemini 2.5 Flash Lite (SPEED tier)
  - Regeneration: Claude 4.5 Sonnet (MAX tier)

**Step C: Design Variations**
- Generates 3 UI variations of design brief as interactive HTML/CSS
- Currently: 3 runs of same model (Gemini 3 Flash) with high temperature
- Issue: Variations too similar, especially for dashboards
- Cost: ~$0.02 per generation (3 variations)

**Step D: Expansion to Full Page**
- Expands selected variation into complete homepage
- Production-ready HTML/CSS with design tokens applied
- AI Model: Claude 4.5 Sonnet (MAX tier)

### 6. Story Files (BMAD Method 2025)
- **Input:** Features, PRD, technical specs
- **Output:** Atomic, independently implementable user stories
  - PRD traceability (links to specific FR/NFR numbers)
  - Security requirements section (auth, validation, rate limiting)
  - Architectural decisions (WHY patterns were chosen)
  - Research validation (direct quotes from original research)
  - Implementation tasks mapped to acceptance criteria
  - Validation checkpoints (functional, technical, security)
  - Status: `draft` (BMAD 2025 standard)
- **AI Model:** Claude 4.5 Sonnet (MAX tier)
- **Format:** Exceeds official BMAD Method standards with enhanced traceability

### 7. Export & Prompts
Generates agent-specific coding instructions:
- **Claude Code:** XML-tagged format with MCP server usage
- **Cursor:** .cursorrules with MDC format
- **Gemini:** Hierarchical step-by-step format
- **Universal:** Works across all agents

Features:
- Auto-detects required integrations (Stripe, Firebase, etc.)
- Injects Quick Start patterns from Skills Library
- Includes MCP server usage instructions
- Exports skill files (SKILL.md) for detected integrations

### 8. Skills Library
Modular integration patterns at `.claude/skills/`:
- `nextjs-app-router` - Server Components, Actions, Middleware
- `firebase-auth` - Email/password, OAuth, session cookies
- `stripe-billing` - Checkout, subscriptions, webhooks

Auto-detected and injected into prompts based on feature requirements.

### 9. State Management
- **Zustand store** with localStorage persistence
- Full conversation history maintained
- Backward-compatible migrations
- Data flows forward through all steps (context accumulates)

### 10. Cost Tracking & Usage Stats
- Real-time cost tracking for all AI calls
- Model-by-model breakdown
- Token usage monitoring
- Success/failure rates
- Estimated session costs

---

## Architecture Overview

### Multi-Model Strategy (Tier-Based Routing)
IdeaForge uses different AI models based on task complexity:

| Tier | Models | Use Cases | Cost |
|------|--------|-----------|------|
| SPEED | Gemini 2.5 Flash Lite, Grok Fast | Pattern extraction, chat, refinement | $0.10/$0.40 per 1M tokens |
| MEDIUM | Claude Haiku, Gemini 3 Flash | Structured generation, design briefs | $1/$5 per 1M tokens |
| MAX | Claude 4.5 Sonnet, GPT-5.2 | Critical specs (PRD, stories, prompts) | $3/$15 per 1M tokens |

**Cost per full session:** ~$0.11 (86% cheaper than all-Claude Sonnet approach)

### Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Express.js (Node.js)
- **AI Gateway:** OpenRouter (unified API for all models)
- **State:** Zustand with localStorage
- **Styling:** Dark theme (zinc palette, indigo/violet accents)

### MCP Servers
- `context7` - Fetch up-to-date library documentation
- `firebase` - Firebase project access, Auth, Firestore
- `stripe` - Stripe API patterns (needs API key)
- `filesystem` - Local file operations

---

## What's Coming Next

### 🚀 Template Inspiration System (In Development)
**The Problem:**
- Current design variations are too similar (same model → similar outputs)
- Generating full HTML/CSS from scratch is expensive (~$0.02)
- Users want designs that match their personal taste

**The Solution:**
User-uploaded inspiration templates - "Personal Design Studio"

**How It Works:**
1. **User finds design they love** (Figma, Dribbble, Awwwards, competitor sites)
2. **Upload to IdeaForge:**
   - Screenshot → AI vision analyzes layout/structure
   - HTML/CSS code → Parse and extract patterns
   - URL → Scrape and analyze
3. **AI analyzes template:**
   - Layout structure (sidebar-left? top-nav? grid?)
   - Component patterns (cards, tables, forms)
   - Color palette extraction
   - Typography system
   - Mood/aesthetic classification
4. **Generate customized version:**
   - Keep template's proven layout
   - Apply user's design brief tokens (colors, fonts, brand)
   - Result: Professional structure + unique brand identity

**Benefits:**
- ✅ Infinite variety (users bring their own inspiration)
- ✅ No template maintenance (community-curated)
- ✅ Personal taste reflected
- ✅ Competitive analysis tool ("build like Stripe")
- ✅ Learn from professional designs
- ✅ Viral potential ("turned this Dribbble shot into my app")

**Implementation Phases:**
- **Phase 1:** Screenshot upload + vision analysis
- **Phase 2:** Code upload + parsing
- **Phase 3:** Template library with search/browse
- **Phase 4:** Figma integration (direct import)

**Cost:** ~$0.03 per screenshot analysis (vision model)

---

## User Workflow

```
1. RESEARCH
   Paste research content → AI analyzes

2. FEATURES
   AI generates features → Accept/reject → Refine via chat

3. PRD
   AI creates product requirements document

4. TECHNICAL SPECS
   AI generates database schema, API endpoints, component tree

5. DESIGN STUDIO
   A. Generate design brief with tokens/patterns
   B. Edit via chat or manual controls → Regenerate brief
   C. Generate 3 UI variations (or from uploaded templates)
   D. Expand selected variation to full page

6. STORIES
   AI generates BMAD-style atomic user stories

7. EXPORT
   Generate agent-specific prompts (Claude/Cursor/Gemini)
   Download skill files for detected integrations
```

**Key Principle:** Each step builds on previous context. The AI has full conversation history, so PRD references features, features reference insights, etc.

---

## Design Philosophy

### Visual Design
- **Dark-first:** Zinc palette (#09090B base)
- **Accent colors:** Indigo/violet gradients
- **Typography:** System fonts, clear hierarchy
- **Spacing:** Generous whitespace, 8px grid
- **Components:** Rounded corners (0.5-1rem), subtle shadows
- **No emojis** in generated content (unless user requests)

### AI Prompt Strategy
All prompts designed to **reject generic output:**
- Require specific evidence/quotes from research
- Ban phrases like "clean and modern", "user-friendly"
- Use FR format: "FR#: [Actor] can [capability]"
- Design briefs require exact hex colors, named product references
- Features must have unique acceptance criteria, not boilerplate

### Error Handling
- Automatic fallback models if primary fails
- Defensive defaults for undefined state
- Graceful degradation
- Detailed error messages with context

---

## Known Issues & Limitations

1. **Design variations too similar** → Template inspiration system will fix
2. **No design version history** → Users can't compare previous iterations
3. **No collaborative features** → Single-user only
4. **No Figma export** → Only HTML/CSS output currently
5. **Template regeneration can be slow** → Using Claude Sonnet (5-10s)

---

## Future Vision

**Short-term (Next 2 months):**
- Template inspiration system (upload screenshots/code)
- Design version history
- Component library export
- Multi-page design system (Landing, Dashboard, Settings, etc.)

**Medium-term (3-6 months):**
- Team collaboration features
- Figma plugin (direct export)
- Template marketplace (community sharing)
- Real-time preview with hot reload

**Long-term (6-12 months):**
- Full design-to-code pipeline
- A/B testing for design variations
- Analytics integration
- Custom AI model fine-tuning on user's brand

---

## For Claude Assistants Working on This Project

**When helping with IdeaForge:**
- Focus on the **research → specification → code** flow
- Maintain the tier-based AI model strategy (don't use expensive models for simple tasks)
- Keep design briefs **specific and non-generic** (exact colors, named references)
- All new features should accumulate context from previous steps
- Test with the actual workflow (Research → Features → PRD → Design)
- Cost-conscious: Track token usage, prefer efficient approaches
- User experience: Fast feedback, clear progress indicators, no jargon

**Key Files:**
- `CLAUDE.md` - Complete technical documentation
- `ARCHITECTURE-FINAL.md` - Multi-model strategy details
- `API INFO & PRICING.md` - Model pricing (always check this first)
- `backend/services/aiService.js` - All AI prompts and logic
- `src/stores/useAppStore.js` - Full state management

**Current Priority:**
Building the template inspiration system - let users upload designs they love and generate customized versions with their brand tokens.

---

## Success Metrics

**User Success:**
- Research → Deployed app in < 1 week
- Design brief quality: Specific, actionable, non-generic
- Cost per session: < $0.15
- User satisfaction with generated designs

**Technical Success:**
- 95%+ AI call success rate
- < 10s response time for all generations
- Zero data loss (localStorage + migrations)
- Cost efficiency: 80%+ cheaper than all-premium models

---

*IdeaForge turns raw research into production-ready specifications and designs. The goal: Empower builders to go from idea to implementation with AI-augmented clarity and speed.*

# Specification-Focused Framework Implementation

**Implementation Date:** 2025-12-26
**Status:** ✅ Complete - Ready for Testing

## Overview

IdeaForge has been upgraded from an **implementation-focused** approach (generating code examples) to a **specification-focused** approach (generating pure requirements that AI developers use with modern tooling).

### Core Philosophy Change

**OLD:** Story files contained TypeScript interfaces, React code examples, API route snippets
**NEW:** Story files reference centralized specification documents (DATABASE_SCHEMA.md, API_ENDPOINTS.md, COMPONENT_TREE.md) and instruct AI developers to use context7, LSP, and subagents

## What Changed

### 1. Backend - New AI Functions (/backend/services/aiService.js)

Added **3 new specification generation functions**:

```javascript
// Lines 730-834
export async function generateDatabaseSchema(features, prd)
// Generates DATABASE_SCHEMA.md with:
// - Field-level specs (name, type, validation, purpose)
// - Security rules (who can read/write)
// - Index requirements (which fields, why)
// - CRUD operation requirements

// Lines 839-961
export async function generateApiEndpoints(features, databaseSchema, prd)
// Generates API_ENDPOINTS.md with:
// - Input/output requirements
// - Business logic step-by-step
// - Error response conditions
// - Rate limiting specs

// Lines 966-1111
export async function generateComponentTree(features, apiEndpoints, prd)
// Generates COMPONENT_TREE.md with:
// - Component hierarchy (parent-child)
// - Props requirements (name, type, purpose)
// - State requirements (what, why, when)
// - User interaction flows
```

**Updated existing function:**

```javascript
// Line 1116
export async function generateStoryFiles(features, prd, databaseSchema, apiEndpoints, componentTree)
// Now accepts 5 parameters (was 2)
// Uses specification-focused prompt
// Story files reference spec docs instead of containing code examples
```

### 2. Backend - New API Routes (/backend/server.js)

Added **3 new endpoints**:

```javascript
POST /api/schema/generate
// Input: { features, prd }
// Output: { success: true, schema: "DATABASE_SCHEMA.md content", _meta: {...} }

POST /api/endpoints/generate
// Input: { features, databaseSchema, prd }
// Output: { success: true, endpoints: "API_ENDPOINTS.md content", _meta: {...} }

POST /api/components/generate
// Input: { features, apiEndpoints, prd }
// Output: { success: true, components: "COMPONENT_TREE.md content", _meta: {...} }
```

**Updated existing endpoint:**

```javascript
POST /api/stories/generate
// Now accepts: { features, prd, databaseSchema, apiEndpoints, componentTree }
// Generates spec-focused stories that reference the 3 docs above
```

### 3. Model Configuration (/backend/config/models.js)

Added **3 new model configs**:

```javascript
databaseSchema: {
  primary: 'anthropic/claude-4.5-sonnet-20250929',  // MAX BRAIN tier
  fallback: 'openai/gpt-5.2',
  maxTokens: 10000,
  temperature: 0.7,
}

apiEndpoints: {
  primary: 'anthropic/claude-4.5-sonnet-20250929',  // MAX BRAIN tier
  fallback: 'openai/gpt-5.2',
  maxTokens: 12000,
  temperature: 0.7,
}

componentTree: {
  primary: 'anthropic/claude-4.5-haiku-20251001',   // MEDIUM tier
  fallback: 'google/gemini-3-flash-preview',
  maxTokens: 10000,
  temperature: 0.7,
}
```

**Reasoning:**
- DATABASE_SCHEMA: MAX BRAIN - Critical for data modeling correctness
- API_ENDPOINTS: MAX BRAIN - Critical for business logic accuracy
- COMPONENT_TREE: MEDIUM - Frontend architecture, less critical than backend

### 4. Frontend - Zustand Store (/src/stores/useAppStore.js)

Added **3 new state sections**:

```javascript
// Lines 48-64
databaseSchema: {
  content: null,
  isGenerating: false,
}

apiEndpoints: {
  content: null,
  isGenerating: false,
}

componentTree: {
  content: null,
  isGenerating: false,
}
```

Added **6 new actions**:

```javascript
setDatabaseSchema(content)
setApiEndpoints(content)
setComponentTree(content)
setDatabaseSchemaGenerating(isGenerating)
setApiEndpointsGenerating(isGenerating)
setComponentTreeGenerating(isGenerating)
```

Added **3 new tracking entries**:

```javascript
usageTracking: {
  byTask: {
    databaseSchema: { requests: 0, tokens: 0, cost: 0 },
    apiEndpoints: { requests: 0, tokens: 0, cost: 0 },
    componentTree: { requests: 0, tokens: 0, cost: 0 },
    // ... existing tasks
  }
}
```

**Updated persistence** (localStorage):

```javascript
partialize: (state) => ({
  databaseSchema: state.databaseSchema,   // NEW
  apiEndpoints: state.apiEndpoints,       // NEW
  componentTree: state.componentTree,     // NEW
  // ... existing fields
})
```

### 5. Frontend - API Client (/src/services/aiService.js)

Added **3 new API methods**:

```javascript
async generateDatabaseSchema(acceptedFeatures, prdContent)
async generateApiEndpoints(acceptedFeatures, databaseSchema, prdContent)
async generateComponentTree(acceptedFeatures, apiEndpoints, prdContent)
```

**Updated existing method:**

```javascript
async generateStories(features, prdContent, databaseSchema, apiEndpoints, componentTree)
// Now accepts 5 parameters (was 2)
```

All methods include:
- ✅ Usage tracking with `trackUsage()`
- ✅ Error handling
- ✅ Proper request/response formatting

## How It Works

### New Workflow Sequence

**OLD (4 steps):**
1. Analysis → 2. Features → 3. PRD → 4. Story Files

**NEW (7 steps):**
1. Analysis
2. Features
3. PRD
4. **DATABASE_SCHEMA** ← NEW!
5. **API_ENDPOINTS** ← NEW!
6. **COMPONENT_TREE** ← NEW!
7. Story Files (now references above 3 docs)

### Data Flow

```
Features + PRD
    ↓
DATABASE_SCHEMA.md (collections, fields, security, indexes)
    ↓
API_ENDPOINTS.md (inputs, outputs, business logic, errors)
    ↓
COMPONENT_TREE.md (pages, components, props, state)
    ↓
Story Files (reference all 3 specs + include MCP usage instructions)
```

### Story File Structure (NEW Format)

```markdown
# Story 1.1: Recipe Import from URL

**Status:** ready-for-dev
**Priority:** mvp
**Complexity:** medium
**Depends On:** None
**Blocks:** Story 1.2

---

## Database Schema Specification

**Reference:** DATABASE_SCHEMA.md → Collection: `recipes`

**Key Requirements:**
- Required fields: userId, url, title, ingredients[], steps[], servings
- Security: User-scoped (userId === auth.uid)
- Indexes: Composite on userId + createdAt for recent recipes query

---

## API Endpoints Specification

**Reference:** API_ENDPOINTS.md → POST `/api/recipes/import`

**Key Requirements:**
- Input validation: url (valid URL), userId (from auth)
- Business logic: Fetch URL → Parse recipe → Validate → Save to Firestore
- Error handling: 400 (invalid URL), 422 (parse failed), 500 (DB error)

---

## Component Architecture Specification

**Reference:** COMPONENT_TREE.md → RecipeImportForm

**Key Requirements:**
- Page type: Client Component (form interactivity)
- Components: RecipeImportForm, UrlInput, ImportButton, ErrorDisplay
- Props: onSubmit(url), isLoading
- State: url, validationErrors, isSubmitting

---

## MCP Usage

When implementing this story:

```
Use context7 to fetch latest Next.js 14 App Router docs
Use context7 to fetch latest Firebase Firestore v9 SDK patterns
Use Explore subagent to find existing API patterns in codebase
```

---

## Validation Checkpoint ✅

**STOP and test before proceeding**

### Functional Tests:
- [ ] Page renders without errors
- [ ] URL validation works
- [ ] Recipe data persists correctly

### Technical Tests:
- [ ] TypeScript builds
- [ ] All acceptance criteria met
- [ ] Security rules tested
```

**Key differences from OLD format:**
- ❌ NO TypeScript interfaces
- ❌ NO React component code
- ❌ NO API route examples
- ✅ References to centralized spec docs
- ✅ MCP tool usage instructions
- ✅ Validation checkpoints

## Testing Instructions

### Backend Testing

1. **Start backend:**
   ```bash
   cd backend
   npm run dev  # Port 3001
   ```

2. **Test new endpoints:**
   ```bash
   # Test DATABASE_SCHEMA generation
   curl -X POST http://localhost:3001/api/schema/generate \
     -H "Content-Type: application/json" \
     -d '{"features": [...], "prd": "..."}'

   # Test API_ENDPOINTS generation
   curl -X POST http://localhost:3001/api/endpoints/generate \
     -H "Content-Type: application/json" \
     -d '{"features": [...], "databaseSchema": "...", "prd": "..."}'

   # Test COMPONENT_TREE generation
   curl -X POST http://localhost:3001/api/components/generate \
     -H "Content-Type: application/json" \
     -d '{"features": [...], "apiEndpoints": "...", "prd": "..."}'

   # Test updated STORIES generation
   curl -X POST http://localhost:3001/api/stories/generate \
     -H "Content-Type: application/json" \
     -d '{"features": [...], "prd": "...", "databaseSchema": "...", "apiEndpoints": "...", "componentTree": "..."}'
   ```

### Frontend Testing

1. **Start frontend:**
   ```bash
   npm run dev  # Port 8000
   ```

2. **Full workflow test:**
   - Go to http://localhost:8000
   - Paste research (use Recipe Saver App from test)
   - Run Analysis
   - Accept features
   - Generate PRD
   - **NEW:** Generate Database Schema
   - **NEW:** Generate API Endpoints
   - **NEW:** Generate Component Tree
   - Generate Story Files (should reference the 3 new docs!)
   - Check exports include DATABASE_SCHEMA.md, API_ENDPOINTS.md, COMPONENT_TREE.md

3. **Verify:**
   - ✅ Story files reference spec docs (not inline code)
   - ✅ Story files include MCP usage instructions
   - ✅ Story files include validation checkpoints
   - ✅ All 3 spec docs are generated with proper content
   - ✅ Token tracking works for new tasks
   - ✅ localStorage persistence includes new docs

## Expected Behavior

### Success Indicators

**When generating specs:**
- DATABASE_SCHEMA.md contains field specs, security rules, indexes
- API_ENDPOINTS.md contains request/response specs, business logic
- COMPONENT_TREE.md contains component hierarchy, props, state

**When generating stories:**
- Story files NO LONGER contain TypeScript/React code examples
- Story files REFERENCE the 3 spec docs
- Story files include context7 usage instructions (e.g., "Use context7 to fetch latest Next.js 14 App Router docs")
- Story files include validation checkpoints

**Cost/performance:**
- Database Schema: ~$0.03/generation (MAX BRAIN tier)
- API Endpoints: ~$0.03/generation (MAX BRAIN tier)
- Component Tree: ~$0.01/generation (MEDIUM tier)
- Total added cost: ~$0.07 per session

## Rollback Plan

If issues arise, revert these files:

```bash
cd /Users/ardi/Desktop/Apps/addons/ideaforge

# Backend
git checkout backend/services/aiService.js
git checkout backend/server.js
git checkout backend/config/models.js

# Frontend
git checkout src/stores/useAppStore.js
git checkout src/services/aiService.js
```

## Next Steps

### Required (for NEW workflow to work):

1. **Update PRDStep component** to trigger spec generation after PRD
   - Add 3 new buttons: "Generate Database Schema", "Generate API Endpoints", "Generate Component Tree"
   - Or make it automatic (generate all 3 after PRD completes)

2. **Update StoryFilesStep component** to pass new specs to generateStories()
   - Currently: `aiService.generateStories(features, prd)`
   - Should be: `aiService.generateStories(features, prd, databaseSchema, apiEndpoints, componentTree)`

3. **Update ExportStep** to include new docs in exports
   - Add DATABASE_SCHEMA.md to zip
   - Add API_ENDPOINTS.md to zip
   - Add COMPONENT_TREE.md to zip

### Optional (improvements):

1. **Add UI visualization** for spec docs
   - Markdown renderer for DATABASE_SCHEMA
   - Syntax highlighting for API specs
   - Tree view for Component Tree

2. **Add spec doc editors**
   - Allow users to refine schemas before story generation
   - Add chat refinement for specs (like features chat)

3. **Add validation**
   - Check all required collections are defined
   - Verify API endpoints match database schema
   - Ensure components reference valid API endpoints

## Success Metrics

This implementation is successful if:

- ✅ Backend generates all 3 spec docs without errors
- ✅ Story files reference spec docs (not code)
- ✅ Story files include MCP usage instructions
- ✅ Token tracking captures all new tasks
- ✅ localStorage persists new docs
- ✅ Exports include all new docs

**Test with Recipe Saver App prompt from `TEST-INSTRUCTIONS.md` to validate end-to-end!**

---

## Files Modified

### Backend (3 files)
- `/backend/services/aiService.js` - Added 3 functions, updated 1 function
- `/backend/server.js` - Added 3 routes, updated 1 route
- `/backend/config/models.js` - Added 3 model configs

### Frontend (2 files)
- `/src/stores/useAppStore.js` - Added 3 state sections, 6 actions, 3 tracking entries
- `/src/services/aiService.js` - Added 3 methods, updated 1 method

### Documentation (1 file)
- **THIS FILE** - Complete implementation guide

---

**Ready to test!** 🚀

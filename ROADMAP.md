# IdeaForge Roadmap

**Last Updated:** 2025-12-25

---

## 🚀 Current Status

**v1.0 - 8-Step Workflow** ✅ Complete
- Research → Analysis → Features → PRD → Agent Prompts → Design Studio → Story Files → Final Export
- ZIP export with organized folders
- Multi-model AI routing (Gemini, Claude, GPT)
- localStorage persistence

---

## 📋 Planned Features

### High Priority

#### 1. Multi-Page Design System 🎨
**Status:** Idea (discovered during live testing 2025-12-25)
**Problem:** Currently only generates landing page. Users want dashboard/app UI designs too.
**Solution:** Expand Design Studio to generate multiple page types with variations.

```
Design Studio (Enhanced):
├── 1. Landing Page (marketing)
│   ├── Design preferences
│   ├── 3 variations
│   └── Full page expansion
│
├── 2. Dashboard/App UI (main app interface)
│   ├── Design preferences
│   ├── 3 variations
│   └── Full page expansion
│
├── 3. Settings Page
├── 4. Profile Page
└── [Other key pages]
```

**Benefits:**
- Complete design system for entire app (not just landing page)
- Claude Code gets full UI reference for implementation
- Reduces "Claude reinventing the wheel"
- Variations show different layouts/approaches

**Implementation:**
- Add page type selector in Design Studio
- Update `/api/design/generate` to accept `pageType` parameter
- Update prompts to generate page-specific designs
- Store multiple pages in `designVariations` state
- Export all pages in ZIP under `design/pages/`

**Effort:** ~1-2 days

---

#### 2. Database Persistence (Supabase)
**Status:** Planned (from SESSION-HANDOFF.md)
**Problem:** localStorage only, no user accounts, data loss on browser clear
**Solution:** Migrate to Supabase with authentication

**Tasks:**
- Setup Supabase project
- Create database schema (see SESSION-HANDOFF.md)
- Add authentication UI (email/password, OAuth)
- Migrate localStorage → Supabase
- Add workflow management UI (view/edit/delete past workflows)

**Effort:** 2-3 days

---

#### 3. Deployment (Vercel + Supabase)
**Status:** Planned (from SESSION-HANDOFF.md)
**Problem:** Local only, can't share with others
**Solution:** Deploy to Vercel with Supabase backend

**Tasks:**
- Restructure backend → Vercel Functions
- Setup Vercel project
- Add environment variables
- Deploy to staging
- Test production environment
- Deploy to production

**Effort:** 1 day

---

### Medium Priority

#### 4. Skills Library Auto-Detection
**Status:** Partially implemented
**Enhancement:** Better detection of integrations from research/PRD

**Tasks:**
- Improve pattern matching in `skillsService.js`
- Add more skills (Stripe, Firebase, Auth0, etc.)
- Auto-inject skill patterns into agent prompts
- Show detected skills in UI with badges

**Effort:** ~1 day

---

#### 5. Export Format Improvements
**Status:** Working, could be better

**Enhancements:**
- Add more agent formats (Windsurf, Copilot, etc.)
- Better prompt templates
- Include design screenshots in ZIP automatically
- Add code structure suggestions

**Effort:** ~1-2 days

---

### Low Priority

#### 6. Feature Refinement Chat Improvements
**Status:** Working but basic

**Enhancements:**
- Better chat UI (thread view)
- Suggested prompts ("Add authentication", "Make it mobile-first")
- Undo/redo for feature changes
- Chat history export

**Effort:** ~2-3 days

---

#### 7. AI Model Selection
**Status:** Fixed tier-based routing

**Enhancement:** Let users choose model per step

**Why:**
- Power users want control
- Cost-conscious users want cheapest
- Quality-focused users want best

**Effort:** ~1 day

---

## 🐛 Known Issues

### From Live Testing (2025-12-25)

- ✅ **FIXED:** PRD navigation skipped steps 5-7
- ✅ **FIXED:** Step counters showed "X of 5" instead of "X of 8"
- ✅ **FIXED:** "New Project" didn't clear Design Studio/Story Files
- ⏳ **Testing:** Full E2E workflow with real data (in progress)

---

## 💡 Ideas (Not Prioritized)

- **Collaboration:** Share workflows with team, comments, approvals
- **Version Control:** Track changes to PRD/features over time
- **Templates:** Pre-built research templates for common app types
- **Analytics:** Track which features get accepted/rejected most
- **Export to Notion/Confluence:** One-click export to documentation tools
- **AI Feedback Loop:** Learn from user edits to improve future generations

---

## 📝 Notes

- Features added during live testing should be documented here immediately
- "Farting in the air" is not a valid documentation strategy 😂
- Update this file whenever you have an idea or complete a feature

---

**End of Roadmap**

# Design Studio Refactor - Handoff Document

**Date:** 2025-12-27
**Status:** ✅ Implementation Complete, Pending Testing & Cleanup

---

## Summary

Successfully extracted Design Studio from the monolithic `useAppStore.js` into a separate `/design-studio` route with its own dedicated Zustand store.

### What Was Done
- Created new `useDesignStudioStore.js` with flat state structure (vs 4-5 level nesting)
- Added React Router (already installed, now enabled) with lazy loading
- Created adapter hook for backward compatibility
- Added auto-migration from old localStorage format
- Added navigation links in Header and Sidebar
- Removed 'design' step from main flow (now 7 steps instead of 8)

---

## URLs for Testing

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8000 |
| Backend | http://localhost:3001 |
| Design Studio | http://localhost:8000/design-studio |

---

## New Files Created

| File | Purpose |
|------|---------|
| `src/stores/useDesignStudioStore.js` | New dedicated store with flat structure |
| `src/utils/designStudioMigration.js` | Migration utilities (detect, migrate, validate) |
| `src/hooks/useDesignStudioAdapter.js` | Backward-compatible API for components |
| `src/pages/DesignStudioPage.jsx` | Standalone page with header + import modal |
| `src/components/MainFlow.jsx` | Extracted main flow (7 steps, no design) |
| `src/components/design/ImportContextModal.jsx` | Modal to import from PRD/research |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/main.jsx` | Added BrowserRouter wrapper |
| `src/App.jsx` | Replaced step rendering with Routes + lazy loading |
| `src/components/layout/Header.jsx` | Added Design Studio link |
| `src/components/layout/Sidebar.jsx` | Removed design step, added external link, fixed progress counter |
| `src/components/design/DesignStudioStep.jsx` | Use adapter hook, removed step navigation |
| `src/components/design/DesignVariationsStep.jsx` | Use adapter hook |
| `src/components/design/DesignSystemEditor.jsx` | Use adapter hook |
| `src/components/design/DesignChatPanel.jsx` | Use adapter hook |
| `src/components/design/PageSelector.jsx` | Use adapter hook |
| `src/components/design/TemplateUploadModal.jsx` | Removed unused import |

---

## State Structure Comparison

### Old (Nested) - in useAppStore.js
```javascript
designVariations: {
  designBrief: null,
  editedDesignBrief: null,
  isEditingDesignBrief: false,
  currentPage: 'landing',
  pages: {
    landing: {
      variations: [],
      selectedVariation: null,
      fullPage: null,
      isGenerating: false,
    },
    // ... more nested pages
  },
  templateLibrary: {
    builtIn: [],
    custom: [],
    selectedTemplate: null,
  },
  // ... more nested objects
}
```

### New (Flat) - in useDesignStudioStore.js
```javascript
{
  // Templates (flat)
  customTemplates: [],
  selectedTemplateId: null,
  isUploadingTemplate: false,

  // Brief (flat)
  originalBrief: null,
  editedBrief: null,
  isEditingBrief: false,
  briefChatMessages: [],

  // Pages (one level of nesting only)
  currentPageId: 'landing',
  pagesData: {
    landing: { variations: [], selectedId: null, ... },
    dashboard: { ... },
    settings: { ... },
    profile: { ... },
  },

  // Preferences (flat)
  sharedPreferences: { palette, style, references, mood },
  pageOverrides: { landing, dashboard, settings, profile },

  // UI (flat)
  activePanel: 'templates',
  error: null,

  // Context (flat)
  importedContext: null,
}
```

---

## Migration System

### How It Works
1. On `useDesignStudioStore` rehydration (from localStorage)
2. Check if new store is empty but old store has `designVariations`
3. Auto-migrate: transform nested → flat structure
4. Store in new localStorage key `ideaforge-design-studio`

### Functions Available
```javascript
import {
  detectOldFormat,      // Check if old data exists
  migrateToNewFormat,   // Transform data structure
  validateMigration,    // Ensure data integrity
  performMigration,     // Full migration
  cleanupOldData        // Remove old designVariations (optional)
} from '../utils/designStudioMigration';
```

---

## Testing Checklist

### Main Flow (http://localhost:8000)
- [ ] All 7 steps work (Research → Analysis → Features → PRD → Prompts → Stories → Export)
- [ ] Design Studio link visible in Header
- [ ] Design Studio link visible in Sidebar (under "Tools")
- [ ] Progress bar shows correct count (X/7)
- [ ] Can complete full workflow without errors

### Design Studio (http://localhost:8000/design-studio)
- [ ] Page loads with lazy loading (brief loading spinner)
- [ ] "Back to IdeaForge" link works
- [ ] Template library displays built-in templates
- [ ] Can upload custom template
- [ ] Can generate design brief from template
- [ ] Can edit design brief via chat
- [ ] Page type selector works (Landing, Dashboard, etc.)
- [ ] Can generate variations
- [ ] "Import from PRD" button opens modal
- [ ] Import modal shows data from main store

### Migration (if you have existing data)
- [ ] Old localStorage data (`ideaforge-storage.designVariations`) detected
- [ ] Auto-migrated to new store (`ideaforge-design-studio`)
- [ ] Migration banner shown (if migration occurred)
- [ ] All design data preserved

### Navigation
- [ ] Can navigate from main flow → Design Studio
- [ ] Can navigate from Design Studio → main flow
- [ ] Browser back/forward buttons work
- [ ] Direct URL access works (/design-studio)

---

## Remaining Tasks (Phase 5 - Optional)

These were deferred until testing confirms everything works:

### 5.1 Remove Design State from Main Store
**File:** `src/stores/useAppStore.js`
- Remove `designVariations` from initial state (~line 50-100)
- Remove ~30 design-related actions
- This will reduce store from 1070 lines significantly

### 5.2 Cleanup Old localStorage
**When:** After confirming migration worked
```javascript
// In designStudioMigration.js
cleanupOldData(); // Removes designVariations from ideaforge-storage
```

### 5.3 Update CLAUDE.md
- Document new routing structure
- Document new store structure
- Add Design Studio section

---

## Rollback Strategy

If issues are found:

### Component Level
Revert adapter hook to use old store:
```javascript
// In useDesignStudioAdapter.js
import useAppStore from '../stores/useAppStore';
// Use useAppStore instead of useDesignStudioStore
```

### Route Level
Remove routes, restore design step in main flow:
```javascript
// In App.jsx - revert to step-based rendering
// In Sidebar.jsx - restore design step
```

### Full Rollback
```bash
git checkout HEAD -- src/stores/useAppStore.js src/components/design/ src/App.jsx src/main.jsx
```

---

## Build Verification

✅ Build succeeded with no errors:
```
vite v6.0.6 building for production...
✓ 1078 modules transformed.
dist/index.html                   0.53 kB │ gzip:  0.32 kB
dist/assets/index-DQ7sG5MZ.css   49.73 kB │ gzip: 10.44 kB
dist/assets/DesignStudioPage-Dq3dVYBl.js   206.74 kB │ gzip:  63.84 kB  ← Lazy loaded chunk
dist/assets/index-BCxcGj5j.js    517.70 kB │ gzip: 172.42 kB
✓ built in 3.07s
```

Design Studio is lazy-loaded as a separate 206KB chunk.

---

## Known Issues

None currently identified. Testing will reveal any issues.

---

## Questions for Next Session

1. **After testing**: Should we proceed with Phase 5 cleanup (remove old design state)?
2. **Documentation**: Should CLAUDE.md be updated with new architecture?
3. **Features**: Any additional Design Studio features to add now that it's modular?

---

## Files Quick Reference

```
src/
├── App.jsx                        # Routes (/, /design-studio)
├── main.jsx                       # BrowserRouter wrapper
├── stores/
│   ├── useAppStore.js            # Main store (still has designVariations)
│   └── useDesignStudioStore.js   # NEW: Design Studio store
├── hooks/
│   └── useDesignStudioAdapter.js # NEW: Backward compatibility
├── utils/
│   └── designStudioMigration.js  # NEW: Migration utilities
├── pages/
│   └── DesignStudioPage.jsx      # NEW: Standalone page
├── components/
│   ├── MainFlow.jsx              # NEW: Extracted main flow
│   ├── layout/
│   │   ├── Header.jsx            # Added Design Studio link
│   │   └── Sidebar.jsx           # Removed design step, added link
│   └── design/
│       ├── DesignStudioStep.jsx  # Uses adapter
│       ├── DesignVariationsStep.jsx
│       ├── DesignSystemEditor.jsx
│       ├── DesignChatPanel.jsx
│       ├── PageSelector.jsx
│       ├── TemplateUploadModal.jsx
│       └── ImportContextModal.jsx # NEW: Import modal
```

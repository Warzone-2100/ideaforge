// ============================================================================
// LAYOUT TEMPLATES - Structural Wireframes (The "Skeleton")
// ============================================================================
//
// These are STRUCTURAL layouts only - they define WHERE things go, not how
// they look. The design language (colors, fonts, spacing) is applied separately.
//
// Each layout has:
//   - id: Unique identifier
//   - name: Human-readable name
//   - description: What this layout is best for
//   - sections: Array of section types included
//   - wireframe: ASCII art representation
//   - structure: Programmatic structure definition
// ============================================================================

export const LAYOUT_TEMPLATES = {
  // ==========================================================================
  // LANDING PAGE LAYOUTS
  // ==========================================================================
  landing: [
    {
      id: 'hero-features-cta',
      name: 'Hero → Features → CTA',
      description: 'Classic landing page: hero section, feature grid, call-to-action',
      sections: ['hero', 'features', 'cta'],
      wireframe: `
┌────────────────────────────────┐
│           HERO                 │
│   Headline + CTA Button        │
├────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Feat │ │ Feat │ │ Feat │   │
│  └──────┘ └──────┘ └──────┘   │
├────────────────────────────────┤
│         CALL TO ACTION         │
└────────────────────────────────┘`,
      structure: {
        hero: { type: 'centered', hasImage: false },
        features: { type: 'grid', columns: 3 },
        cta: { type: 'centered' },
      },
    },
    {
      id: 'hero-social-features',
      name: 'Hero → Social Proof → Features',
      description: 'Adds social proof (logos, testimonials) for credibility',
      sections: ['hero', 'social-proof', 'features', 'cta'],
      wireframe: `
┌────────────────────────────────┐
│           HERO                 │
├────────────────────────────────┤
│   Logo  Logo  Logo  Logo       │
│      (Social Proof)            │
├────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Feat │ │ Feat │ │ Feat │   │
│  └──────┘ └──────┘ └──────┘   │
├────────────────────────────────┤
│         CALL TO ACTION         │
└────────────────────────────────┘`,
      structure: {
        hero: { type: 'centered', hasImage: false },
        socialProof: { type: 'logos', count: 4 },
        features: { type: 'grid', columns: 3 },
        cta: { type: 'centered' },
      },
    },
    {
      id: 'split-hero-benefits',
      name: 'Split Hero → Benefits → Features',
      description: 'Two-column hero with image/demo on one side',
      sections: ['split-hero', 'benefits', 'features', 'testimonials', 'cta'],
      wireframe: `
┌─────────────┬──────────────────┐
│   Text      │                  │
│   Headline  │    Image/Demo    │
│   CTA       │                  │
├─────────────┴──────────────────┤
│  ✓ Benefit  ✓ Benefit  ✓ Ben  │
├────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Feat │ │ Feat │ │ Feat │   │
│  └──────┘ └──────┘ └──────┘   │
├────────────────────────────────┤
│      "Testimonial quote"       │
├────────────────────────────────┤
│         CALL TO ACTION         │
└────────────────────────────────┘`,
      structure: {
        hero: { type: 'split', imagePosition: 'right' },
        benefits: { type: 'inline', count: 3 },
        features: { type: 'grid', columns: 3 },
        testimonials: { type: 'single' },
        cta: { type: 'centered' },
      },
    },
    {
      id: 'video-demo-features',
      name: 'Video/Demo → Features → Pricing',
      description: 'Video or interactive demo as hero, with pricing section',
      sections: ['video-hero', 'features', 'pricing', 'faq', 'cta'],
      wireframe: `
┌────────────────────────────────┐
│        ▶ VIDEO/DEMO            │
│           Headline             │
├────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Feat │ │ Feat │ │ Feat │   │
│  └──────┘ └──────┘ └──────┘   │
├────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌─────┐ │
│ │ Free   │ │ Pro    │ │Team │ │
│ │ $0     │ │ $19    │ │ $49 │ │
│ └────────┘ └────────┘ └─────┘ │
├────────────────────────────────┤
│         FAQ Section            │
└────────────────────────────────┘`,
      structure: {
        hero: { type: 'video', hasSubtitle: true },
        features: { type: 'grid', columns: 3 },
        pricing: { type: 'cards', tiers: 3 },
        faq: { type: 'accordion' },
        cta: { type: 'centered' },
      },
    },
  ],

  // ==========================================================================
  // DASHBOARD LAYOUTS
  // ==========================================================================
  dashboard: [
    {
      id: 'sidebar-header-main',
      name: 'Sidebar + Header + Main',
      description: 'Left sidebar navigation, top header with user menu, main content',
      sections: ['sidebar', 'header', 'main'],
      wireframe: `
┌──────┬─────────────────────────┐
│      │  Header    [User Menu] │
│      ├─────────────────────────┤
│ Nav  │                         │
│ ───  │    Main Content Area    │
│ Link │                         │
│ Link │    ┌─────┐ ┌─────┐     │
│ Link │    │Card │ │Card │     │
│      │    └─────┘ └─────┘     │
└──────┴─────────────────────────┘`,
      structure: {
        sidebar: { position: 'left', width: 240, collapsible: false },
        header: { height: 64, hasSearch: true, hasUserMenu: true },
        main: { type: 'fluid' },
      },
    },
    {
      id: 'sidebar-main',
      name: 'Sidebar + Main (No Header)',
      description: 'Clean sidebar with full-height main area, no top header',
      sections: ['sidebar', 'main'],
      wireframe: `
┌──────┬─────────────────────────┐
│      │                         │
│ Logo │    Main Content Area    │
│ ───  │                         │
│ Nav  │    ┌─────┐ ┌─────┐     │
│ Link │    │Card │ │Card │     │
│ Link │    └─────┘ └─────┘     │
│ Link │                         │
│      │    [User at bottom]     │
└──────┴─────────────────────────┘`,
      structure: {
        sidebar: { position: 'left', width: 240, hasLogo: true, hasUserSection: true },
        main: { type: 'fluid' },
      },
    },
    {
      id: 'collapsible-sidebar',
      name: 'Collapsible Sidebar + Main',
      description: 'Sidebar can collapse to icons only for more content space',
      sections: ['sidebar', 'header', 'main'],
      wireframe: `
┌───┬─────────────────────────────┐
│ ≡ │  Header           [Menu]   │
├───┼─────────────────────────────┤
│ ◉ │                             │
│ ◉ │      Main Content Area      │
│ ◉ │                             │
│ ◉ │   ┌──────┐  ┌──────┐       │
│   │   │ Card │  │ Card │       │
│   │   └──────┘  └──────┘       │
└───┴─────────────────────────────┘`,
      structure: {
        sidebar: { position: 'left', width: 240, collapsedWidth: 64, collapsible: true },
        header: { height: 56 },
        main: { type: 'fluid' },
      },
    },
    {
      id: 'topnav-main',
      name: 'Top Nav + Main (Full Width)',
      description: 'Horizontal navigation only, maximizes content width',
      sections: ['header', 'main'],
      wireframe: `
┌─────────────────────────────────┐
│ Logo   Nav Nav Nav    [User]   │
├─────────────────────────────────┤
│                                 │
│       Main Content Area         │
│                                 │
│   ┌──────┐  ┌──────┐  ┌──────┐ │
│   │ Card │  │ Card │  │ Card │ │
│   └──────┘  └──────┘  └──────┘ │
│                                 │
└─────────────────────────────────┘`,
      structure: {
        header: { height: 64, hasLogo: true, hasNav: true, hasUserMenu: true },
        main: { type: 'full-width', maxWidth: 1280, centered: true },
      },
    },
  ],

  // ==========================================================================
  // SETTINGS LAYOUTS
  // ==========================================================================
  settings: [
    {
      id: 'sidebar-sections',
      name: 'Sidebar Navigation',
      description: 'Left nav menu with settings categories, right content',
      sections: ['sidebar-nav', 'content'],
      wireframe: `
┌────────────┬────────────────────┐
│ Settings   │  General Settings  │
│ ─────────  │  ─────────────────│
│ > General  │  ┌──────────────┐ │
│   Profile  │  │ Form Field   │ │
│   Security │  ├──────────────┤ │
│   Billing  │  │ Form Field   │ │
│   Team     │  └──────────────┘ │
│            │        [Save]     │
└────────────┴────────────────────┘`,
      structure: {
        sidebar: { width: 200, sticky: true },
        content: { type: 'form-sections' },
      },
    },
    {
      id: 'tabbed-sections',
      name: 'Tabbed Sections',
      description: 'Horizontal tabs at top, content sections below',
      sections: ['tabs', 'content'],
      wireframe: `
┌─────────────────────────────────┐
│ [General] [Profile] [Security] │
├─────────────────────────────────┤
│                                 │
│  Section Title                  │
│  ┌──────────────────────────┐  │
│  │ Form Field               │  │
│  ├──────────────────────────┤  │
│  │ Form Field               │  │
│  └──────────────────────────┘  │
│                      [Save]    │
└─────────────────────────────────┘`,
      structure: {
        tabs: { position: 'top', style: 'underline' },
        content: { type: 'form-sections' },
      },
    },
    {
      id: 'single-scroll',
      name: 'Single Page Scroll',
      description: 'All settings on one scrollable page with section anchors',
      sections: ['header', 'sections'],
      wireframe: `
┌─────────────────────────────────┐
│ Settings                        │
├─────────────────────────────────┤
│ General ──────────────────────  │
│ ┌────────────────────────────┐ │
│ │ Form fields...             │ │
│ └────────────────────────────┘ │
│                                 │
│ Profile ──────────────────────  │
│ ┌────────────────────────────┐ │
│ │ Form fields...             │ │
│ └────────────────────────────┘ │
│                                 │
│ Security ─────────────────────  │
│ ┌────────────────────────────┐ │
│ │ Form fields...             │ │
│ └────────────────────────────┘ │
└─────────────────────────────────┘`,
      structure: {
        sections: { type: 'stacked', withAnchors: true },
      },
    },
    {
      id: 'accordion-sections',
      name: 'Accordion Sections',
      description: 'Expandable/collapsible sections for dense settings',
      sections: ['header', 'accordions'],
      wireframe: `
┌─────────────────────────────────┐
│ Settings                        │
├─────────────────────────────────┤
│ ▼ General                       │
│   ┌────────────────────────┐   │
│   │ Form fields...         │   │
│   └────────────────────────┘   │
│ ▶ Profile (collapsed)          │
│ ▶ Security (collapsed)         │
│ ▶ Billing (collapsed)          │
│                                 │
│                     [Save All] │
└─────────────────────────────────┘`,
      structure: {
        accordions: { multiExpand: false, defaultOpen: 'first' },
      },
    },
  ],

  // ==========================================================================
  // PROFILE LAYOUTS
  // ==========================================================================
  profile: [
    {
      id: 'header-tabs',
      name: 'Profile Header + Tabs',
      description: 'Header with avatar and info, tabbed content below',
      sections: ['profile-header', 'tabs', 'content'],
      wireframe: `
┌─────────────────────────────────┐
│  ┌───┐                         │
│  │ @ │  Username               │
│  └───┘  @handle • Location     │
│         Bio text here...       │
├─────────────────────────────────┤
│ [Posts] [Activity] [Settings]  │
├─────────────────────────────────┤
│                                 │
│   Content based on active tab   │
│                                 │
└─────────────────────────────────┘`,
      structure: {
        header: { hasAvatar: true, hasCover: false, hasStats: true },
        tabs: { position: 'below-header' },
        content: { type: 'tab-content' },
      },
    },
    {
      id: 'header-tabs-cover',
      name: 'Cover Image + Header + Tabs',
      description: 'Full-width cover image, overlapping avatar, tabbed content',
      sections: ['cover', 'profile-header', 'tabs', 'content'],
      wireframe: `
┌─────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░ COVER IMAGE ░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├─────────────────────────────────┤
│  ┌───┐                         │
│  │ @ │  Username      [Edit]   │
│  └───┘  Bio and info           │
├─────────────────────────────────┤
│ [Overview] [Projects] [Teams]  │
├─────────────────────────────────┤
│    Tab content area            │
└─────────────────────────────────┘`,
      structure: {
        cover: { height: 200, editable: true },
        header: { hasAvatar: true, avatarSize: 'large', avatarOverlap: true },
        tabs: { position: 'below-header' },
        content: { type: 'tab-content' },
      },
    },
    {
      id: 'two-column',
      name: 'Two Column Layout',
      description: 'Left column with user info, right with activity/content',
      sections: ['sidebar', 'main'],
      wireframe: `
┌────────────┬────────────────────┐
│  ┌───┐     │  Recent Activity   │
│  │ @ │     │  ┌──────────────┐ │
│  └───┘     │  │ Item         │ │
│  Username  │  ├──────────────┤ │
│  ────────  │  │ Item         │ │
│  Bio text  │  ├──────────────┤ │
│            │  │ Item         │ │
│  ┌──────┐  │  └──────────────┘ │
│  │Stats │  │                   │
│  └──────┘  │  Projects         │
│            │  ┌─────┐ ┌─────┐  │
│  Links     │  │Proj │ │Proj │  │
│  • Link    │  └─────┘ └─────┘  │
└────────────┴────────────────────┘`,
      structure: {
        sidebar: { width: 280, position: 'left', sticky: true },
        main: { sections: ['activity', 'projects'] },
      },
    },
    {
      id: 'card-grid',
      name: 'Header + Card Grid',
      description: 'Compact header, grid of info/stat cards below',
      sections: ['profile-header', 'card-grid'],
      wireframe: `
┌─────────────────────────────────┐
│ ┌───┐ Username        [Edit]   │
│ │ @ │ Short bio line           │
│ └───┘                          │
├─────────────────────────────────┤
│ ┌───────────┐  ┌───────────┐   │
│ │ Stats     │  │ Activity  │   │
│ │ Card      │  │ Card      │   │
│ └───────────┘  └───────────┘   │
│ ┌───────────┐  ┌───────────┐   │
│ │ Projects  │  │ Teams     │   │
│ │ Card      │  │ Card      │   │
│ └───────────┘  └───────────┘   │
└─────────────────────────────────┘`,
      structure: {
        header: { compact: true, hasAvatar: true },
        grid: { columns: 2, gap: 16 },
      },
    },
  ],
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

export const getLayoutsForPageType = (pageType) => {
  return LAYOUT_TEMPLATES[pageType] || [];
};

export const getLayoutById = (pageType, layoutId) => {
  const layouts = LAYOUT_TEMPLATES[pageType] || [];
  return layouts.find(l => l.id === layoutId) || null;
};

export const getAllPageTypes = () => {
  return Object.keys(LAYOUT_TEMPLATES);
};

export const PAGE_TYPE_INFO = {
  landing: {
    name: 'Landing Page',
    description: 'Marketing page to convert visitors',
    icon: 'Rocket',
  },
  dashboard: {
    name: 'Dashboard',
    description: 'Main app interface with data and navigation',
    icon: 'LayoutDashboard',
  },
  settings: {
    name: 'Settings',
    description: 'User preferences and configuration',
    icon: 'Settings',
  },
  profile: {
    name: 'Profile',
    description: 'User profile and public info',
    icon: 'User',
  },
};

export default LAYOUT_TEMPLATES;

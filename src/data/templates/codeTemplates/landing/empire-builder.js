// ============================================================================
// EMPIRE BUILDER - LANDING PAGE TEMPLATE
// ============================================================================
//
// A dark-themed SaaS landing page with:
// - Fixed navigation with glass effect
// - Hero section with badge, headline, CTAs
// - Interactive mockup preview
// - Tech stack strip
// - Bento-style features grid
// - Roadmap timeline
// - Footer
//
// Original source: User's pre-made template
// ============================================================================

import {
  createTextSlot,
  createRichTextSlot,
  createListSlot,
  createContentMap,
  DEFAULT_TOKEN_OVERRIDES,
} from '../../contentMaps/schema';

export const EMPIRE_BUILDER_TEMPLATE = {
  id: 'empire-builder-landing',
  name: 'Empire Builder',
  category: 'landing',
  description: 'Dark-themed SaaS landing page with hero, features grid, roadmap, and glass effects',
  version: '1.0.0',

  // The HTML template with data-slot attributes
  html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-slot="page_title">Product - Tagline</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --token-primary: #7877C6;
            --token-primary-hover: #8B8AD4;
            --token-background: #050505;
            --token-surface: #0a0a0a;
            --token-surface-hover: #0f0f0f;
            --token-text: #d4d4d4;
            --token-text-secondary: #a3a3a3;
            --token-text-muted: #737373;
            --token-border: #262626;
            --token-success: #22c55e;
            --token-error: #ef4444;
            --token-warning: #f59e0b;
            --token-font: 'Inter', sans-serif;
        }

        body {
            font-family: var(--token-font);
            background-color: var(--token-background);
            color: var(--token-text);
            -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: var(--token-surface);
        }
        ::-webkit-scrollbar-thumb {
            background: var(--token-border);
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #404040;
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .glass-panel:hover {
            border-color: rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.04);
        }

        .hero-glow {
            background: radial-gradient(circle at center, rgba(120, 119, 198, 0.15) 0%, rgba(0, 0, 0, 0) 50%);
        }

        .text-gradient {
            background: linear-gradient(to bottom right, #ffffff 30%, #a3a3a3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }

        .scan-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--token-primary), transparent);
            box-shadow: 0 0 10px var(--token-primary);
            animation: scan 3s ease-in-out infinite;
        }

        .typing-cursor::after {
            content: '|';
            animation: blink 1s step-end infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    </style>
</head>
<body class="selection:bg-white/20 selection:text-white">

    <!-- Navigation -->
    <nav class="fixed w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black font-bold text-xs tracking-tighter" data-slot="logo_initials">
                    EB
                </div>
                <span class="text-sm font-medium text-white tracking-tight" data-slot="product_name">EmpireBuilder AI</span>
            </div>
            <div class="hidden md:flex items-center gap-8" data-slot-list="nav_links">
                <a href="#features" class="text-xs text-neutral-400 hover:text-white transition-colors">Features</a>
                <a href="#validation" class="text-xs text-neutral-400 hover:text-white transition-colors">Validation</a>
                <a href="#roadmap" class="text-xs text-neutral-400 hover:text-white transition-colors">Roadmap</a>
            </div>
            <div class="flex items-center gap-4">
                <a href="#" class="text-xs text-neutral-400 hover:text-white transition-colors">Sign in</a>
                <button class="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-neutral-200 transition-colors" data-slot="nav_cta">
                    Start Research
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <div class="absolute inset-0 hero-glow z-0 pointer-events-none"></div>

        <div class="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
                <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="text-xs font-medium text-emerald-400" data-slot="hero_badge">AI-Powered Platform Active</span>
            </div>

            <h1 class="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]" data-slot="hero_headline">
                Your AI Research Partner for <br>
                <span class="text-gradient">Profitable Business Ideas</span>
            </h1>

            <p class="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed" data-slot="hero_subheadline">
                Scan the internet for emerging trends, generate complete business blueprints, and validate with real market data before writing a single line of code.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                <button class="h-10 px-6 rounded bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-all flex items-center gap-2" data-slot="cta_primary">
                    <span class="iconify" data-icon="lucide:sparkles" data-width="16"></span>
                    Get Started Free
                </button>
                <button class="h-10 px-6 rounded border border-white/10 text-neutral-300 text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-2" data-slot="cta_secondary">
                    <span class="iconify" data-icon="lucide:play-circle" data-width="16"></span>
                    Watch Demo
                </button>
            </div>

            <!-- Interactive UI Mockup -->
            <div class="relative max-w-4xl mx-auto rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden group">
                <div class="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 justify-between">
                    <div class="flex gap-2">
                        <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div class="text-xs text-neutral-500 font-mono" data-slot="mockup_filename">app_v1.0.tsx</div>
                    <div class="w-10"></div>
                </div>

                <div class="grid md:grid-cols-12 gap-0 h-[400px]">
                    <div class="md:col-span-3 border-r border-white/5 bg-neutral-900/30 p-4 flex flex-col gap-4">
                        <div class="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Sources</div>
                        <div class="flex items-center gap-2 text-xs text-white p-2 bg-white/5 rounded border border-white/5">
                            <span class="iconify text-orange-500" data-icon="lucide:flame"></span>
                            <span>Trending Data</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-neutral-400 p-2">
                            <span class="iconify text-blue-400" data-icon="lucide:twitter"></span>
                            <span>Social Signals</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-neutral-400 p-2">
                            <span class="iconify text-orange-600" data-icon="lucide:box"></span>
                            <span>Market Data</span>
                        </div>

                        <div class="mt-auto">
                            <div class="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Status</div>
                            <div class="flex items-center gap-2 text-xs text-emerald-400">
                                <span class="iconify" data-icon="lucide:check-circle"></span>
                                <span>Connected</span>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-9 p-6 relative">
                        <div class="scan-line z-0"></div>
                        <div class="relative z-10 flex flex-col h-full">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-sm font-medium text-white">Analysis Complete</h3>
                                    <p class="text-xs text-neutral-500 mt-1">Processing your request...</p>
                                </div>
                                <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                    <span class="text-xs font-semibold text-emerald-400">Score: 87/100</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div class="glass-panel p-4 rounded-lg">
                                    <div class="text-xs text-neutral-500 mb-1">Monthly Volume</div>
                                    <div class="text-lg font-medium text-white">12,500 <span class="text-xs text-emerald-500 ml-1">+24%</span></div>
                                </div>
                                <div class="glass-panel p-4 rounded-lg">
                                    <div class="text-xs text-neutral-500 mb-1">Competition</div>
                                    <div class="text-lg font-medium text-white">Low-Medium</div>
                                </div>
                            </div>

                            <div class="glass-panel p-4 rounded-lg flex-1 border-dashed">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-xs text-neutral-400 font-medium">Generating Output</span>
                                    <span class="iconify animate-spin text-neutral-600" data-icon="lucide:loader-2"></span>
                                </div>
                                <div class="space-y-2">
                                    <div class="h-2 w-3/4 bg-neutral-800 rounded animate-pulse"></div>
                                    <div class="h-2 w-full bg-neutral-800 rounded animate-pulse delay-75"></div>
                                    <div class="h-2 w-5/6 bg-neutral-800 rounded animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tech Stack Strip -->
        <div class="mt-20 border-y border-white/5 bg-white/[0.02]">
            <div class="max-w-7xl mx-auto px-6 py-8">
                <p class="text-center text-xs font-medium text-neutral-500 mb-6 tracking-wide uppercase">Powered By Industry Leading Technology</p>
                <div class="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500" data-slot-list="tech_stack">
                    <div class="flex items-center gap-2"><span class="iconify" data-icon="lucide:search"></span> <span class="font-semibold tracking-tight text-white">Search API</span></div>
                    <div class="flex items-center gap-2"><span class="iconify" data-icon="lucide:cpu"></span> <span class="font-semibold tracking-tight text-white">AI Engine</span></div>
                    <div class="flex items-center gap-2"><span class="iconify" data-icon="lucide:flame"></span> <span class="font-semibold tracking-tight text-white">Analytics</span></div>
                    <div class="flex items-center gap-2"><span class="iconify" data-icon="lucide:database"></span> <span class="font-semibold tracking-tight text-white">Cloud Storage</span></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Core Features Grid -->
    <section id="features" class="py-24 bg-neutral-950">
        <div class="max-w-7xl mx-auto px-6">
            <div class="mb-16">
                <h2 class="text-3xl font-semibold text-white tracking-tight mb-4" data-slot="features_headline">Powerful Capabilities</h2>
                <p class="text-neutral-400 max-w-xl" data-slot="features_subheadline">Everything you need to build, validate, and launch your next big idea.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-6" data-slot-list="features">
                <!-- Feature cards will be generated here -->
            </div>
        </div>
    </section>

    <!-- Roadmap Section -->
    <section class="py-24 border-t border-white/5 bg-black">
        <div class="max-w-7xl mx-auto px-6">
            <div class="max-w-xl">
                <h3 class="text-xl font-medium text-white mb-6" data-slot="roadmap_headline">Coming Next</h3>
                <div class="relative border-l border-white/10 ml-3 space-y-8 pl-8 py-2" data-slot-list="roadmap">
                    <!-- Roadmap items will be generated here -->
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/5 py-12 bg-neutral-950">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex items-center gap-3">
                <div class="w-5 h-5 bg-neutral-800 rounded-sm flex items-center justify-center text-white font-bold text-[10px]" data-slot="footer_logo_initials">EB</div>
                <span class="text-xs text-neutral-500" data-slot="footer_copyright">&copy; 2025 EmpireBuilder AI</span>
            </div>

            <div class="flex gap-6" data-slot-list="footer_links">
                <a href="#" class="text-xs text-neutral-500 hover:text-white transition-colors">Privacy</a>
                <a href="#" class="text-xs text-neutral-500 hover:text-white transition-colors">Terms</a>
                <a href="#" class="text-xs text-neutral-500 hover:text-white transition-colors">Twitter</a>
                <a href="#" class="text-xs text-neutral-500 hover:text-white transition-colors">GitHub</a>
            </div>
        </div>
    </footer>

    <!-- Background Grid -->
    <div class="fixed inset-0 pointer-events-none z-[-1]" style="background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 50px 50px; opacity: 0.5;"></div>

</body>
</html>`,

  // Content Map defining all replaceable slots
  contentMap: createContentMap({
    templateId: 'empire-builder-landing',
    version: '1.0.0',
    slots: [
      // === NAVIGATION ===
      createTextSlot({
        id: 'logo_initials',
        selector: '[data-slot="logo_initials"]',
        label: 'Logo Initials',
        description: 'Short initials for the logo (2-3 chars)',
        prdMapping: null,
        fallback: 'EB',
        validation: { maxLength: 3 },
      }),
      createTextSlot({
        id: 'product_name',
        selector: '[data-slot="product_name"]',
        label: 'Product Name',
        description: 'Your product or company name',
        prdMapping: 'prd.productName',
        fallback: 'ProductName',
        validation: { required: true, maxLength: 30 },
      }),
      createTextSlot({
        id: 'nav_cta',
        selector: '[data-slot="nav_cta"]',
        label: 'Navigation CTA',
        description: 'Button text in the nav bar',
        prdMapping: null,
        fallback: 'Get Started',
        validation: { maxLength: 20 },
      }),
      createListSlot({
        id: 'nav_links',
        selector: '[data-slot-list="nav_links"]',
        label: 'Navigation Links',
        description: 'Header navigation links',
        prdMapping: null,
        fallback: [
          { text: 'Features', href: '#features' },
          { text: 'Roadmap', href: '#roadmap' },
          { text: 'Pricing', href: '#pricing' },
        ],
        itemSchema: {
          fields: [
            { id: 'text', type: 'text', label: 'Link Text' },
            { id: 'href', type: 'link', label: 'URL' },
          ],
        },
      }),

      // === HERO SECTION ===
      createTextSlot({
        id: 'page_title',
        selector: '[data-slot="page_title"]',
        label: 'Page Title',
        description: 'Browser tab title',
        prdMapping: null,
        fallback: 'Product - Tagline',
        validation: { maxLength: 60 },
      }),
      createTextSlot({
        id: 'hero_badge',
        selector: '[data-slot="hero_badge"]',
        label: 'Hero Badge',
        description: 'Small badge text above the headline',
        prdMapping: null,
        fallback: 'AI-Powered Platform Active',
        validation: { maxLength: 40 },
      }),
      createRichTextSlot({
        id: 'hero_headline',
        selector: '[data-slot="hero_headline"]',
        label: 'Hero Headline',
        description: 'Main attention-grabbing headline (can include <br> and <span class="text-gradient">)',
        prdMapping: null,
        fallback: 'Your AI Research Partner for <br><span class="text-gradient">Profitable Ideas</span>',
        validation: { required: true, maxLength: 120 },
      }),
      createTextSlot({
        id: 'hero_subheadline',
        selector: '[data-slot="hero_subheadline"]',
        label: 'Hero Subheadline',
        description: 'Supporting text under the headline',
        prdMapping: 'prd.valueProposition',
        fallback: 'Discover opportunities and validate your ideas with AI-powered insights.',
        validation: { maxLength: 200 },
      }),
      createTextSlot({
        id: 'cta_primary',
        selector: '[data-slot="cta_primary"]',
        label: 'Primary CTA',
        description: 'Main call-to-action button text',
        prdMapping: null,
        fallback: 'Get Started Free',
        validation: { maxLength: 25 },
      }),
      createTextSlot({
        id: 'cta_secondary',
        selector: '[data-slot="cta_secondary"]',
        label: 'Secondary CTA',
        description: 'Secondary action button text',
        prdMapping: null,
        fallback: 'Watch Demo',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'mockup_filename',
        selector: '[data-slot="mockup_filename"]',
        label: 'Mockup Filename',
        description: 'Filename shown in the mockup window',
        prdMapping: null,
        fallback: 'app_v1.0.tsx',
        validation: { maxLength: 30 },
      }),

      // === TECH STACK ===
      createListSlot({
        id: 'tech_stack',
        selector: '[data-slot-list="tech_stack"]',
        label: 'Tech Stack',
        description: 'Technologies/integrations to showcase',
        prdMapping: null,
        fallback: [
          { name: 'Search API', icon: 'search' },
          { name: 'AI Engine', icon: 'cpu' },
          { name: 'Analytics', icon: 'flame' },
          { name: 'Cloud Storage', icon: 'database' },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Name' },
            { id: 'icon', type: 'text', label: 'Lucide Icon Name' },
          ],
        },
        validation: { minLength: 3, maxLength: 6 },
      }),

      // === FEATURES SECTION ===
      createTextSlot({
        id: 'features_headline',
        selector: '[data-slot="features_headline"]',
        label: 'Features Headline',
        description: 'Headline for the features section',
        prdMapping: null,
        fallback: 'Powerful Capabilities',
        validation: { maxLength: 50 },
      }),
      createTextSlot({
        id: 'features_subheadline',
        selector: '[data-slot="features_subheadline"]',
        label: 'Features Subheadline',
        description: 'Subheadline for the features section',
        prdMapping: null,
        fallback: 'Everything you need to build and launch your next big idea.',
        validation: { maxLength: 100 },
      }),
      createListSlot({
        id: 'features',
        selector: '[data-slot-list="features"]',
        label: 'Features',
        description: 'Product features grid',
        prdMapping: 'features',
        fallback: [],
        itemSchema: {
          fields: [
            { id: 'icon', type: 'text', label: 'Lucide Icon Name', fallback: 'sparkles' },
            { id: 'title', type: 'text', label: 'Feature Title', prdMapping: 'name' },
            { id: 'description', type: 'text', label: 'Description', prdMapping: 'description' },
            { id: 'tags', type: 'list', label: 'Tags', fallback: [] },
          ],
        },
        validation: { minLength: 3, maxLength: 9 },
      }),

      // === ROADMAP SECTION ===
      createTextSlot({
        id: 'roadmap_headline',
        selector: '[data-slot="roadmap_headline"]',
        label: 'Roadmap Headline',
        description: 'Headline for the roadmap section',
        prdMapping: null,
        fallback: 'Coming Next',
        validation: { maxLength: 30 },
      }),
      createListSlot({
        id: 'roadmap',
        selector: '[data-slot-list="roadmap"]',
        label: 'Roadmap',
        description: 'Product roadmap timeline items',
        prdMapping: null,
        fallback: [
          { title: 'Phase 1: Foundation', description: 'Core features and infrastructure', status: 'completed' },
          { title: 'Phase 2: Enhancement', description: 'Advanced capabilities and integrations', status: 'in-progress' },
          { title: 'Phase 3: Scale', description: 'Enterprise features and optimization', status: 'planned' },
        ],
        itemSchema: {
          fields: [
            { id: 'title', type: 'text', label: 'Phase Title' },
            { id: 'description', type: 'text', label: 'Description' },
            { id: 'status', type: 'text', label: 'Status (completed/in-progress/planned)' },
          ],
        },
        validation: { minLength: 2, maxLength: 6 },
      }),

      // === FOOTER ===
      createTextSlot({
        id: 'footer_logo_initials',
        selector: '[data-slot="footer_logo_initials"]',
        label: 'Footer Logo Initials',
        description: 'Initials in the footer logo',
        prdMapping: null,
        fallback: 'EB',
        validation: { maxLength: 3 },
      }),
      createTextSlot({
        id: 'footer_copyright',
        selector: '[data-slot="footer_copyright"]',
        label: 'Footer Copyright',
        description: 'Copyright text in footer',
        prdMapping: null,
        fallback: '© 2025 ProductName',
        validation: { maxLength: 50 },
      }),
      createListSlot({
        id: 'footer_links',
        selector: '[data-slot-list="footer_links"]',
        label: 'Footer Links',
        description: 'Links in the footer',
        prdMapping: null,
        fallback: [
          { text: 'Privacy', href: '#' },
          { text: 'Terms', href: '#' },
          { text: 'Twitter', href: '#' },
          { text: 'GitHub', href: '#' },
        ],
        itemSchema: {
          fields: [
            { id: 'text', type: 'text', label: 'Link Text' },
            { id: 'href', type: 'link', label: 'URL' },
          ],
        },
      }),
    ],

    // Group slots by section for UI organization
    sections: {
      navigation: ['logo_initials', 'product_name', 'nav_links', 'nav_cta'],
      hero: ['page_title', 'hero_badge', 'hero_headline', 'hero_subheadline', 'cta_primary', 'cta_secondary', 'mockup_filename'],
      tech_stack: ['tech_stack'],
      features: ['features_headline', 'features_subheadline', 'features'],
      roadmap: ['roadmap_headline', 'roadmap'],
      footer: ['footer_logo_initials', 'footer_copyright', 'footer_links'],
    },

    // CSS variable mappings for design token overrides
    designTokenOverrides: DEFAULT_TOKEN_OVERRIDES,
  }),

  // Template metadata
  meta: {
    author: 'IdeaForge',
    createdAt: '2025-12-27',
    tags: ['landing', 'saas', 'tech', 'ai', 'dark-theme', 'glass-effect', 'bento'],
    complexity: 'medium',
    estimatedTokens: 800,
    previewImage: null, // Could add a base64 thumbnail
  },

  archetype: {
    primary: 'startup-velocity',
    secondary: ['enterprise-technical'],
    compatibility: {
      'startup-velocity': 95,
      'enterprise-technical': 80,
      'creator-aspirational': 45,
      'consumer-premium': 35,
    },
  },
};

export default EMPIRE_BUILDER_TEMPLATE;

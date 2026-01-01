// ============================================================================
// IDEAFORGE WORKFLOW - LANDING PAGE TEMPLATE
// ============================================================================
//
// A dark-themed developer tool landing page with:
// - Fixed navigation
// - Hero section with animated gradient headline
// - Interactive workflow demo with tabbed interface
// - Pricing tiers (Speed/Medium/Max)
// - Features grid
// - Footer with social links
//
// Original source: generated-page (2).html
// ============================================================================

import {
  createTextSlot,
  createRichTextSlot,
  createListSlot,
  createContentMap,
  DEFAULT_TOKEN_OVERRIDES,
} from '../../contentMaps/schema';

export const IDEAFORGE_WORKFLOW_TEMPLATE = {
  id: 'ideaforge-workflow-landing',
  name: 'IdeaForge Workflow',
  category: 'landing',
  description: 'Developer tool landing with interactive workflow demo, pricing tiers, and features grid',
  version: '1.0.0',

  html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-slot="page_title">IdeaForge - Research to Code</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        zinc: {
                            850: '#1f1f22',
                            950: '#09090b',
                        }
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>
    <style>
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        .toggle-checkbox:checked { right: 0; border-color: #6366f1; }
        .toggle-checkbox:checked + .toggle-label { background-color: #6366f1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-zinc-950 text-zinc-300 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">

    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-2 group cursor-pointer">
                <div class="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white">
                    <i data-lucide="zap" class="w-4 h-4 fill-white"></i>
                </div>
                <span data-slot="product_name" class="font-semibold text-white tracking-tight group-hover:text-indigo-400 transition-colors">IdeaForge</span>
            </div>

            <div class="hidden md:flex items-center gap-8 text-sm font-medium">
                <a href="#features" class="hover:text-white transition-colors">Features</a>
                <a href="#workflow" class="hover:text-white transition-colors">Workflow</a>
                <a href="#pricing" class="hover:text-white transition-colors">Pricing</a>
                <a href="#docs" class="hover:text-white transition-colors">Docs</a>
            </div>

            <div class="flex items-center gap-4">
                <a href="#" class="hidden sm:block text-xs font-medium text-zinc-400 hover:text-white transition-colors">Sign In</a>
                <button data-slot="nav_cta" class="bg-white text-zinc-950 px-4 py-2 rounded text-xs font-semibold hover:bg-zinc-200 transition-colors">
                    Start Building
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-medium text-zinc-400 mb-8 hover:border-indigo-500/30 transition-colors cursor-default">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span data-slot="hero_badge">Updated Dec 27, 2025: Template Inspiration System</span>
            </div>

            <h1 class="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]" data-slot="hero_headline">
                From raw research to <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-pulse-slow">production code</span>.
            </h1>

            <p data-slot="hero_subheadline" class="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                IdeaForge is the AI-augmented assistant that transforms unstructured insights into strict PRDs, design systems, and agent-ready coding prompts.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button data-slot="cta_primary" class="w-full sm:w-auto px-8 py-3 rounded-md bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group">
                    Start New Project
                    <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                </button>
                <button data-slot="cta_secondary" class="w-full sm:w-auto px-8 py-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-white font-medium hover:bg-zinc-900 hover:border-zinc-700 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="play-circle" class="w-4 h-4"></i>
                    View Demo
                </button>
            </div>

            <div data-slot-list="trust_badges" class="mt-16 pt-8 border-t border-zinc-900 flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                <div class="flex items-center gap-2">
                    <i data-lucide="brain-circuit" class="w-4 h-4 text-indigo-500"></i>
                    Multi-Model AI (Claude + Gemini)
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="layers" class="w-4 h-4 text-violet-500"></i>
                    BMAD Method 2025
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="code-2" class="w-4 h-4 text-emerald-500"></i>
                    Cursor &amp; Claude Code Ready
                </div>
            </div>
        </div>
    </header>

    <!-- Interactive Workflow Demo -->
    <section id="workflow" class="py-24 bg-zinc-900/30 border-y border-zinc-900">
        <div class="max-w-7xl mx-auto px-6">
            <div class="mb-16">
                <h2 data-slot="workflow_title" class="text-3xl font-semibold text-white tracking-tight mb-4">The IdeaForge Workflow</h2>
                <p data-slot="workflow_subtitle" class="text-zinc-400 max-w-2xl">A systematic pipeline that moves context forward. Never repeat yourself to the AI.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
                <div class="lg:col-span-3 flex flex-col gap-2">
                    <button onclick="switchTab('research')" id="btn-research" class="text-left px-4 py-4 rounded-lg bg-zinc-800/50 border border-indigo-500/50 text-white transition-all group active-tab">
                        <div class="flex items-center gap-3 mb-1">
                            <div class="p-1.5 rounded bg-indigo-500/20 text-indigo-400">
                                <i data-lucide="search" class="w-4 h-4"></i>
                            </div>
                            <span class="font-medium">1. Research</span>
                        </div>
                        <p class="text-xs text-zinc-400 pl-10">Gemini 2.5 Flash Lite extracts insights from raw text.</p>
                    </button>
                    <button onclick="switchTab('specs')" id="btn-specs" class="text-left px-4 py-4 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 transition-all group">
                        <div class="flex items-center gap-3 mb-1">
                            <div class="p-1.5 rounded bg-zinc-800 text-zinc-500 group-hover:text-zinc-300">
                                <i data-lucide="file-text" class="w-4 h-4"></i>
                            </div>
                            <span class="font-medium group-hover:text-white">2. Specs &amp; PRD</span>
                        </div>
                        <p class="text-xs text-zinc-500 pl-10">Claude 4.5 Sonnet generates deep requirements.</p>
                    </button>
                    <button onclick="switchTab('design')" id="btn-design" class="text-left px-4 py-4 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 transition-all group">
                        <div class="flex items-center gap-3 mb-1">
                            <div class="p-1.5 rounded bg-zinc-800 text-zinc-500 group-hover:text-zinc-300">
                                <i data-lucide="palette" class="w-4 h-4"></i>
                            </div>
                            <span class="font-medium group-hover:text-white">3. Design Studio</span>
                        </div>
                        <p class="text-xs text-zinc-500 pl-10">Generate design systems and UI tokens.</p>
                    </button>
                    <button onclick="switchTab('code')" id="btn-code" class="text-left px-4 py-4 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 transition-all group">
                        <div class="flex items-center gap-3 mb-1">
                            <div class="p-1.5 rounded bg-zinc-800 text-zinc-500 group-hover:text-zinc-300">
                                <i data-lucide="terminal" class="w-4 h-4"></i>
                            </div>
                            <span class="font-medium group-hover:text-white">4. Export Code</span>
                        </div>
                        <p class="text-xs text-zinc-500 pl-10">Agent-ready prompts for Cursor/Claude.</p>
                    </button>
                </div>

                <div class="lg:col-span-9 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
                    <div class="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-2">
                        <div class="flex gap-1.5">
                            <div class="w-3 h-3 rounded-full bg-zinc-700"></div>
                            <div class="w-3 h-3 rounded-full bg-zinc-700"></div>
                            <div class="w-3 h-3 rounded-full bg-zinc-700"></div>
                        </div>
                        <div class="ml-4 px-3 py-1 bg-zinc-950 rounded text-[10px] text-zinc-500 flex-1 border border-zinc-800 flex justify-between items-center">
                            <span>ideaforge.app/project/v1/overview</span>
                            <span class="text-emerald-500 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected</span>
                        </div>
                    </div>
                    <div id="content-research" class="flex-1 p-6 flex gap-6 tab-content">
                        <div class="w-1/2 flex flex-col gap-3">
                            <label class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Raw Input</label>
                            <div class="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-md p-4 text-xs font-mono text-zinc-400 leading-relaxed overflow-hidden relative">
                                <p>"Users are complaining that the onboarding flow is too complex..."</p>
                            </div>
                        </div>
                        <div class="w-1/2 flex flex-col gap-3">
                            <label class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Insights</label>
                            <div class="flex-1 space-y-3">
                                <div class="bg-zinc-900 border border-zinc-800 rounded p-3">
                                    <div class="text-xs text-indigo-400 font-medium mb-1">Pain Point</div>
                                    <div class="text-sm text-zinc-300">High friction onboarding (45% drop-off).</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Tiers -->
    <section class="py-24 bg-zinc-950 relative overflow-hidden">
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-16">
                <h2 data-slot="pricing_title" class="text-3xl font-semibold text-white tracking-tight mb-4">Intelligent Cost Routing</h2>
                <p data-slot="pricing_subtitle" class="text-zinc-400 max-w-xl mx-auto">We don't burn GPT-5 credits on simple tasks. IdeaForge routes requests to the most efficient model for the job.</p>
            </div>

            <div data-slot-list="pricing_tiers" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 rounded bg-zinc-800 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                            <i data-lucide="zap" class="w-5 h-5"></i>
                        </div>
                        <span class="text-xs font-mono text-zinc-500 uppercase">Speed Tier</span>
                    </div>
                    <h3 class="text-lg font-medium text-white mb-2">Pattern Extraction</h3>
                    <p class="text-sm text-zinc-400 mb-6 min-h-[40px]">Initial research analysis, chat interactions.</p>
                    <div class="flex items-center gap-2 text-xs text-zinc-500 border-t border-zinc-800 pt-4">
                        <span class="text-emerald-400">Gemini 2.5 Flash Lite</span>
                        <span>•</span>
                        <span>$0.10 / 1M tokens</span>
                    </div>
                </div>
                <div class="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 rounded bg-zinc-800 text-zinc-400 group-hover:text-amber-400 transition-colors">
                            <i data-lucide="cpu" class="w-5 h-5"></i>
                        </div>
                        <span class="text-xs font-mono text-zinc-500 uppercase">Medium Tier</span>
                    </div>
                    <h3 class="text-lg font-medium text-white mb-2">Structured Gen</h3>
                    <p class="text-sm text-zinc-400 mb-6 min-h-[40px]">Feature lists, user stories, design briefs.</p>
                    <div class="flex items-center gap-2 text-xs text-zinc-500 border-t border-zinc-800 pt-4">
                        <span class="text-amber-400">Claude Haiku</span>
                        <span>•</span>
                        <span>$1.00 / 1M tokens</span>
                    </div>
                </div>
                <div class="p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 rounded bg-indigo-500/20 text-indigo-400">
                            <i data-lucide="sparkles" class="w-5 h-5"></i>
                        </div>
                        <span class="text-xs font-mono text-indigo-400 uppercase">Max Tier</span>
                    </div>
                    <h3 class="text-lg font-medium text-white mb-2">Critical Specs</h3>
                    <p class="text-sm text-zinc-400 mb-6 min-h-[40px]">Final PRD, Database Schema, BMAD Story Files.</p>
                    <div class="flex items-center gap-2 text-xs text-zinc-500 border-t border-indigo-500/20 pt-4">
                        <span class="text-indigo-400">Claude 4.5 Sonnet</span>
                        <span>•</span>
                        <span>Deep Reasoning</span>
                    </div>
                </div>
            </div>

            <div class="mt-12 text-center">
                 <div class="inline-block px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
                    Average cost per full session: <span class="text-white font-semibold">~$0.11</span> (86% savings)
                 </div>
            </div>
        </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="py-24 border-t border-zinc-900 bg-zinc-950">
        <div class="max-w-7xl mx-auto px-6">
            <div data-slot-list="features" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                <div class="group">
                    <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-indigo-500/50 transition-colors">
                        <i data-lucide="layout-template" class="text-zinc-400 group-hover:text-indigo-400 transition-colors"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">Template Inspiration</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed">Upload screenshots or HTML code. The vision model analyzes layout and style.</p>
                </div>
                <div class="group">
                    <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-indigo-500/50 transition-colors">
                        <i data-lucide="book-open" class="text-zinc-400 group-hover:text-indigo-400 transition-colors"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">BMAD Story Files</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed">Generates atomic, independently implementable user stories.</p>
                </div>
                <div class="group">
                    <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-indigo-500/50 transition-colors">
                        <i data-lucide="box" class="text-zinc-400 group-hover:text-indigo-400 transition-colors"></i>
                    </div>
                    <h3 class="text-white font-medium mb-2">Skills Library</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed">Auto-injects proven patterns for Stripe, Firebase, and Next.js.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-zinc-900 bg-zinc-950 pt-16 pb-12 text-sm">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
                <div class="col-span-2 lg:col-span-2">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white">
                            <i data-lucide="zap" class="w-3 h-3 fill-white"></i>
                        </div>
                        <span data-slot="footer_product_name" class="font-semibold text-white tracking-tight">IdeaForge</span>
                    </div>
                    <p data-slot="footer_tagline" class="text-zinc-500 mb-6 max-w-xs">Built for product builders who want to go from idea validation to implementation quickly.</p>
                </div>
            </div>

            <div class="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                <div data-slot="footer_copyright" class="text-zinc-600 text-xs">
                    © 2025 IdeaForge. All rights reserved.
                </div>
                <div class="flex gap-6 text-zinc-600">
                    <a href="#" class="hover:text-zinc-400 transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i></a>
                    <a href="#" class="hover:text-zinc-400 transition-colors"><i data-lucide="github" class="w-4 h-4"></i></a>
                    <a href="#" class="hover:text-zinc-400 transition-colors"><i data-lucide="disc" class="w-4 h-4"></i></a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        lucide.createIcons();
        function switchTab(tabId) {
            document.querySelectorAll('[id^="btn-"]').forEach(btn => {
                btn.classList.remove('bg-zinc-800/50', 'border-indigo-500/50', 'text-white');
                btn.classList.add('border-transparent', 'text-zinc-400');
            });
            const activeBtn = document.getElementById('btn-' + tabId);
            activeBtn.classList.remove('border-transparent', 'text-zinc-400');
            activeBtn.classList.add('bg-zinc-800/50', 'border-indigo-500/50', 'text-white');
        }
    </script>

</body></html>`,

  contentMap: createContentMap({
    sections: {
      nav: ['product_name', 'nav_cta'],
      hero: ['hero_badge', 'hero_headline', 'hero_subheadline', 'cta_primary', 'cta_secondary', 'trust_badges'],
      workflow: ['workflow_title', 'workflow_subtitle'],
      pricing: ['pricing_title', 'pricing_subtitle', 'pricing_tiers'],
      features: ['features'],
      footer: ['footer_product_name', 'footer_tagline', 'footer_copyright'],
    },
    slots: [
      createTextSlot('page_title', 'Page Title', { fallback: 'Product - Transform Your Workflow' }),
      createTextSlot('product_name', 'Product Name', { fallback: 'ProductName' }),
      createTextSlot('nav_cta', 'Nav CTA', { fallback: 'Start Building' }),
      createTextSlot('hero_badge', 'Hero Badge', { fallback: 'Now Available' }),
      createRichTextSlot('hero_headline', 'Hero Headline', { fallback: 'From idea to <span class="text-gradient">production</span>.' }),
      createTextSlot('hero_subheadline', 'Hero Subheadline', { fallback: 'The AI-powered assistant for modern development.' }),
      createTextSlot('cta_primary', 'Primary CTA', { fallback: 'Get Started' }),
      createTextSlot('cta_secondary', 'Secondary CTA', { fallback: 'View Demo' }),
      createTextSlot('workflow_title', 'Workflow Title', { fallback: 'The Workflow' }),
      createTextSlot('workflow_subtitle', 'Workflow Subtitle', { fallback: 'A systematic pipeline for your project.' }),
      createTextSlot('pricing_title', 'Pricing Title', { fallback: 'Intelligent Pricing' }),
      createTextSlot('pricing_subtitle', 'Pricing Subtitle', { fallback: 'Pay only for what you use.' }),
      createTextSlot('footer_product_name', 'Footer Product', { fallback: 'ProductName' }),
      createTextSlot('footer_tagline', 'Footer Tagline', { fallback: 'Built for builders.' }),
      createTextSlot('footer_copyright', 'Copyright', { fallback: '© 2025 Company. All rights reserved.' }),
      createListSlot('trust_badges', 'Trust Badges', {
        itemSchema: {
          fields: [
            { id: 'icon', type: 'text', fallback: 'star' },
            { id: 'text', type: 'text', fallback: 'Feature' },
          ],
        },
        validation: { minLength: 2, maxLength: 5 },
      }),
      createListSlot('pricing_tiers', 'Pricing Tiers', {
        itemSchema: {
          fields: [
            { id: 'tier', type: 'text', fallback: 'Speed' },
            { id: 'title', type: 'text', fallback: 'Pattern Extraction' },
            { id: 'description', type: 'text', fallback: 'Fast analysis' },
            { id: 'model', type: 'text', fallback: 'Gemini Flash' },
            { id: 'price', type: 'text', fallback: '$0.10/1M' },
          ],
        },
        validation: { minLength: 2, maxLength: 4 },
      }),
      createListSlot('features', 'Features', {
        itemSchema: {
          fields: [
            { id: 'icon', type: 'text', fallback: 'sparkles' },
            { id: 'title', type: 'text', prdMapping: 'name' },
            { id: 'description', type: 'text', prdMapping: 'description' },
          ],
        },
        validation: { minLength: 3, maxLength: 9 },
      }),
    ],
  }),

  meta: {
    tags: ['landing', 'saas', 'developer', 'workflow', 'dark', 'pricing'],
    tokenOverrides: DEFAULT_TOKEN_OVERRIDES,
    previewImage: null,
  },

  archetype: {
    primary: 'startup-velocity',
    secondary: ['creator-aspirational'],
    compatibility: {
      'startup-velocity': 90,
      'creator-aspirational': 75,
      'enterprise-technical': 50,
      'consumer-premium': 40,
    },
  },
};

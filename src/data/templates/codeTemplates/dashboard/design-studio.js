// ============================================================================
// DESIGN STUDIO - DASHBOARD/APP UI TEMPLATE
// ============================================================================
//
// A dark-themed dashboard/app UI with:
// - Fixed sidebar with navigation and project selector
// - Pipeline navigation (Research, Features, PRD, etc.)
// - Split-view main content area
// - Chat/refinement panel
// - Live preview canvas with version controls
// - Stats cards and data tables
// - Usage/cost tracking footer
//
// Original source: IdeaForge Design Studio mockup
// ============================================================================

import {
  createTextSlot,
  createRichTextSlot,
  createListSlot,
  createContentMap,
  DEFAULT_TOKEN_OVERRIDES,
} from '../../contentMaps/schema';

export const DESIGN_STUDIO_TEMPLATE = {
  id: 'design-studio-dashboard',
  name: 'Design Studio',
  category: 'dashboard',
  description: 'Dark-themed dashboard app with sidebar navigation, split-view layout, chat panel, and live preview canvas',
  version: '1.0.0',

  // The HTML template with data-slot attributes
  html: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-slot="page_title">IdeaForge - Research to Code</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        zinc: {
                            850: '#1f1f22',
                            900: '#18181b',
                            950: '#09090b',
                        },
                        indigo: {
                            500: '#6366f1',
                            600: '#4f46e5',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #27272a;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #3f3f46;
        }

        /* Custom Toggle Switch */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #6366f1;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #6366f1;
        }

        /* Glass blur utilities */
        .glass {
            background: rgba(24, 24, 27, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }

        /* Hide number input arrows */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    </style>
</head>
<body class="bg-zinc-950 text-zinc-400 font-sans antialiased h-screen flex overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

    <!-- Sidebar -->
    <aside class="w-64 border-r border-zinc-800 flex flex-col justify-between bg-zinc-950 flex-shrink-0 z-20">
        <div>
            <!-- Logo -->
            <div class="h-14 flex items-center px-4 border-b border-zinc-800/50">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-zinc-100 rounded flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg>
                    </div>
                    <span class="text-zinc-100 font-semibold tracking-tight text-sm" data-slot="product_name">IDEAFORGE</span>
                </div>
            </div>

            <!-- Project Selector -->
            <div class="p-4">
                <button class="w-full flex items-center justify-between text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md p-2 transition-colors text-zinc-300">
                    <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span data-slot="project_name">SaaS Dashboard v1</span>
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
            </div>

            <!-- Navigation -->
            <nav class="px-2 space-y-0.5">
                <div class="px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-600" data-slot="nav_section_pipeline">Pipeline</div>

                <div data-slot-list="pipeline_items">
                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                            <svg class="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                            <span>Research</span>
                        </div>
                    </a>

                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                            <svg class="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                            <span>Features</span>
                        </div>
                    </a>

                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                            <svg class="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                            <span>PRD Generation</span>
                        </div>
                    </a>

                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                            <svg class="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                            <span>Tech Specs</span>
                        </div>
                    </a>

                    <!-- Active Step -->
                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <div class="flex items-center gap-2">
                            <svg class="animate-pulse" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
                            <span class="font-medium" data-slot="active_step_name">Design Studio</span>
                        </div>
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    </a>

                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm opacity-60 hover:opacity-100 hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                            <span>Stories (BMAD)</span>
                        </div>
                    </a>

                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm opacity-60 hover:opacity-100 hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
                            <span>Export</span>
                        </div>
                    </a>
                </div>

                <div class="mt-6 px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-600" data-slot="nav_section_assets">Assets</div>
                <div data-slot-list="asset_items">
                    <a href="#" class="group flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" x2="12" y1="22.08" y2="12"></line></svg>
                       <span>Skills Library</span>
                    </a>
                    <a href="#" class="group flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                        <div class="flex items-center gap-2">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
                            <span>Templates</span>
                        </div>
                        <span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded-sm">NEW</span>
                    </a>
                </div>
            </nav>
        </div>

        <!-- Cost/Usage Tracking -->
        <div class="p-4 border-t border-zinc-800 bg-zinc-950">
            <div class="space-y-3">
                <div class="flex justify-between items-center text-xs">
                    <span class="text-zinc-500" data-slot="usage_label_1">Session Cost</span>
                    <span class="text-zinc-200 font-mono" data-slot="usage_value_1">$0.11</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-zinc-500" data-slot="usage_label_2">Tokens</span>
                    <span class="text-zinc-200 font-mono" data-slot="usage_value_2">85.2k</span>
                </div>
                <!-- Progress bar for budget -->
                <div class="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full w-[25%]"></div>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-zinc-500 pt-1">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span class="truncate" data-slot="system_status">All Systems Operational</span>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full relative overflow-hidden bg-zinc-950">

        <!-- Header -->
        <header class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur z-10">
            <div class="flex items-center gap-3">
                <span class="text-zinc-500 text-sm" data-slot="header_section">Design System Studio</span>
                <span class="text-zinc-700 text-sm">/</span>
                <span class="text-zinc-100 text-sm font-medium" data-slot="header_subsection">Brief Editor</span>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50">
                    <svg class="text-indigo-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>
                    <span class="text-xs font-medium text-zinc-300" data-slot="model_indicator">Claude 4.5 Sonnet (MAX)</span>
                </div>
                <button class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
            </div>
        </header>

        <!-- Dynamic Content Area (Split View) -->
        <div class="flex-1 flex overflow-hidden">

            <!-- Left Panel: Chat & Controls -->
            <div class="w-[450px] border-r border-zinc-800 flex flex-col bg-zinc-925">

                <!-- Tabs -->
                <div class="flex border-b border-zinc-800" data-slot-list="panel_tabs">
                    <button class="flex-1 px-4 py-3 text-sm font-medium text-indigo-400 border-b-2 border-indigo-500 bg-zinc-900/50">
                        Chat &amp; Refine
                    </button>
                    <button class="flex-1 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                        Manual Tokens
                    </button>
                    <button class="flex-1 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                        Inspiration
                    </button>
                </div>

                <!-- Chat History -->
                <div class="flex-1 overflow-y-auto p-4 space-y-6">
                    <!-- AI Message -->
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <svg class="text-indigo-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
                        </div>
                        <div class="space-y-2">
                            <div class="text-sm text-zinc-300 leading-relaxed" data-slot="ai_message_content">
                                I've generated the initial design brief based on your research.
                                <br><br>
                                <span class="font-semibold text-zinc-200">Key decisions:</span>
                                <ul class="list-disc pl-4 mt-1 space-y-1 text-zinc-400" data-slot-list="ai_message_list">
                                    <li>Dark-first aesthetic (Zinc palette)</li>
                                    <li>Violet/Indigo accents for "trust + tech" vibe</li>
                                    <li>Card-heavy layout for dashboard widgets</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- User Message -->
                    <div class="flex gap-3 flex-row-reverse">
                        <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <span class="text-xs font-semibold text-zinc-400" data-slot="user_initials">YO</span>
                        </div>
                        <div class="bg-zinc-800/50 rounded-lg rounded-tr-none p-3 border border-zinc-800 text-sm text-zinc-200 max-w-[85%]" data-slot="user_message_content">
                            Let's make the primary action buttons more prominent. Maybe increase the corner radius to full pill shape and bump the saturation on the indigo.
                        </div>
                    </div>

                    <!-- AI Processing -->
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <svg class="text-indigo-400 animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                        </div>
                        <div class="space-y-2 w-full">
                            <div class="text-sm text-zinc-400" data-slot="processing_status">Updating design tokens...</div>

                            <!-- Token Change Diff Card -->
                            <div class="border border-zinc-800 rounded-lg p-3 bg-zinc-900/30 text-xs">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-medium text-zinc-300" data-slot="diff_card_title">Design System Updates</span>
                                    <span class="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500" data-slot="diff_card_model">Gemini Flash</span>
                                </div>
                                <div class="space-y-1.5" data-slot-list="token_changes">
                                    <div class="flex items-center gap-2">
                                        <span class="text-red-400/70 line-through">radius-md (0.375rem)</span>
                                        <svg class="text-zinc-600" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                        <span class="text-emerald-400">radius-full (9999px)</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-red-400/70 line-through">indigo-500 (#6366f1)</span>
                                        <svg class="text-zinc-600" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                        <span class="text-emerald-400">indigo-600 (#4f46e5)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-4 border-t border-zinc-800 bg-zinc-950">
                    <div class="relative">
                        <textarea placeholder="Describe changes (e.g. 'Make fonts tighter', 'Use Linear's sidebar style')..." class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 pr-10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-24" data-slot="chat_placeholder"></textarea>
                        <button class="absolute bottom-3 right-3 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors shadow-lg shadow-indigo-900/20">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
                        </button>
                    </div>
                    <div class="flex justify-between items-center mt-3">
                         <div class="flex items-center gap-2 text-xs text-zinc-500">
                            <label class="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                <span data-slot="upload_label">Upload Inspiration</span>
                            </label>
                         </div>
                         <div class="text-[10px] text-zinc-600 uppercase font-medium tracking-wide" data-slot="input_model_label">Model: Gemini 2.5 Flash Lite</div>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Live Preview -->
            <div class="flex-1 bg-zinc-950 flex flex-col relative">

                <!-- Toolbar -->
                <div class="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950">
                    <div class="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800" data-slot-list="viewport_options">
                        <button class="px-3 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 shadow-sm rounded-sm">Desktop</button>
                        <button class="px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-300">Tablet</button>
                        <button class="px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-300">Mobile</button>
                    </div>

                    <div class="flex items-center gap-3">
                        <span class="text-xs text-zinc-500 flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span data-slot="preview_status">Live Preview</span>
                        </span>
                        <div class="h-4 w-px bg-zinc-800"></div>
                        <button class="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><path d="M21 2v6h-6"></path></svg>
                            <span data-slot="fullscreen_label">Full Screen</span>
                        </button>
                        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm border border-indigo-400/20" data-slot="expand_button">
                            Expand to Full Page
                        </button>
                    </div>
                </div>

                <!-- Canvas / Iframe Simulation -->
                <div class="flex-1 p-8 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] overflow-auto flex justify-center">

                    <!-- The Previewed Component/Page -->
                    <div class="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-fit animate-in fade-in zoom-in-95 duration-500">

                        <!-- Mock App Navbar -->
                        <div class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur">
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 bg-indigo-600 rounded-full"></div>
                                <span class="font-semibold text-zinc-100 tracking-tight" data-slot="preview_company_name">Acme Corp</span>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-zinc-400" data-slot-list="preview_nav_items">
                                <span>Overview</span>
                                <span class="text-zinc-100">Customers</span>
                                <span>Settings</span>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
                        </div>

                        <!-- Mock App Content -->
                        <div class="p-8 space-y-8 bg-zinc-950">

                            <!-- Header Section -->
                            <div class="flex justify-between items-end">
                                <div>
                                    <h1 class="text-2xl font-semibold text-zinc-100 tracking-tight" data-slot="preview_page_title">Customer Overview</h1>
                                    <p class="text-zinc-500 mt-1 text-sm" data-slot="preview_page_subtitle">Manage your user base and view growth metrics.</p>
                                </div>
                                <div class="flex gap-3">
                                    <button class="px-4 py-2 text-sm font-medium text-zinc-300 border border-zinc-800 rounded-full hover:bg-zinc-900 transition" data-slot="preview_secondary_button">Filter</button>
                                    <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition" data-slot="preview_primary_button">Add Customer</button>
                                </div>
                            </div>

                            <!-- Stats Grid -->
                            <div class="grid grid-cols-3 gap-4" data-slot-list="stats_cards">
                                <div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition cursor-default group">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        </div>
                                        <span class="text-emerald-500 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded">+12.5%</span>
                                    </div>
                                    <div class="text-3xl font-semibold text-zinc-100 tracking-tight">2,420</div>
                                    <div class="text-sm text-zinc-500 mt-1">Total Users</div>
                                </div>

                                <div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition cursor-default group">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                                        </div>
                                        <span class="text-emerald-500 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded">+4.2%</span>
                                    </div>
                                    <div class="text-3xl font-semibold text-zinc-100 tracking-tight">$48.2k</div>
                                    <div class="text-sm text-zinc-500 mt-1">Monthly Revenue</div>
                                </div>

                                <div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition cursor-default group">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                                        </div>
                                        <span class="text-zinc-500 text-xs font-medium bg-zinc-800/50 px-2 py-0.5 rounded">0.0%</span>
                                    </div>
                                    <div class="text-3xl font-semibold text-zinc-100 tracking-tight">99.9%</div>
                                    <div class="text-sm text-zinc-500 mt-1">Uptime</div>
                                </div>
                            </div>

                            <!-- Table Section -->
                            <div class="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
                                <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                                    <h3 class="font-medium text-zinc-200" data-slot="table_title">Recent Signups</h3>
                                    <button class="text-xs text-indigo-400 hover:text-indigo-300" data-slot="table_action">View all</button>
                                </div>
                                <div class="divide-y divide-zinc-800/50" data-slot-list="table_rows">
                                    <div class="px-6 py-3 grid grid-cols-4 items-center hover:bg-zinc-900/40 transition">
                                        <div class="flex items-center gap-3 col-span-2">
                                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></div>
                                            <div>
                                                <div class="text-sm font-medium text-zinc-200">Sarah Miller</div>
                                                <div class="text-xs text-zinc-500">sarah@linear.app</div>
                                            </div>
                                        </div>
                                        <div class="text-xs text-zinc-400">Pro Plan</div>
                                        <div class="text-right text-xs text-zinc-500">2 min ago</div>
                                    </div>
                                    <div class="px-6 py-3 grid grid-cols-4 items-center hover:bg-zinc-900/40 transition">
                                        <div class="flex items-center gap-3 col-span-2">
                                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500"></div>
                                            <div>
                                                <div class="text-sm font-medium text-zinc-200">Tom Cook</div>
                                                <div class="text-xs text-zinc-500">tom@vercel.com</div>
                                            </div>
                                        </div>
                                        <div class="text-xs text-zinc-400">Team Plan</div>
                                        <div class="text-right text-xs text-zinc-500">45 min ago</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Floating Version Controls -->
                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-full shadow-2xl z-10">
                    <button class="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"></path></svg>
                    </button>
                    <span class="text-xs font-medium text-zinc-300 px-2" data-slot="version_indicator">Variation 2 of 3</span>
                    <button class="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                    <div class="w-px h-4 bg-zinc-700 mx-1"></div>
                    <button class="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-900 rounded-full text-xs font-medium transition" data-slot="select_design_button">
                        Select This Design
                    </button>
                </div>

            </div>

        </div>
    </main>


</body>
</html>`,

  // Content Map defining all replaceable slots
  contentMap: createContentMap({
    templateId: 'design-studio-dashboard',
    version: '1.0.0',
    slots: [
      // === GLOBAL / META ===
      createTextSlot({
        id: 'page_title',
        selector: '[data-slot="page_title"]',
        label: 'Page Title',
        description: 'Browser tab title',
        prdMapping: null,
        fallback: 'IdeaForge - Research to Code',
        validation: { maxLength: 60 },
      }),

      // === SIDEBAR - BRAND ===
      createTextSlot({
        id: 'product_name',
        selector: '[data-slot="product_name"]',
        label: 'Product Name',
        description: 'Your product or company name shown in sidebar',
        prdMapping: 'prd.productName',
        fallback: 'IDEAFORGE',
        validation: { required: true, maxLength: 20 },
      }),
      createTextSlot({
        id: 'project_name',
        selector: '[data-slot="project_name"]',
        label: 'Project Name',
        description: 'Current project name in selector dropdown',
        prdMapping: null,
        fallback: 'SaaS Dashboard v1',
        validation: { maxLength: 30 },
      }),

      // === SIDEBAR - NAVIGATION ===
      createTextSlot({
        id: 'nav_section_pipeline',
        selector: '[data-slot="nav_section_pipeline"]',
        label: 'Pipeline Section Label',
        description: 'Label for the main pipeline navigation section',
        prdMapping: null,
        fallback: 'Pipeline',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'nav_section_assets',
        selector: '[data-slot="nav_section_assets"]',
        label: 'Assets Section Label',
        description: 'Label for the assets navigation section',
        prdMapping: null,
        fallback: 'Assets',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'active_step_name',
        selector: '[data-slot="active_step_name"]',
        label: 'Active Step Name',
        description: 'Name of the currently active pipeline step',
        prdMapping: null,
        fallback: 'Design Studio',
        validation: { maxLength: 25 },
      }),
      createListSlot({
        id: 'pipeline_items',
        selector: '[data-slot-list="pipeline_items"]',
        label: 'Pipeline Navigation Items',
        description: 'Steps in the main pipeline navigation',
        prdMapping: null,
        fallback: [
          { name: 'Research', status: 'completed', icon: 'check-circle' },
          { name: 'Features', status: 'completed', icon: 'check-circle' },
          { name: 'PRD Generation', status: 'completed', icon: 'check-circle' },
          { name: 'Tech Specs', status: 'completed', icon: 'check-circle' },
          { name: 'Design Studio', status: 'active', icon: 'shield' },
          { name: 'Stories (BMAD)', status: 'pending', icon: 'book' },
          { name: 'Export', status: 'pending', icon: 'download' },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Step Name' },
            { id: 'status', type: 'text', label: 'Status (completed/active/pending)' },
            { id: 'icon', type: 'text', label: 'Lucide Icon Name' },
          ],
        },
        validation: { minLength: 3, maxLength: 10 },
      }),
      createListSlot({
        id: 'asset_items',
        selector: '[data-slot-list="asset_items"]',
        label: 'Asset Navigation Items',
        description: 'Items in the assets section of sidebar',
        prdMapping: null,
        fallback: [
          { name: 'Skills Library', icon: 'box', badge: null },
          { name: 'Templates', icon: 'layout', badge: 'NEW' },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Item Name' },
            { id: 'icon', type: 'text', label: 'Lucide Icon Name' },
            { id: 'badge', type: 'text', label: 'Optional Badge Text' },
          ],
        },
      }),

      // === SIDEBAR - USAGE TRACKING ===
      createTextSlot({
        id: 'usage_label_1',
        selector: '[data-slot="usage_label_1"]',
        label: 'Usage Label 1',
        description: 'First usage metric label',
        prdMapping: null,
        fallback: 'Session Cost',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'usage_value_1',
        selector: '[data-slot="usage_value_1"]',
        label: 'Usage Value 1',
        description: 'First usage metric value',
        prdMapping: null,
        fallback: '$0.11',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'usage_label_2',
        selector: '[data-slot="usage_label_2"]',
        label: 'Usage Label 2',
        description: 'Second usage metric label',
        prdMapping: null,
        fallback: 'Tokens',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'usage_value_2',
        selector: '[data-slot="usage_value_2"]',
        label: 'Usage Value 2',
        description: 'Second usage metric value',
        prdMapping: null,
        fallback: '85.2k',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'system_status',
        selector: '[data-slot="system_status"]',
        label: 'System Status',
        description: 'System status indicator text',
        prdMapping: null,
        fallback: 'All Systems Operational',
        validation: { maxLength: 30 },
      }),

      // === HEADER ===
      createTextSlot({
        id: 'header_section',
        selector: '[data-slot="header_section"]',
        label: 'Header Section',
        description: 'Primary section name in header breadcrumb',
        prdMapping: null,
        fallback: 'Design System Studio',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'header_subsection',
        selector: '[data-slot="header_subsection"]',
        label: 'Header Subsection',
        description: 'Current page/subsection name in header breadcrumb',
        prdMapping: null,
        fallback: 'Brief Editor',
        validation: { maxLength: 25 },
      }),
      createTextSlot({
        id: 'model_indicator',
        selector: '[data-slot="model_indicator"]',
        label: 'Model Indicator',
        description: 'Active AI model name shown in header',
        prdMapping: null,
        fallback: 'Claude 4.5 Sonnet (MAX)',
        validation: { maxLength: 30 },
      }),

      // === LEFT PANEL - TABS ===
      createListSlot({
        id: 'panel_tabs',
        selector: '[data-slot-list="panel_tabs"]',
        label: 'Panel Tabs',
        description: 'Tabs for left panel content switcher',
        prdMapping: null,
        fallback: [
          { name: 'Chat & Refine', active: true },
          { name: 'Manual Tokens', active: false },
          { name: 'Inspiration', active: false },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Tab Name' },
            { id: 'active', type: 'boolean', label: 'Is Active' },
          ],
        },
        validation: { minLength: 1, maxLength: 5 },
      }),

      // === LEFT PANEL - CHAT ===
      createRichTextSlot({
        id: 'ai_message_content',
        selector: '[data-slot="ai_message_content"]',
        label: 'AI Message Content',
        description: 'Sample AI assistant message in chat',
        prdMapping: null,
        fallback: "I've generated the initial design brief based on your research.",
        validation: { maxLength: 500 },
      }),
      createListSlot({
        id: 'ai_message_list',
        selector: '[data-slot-list="ai_message_list"]',
        label: 'AI Message List Items',
        description: 'Bullet points in AI message',
        prdMapping: null,
        fallback: [
          { text: 'Dark-first aesthetic (Zinc palette)' },
          { text: 'Violet/Indigo accents for "trust + tech" vibe' },
          { text: 'Card-heavy layout for dashboard widgets' },
        ],
        itemSchema: {
          fields: [
            { id: 'text', type: 'text', label: 'List Item Text' },
          ],
        },
      }),
      createTextSlot({
        id: 'user_initials',
        selector: '[data-slot="user_initials"]',
        label: 'User Initials',
        description: 'User avatar initials in chat',
        prdMapping: null,
        fallback: 'YO',
        validation: { maxLength: 3 },
      }),
      createTextSlot({
        id: 'user_message_content',
        selector: '[data-slot="user_message_content"]',
        label: 'User Message Content',
        description: 'Sample user message in chat',
        prdMapping: null,
        fallback: "Let's make the primary action buttons more prominent.",
        validation: { maxLength: 300 },
      }),
      createTextSlot({
        id: 'processing_status',
        selector: '[data-slot="processing_status"]',
        label: 'Processing Status',
        description: 'AI processing status message',
        prdMapping: null,
        fallback: 'Updating design tokens...',
        validation: { maxLength: 50 },
      }),
      createTextSlot({
        id: 'diff_card_title',
        selector: '[data-slot="diff_card_title"]',
        label: 'Diff Card Title',
        description: 'Title of the token change diff card',
        prdMapping: null,
        fallback: 'Design System Updates',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'diff_card_model',
        selector: '[data-slot="diff_card_model"]',
        label: 'Diff Card Model',
        description: 'Model name shown in diff card badge',
        prdMapping: null,
        fallback: 'Gemini Flash',
        validation: { maxLength: 20 },
      }),
      createListSlot({
        id: 'token_changes',
        selector: '[data-slot-list="token_changes"]',
        label: 'Token Changes',
        description: 'List of design token changes in diff view',
        prdMapping: null,
        fallback: [
          { oldValue: 'radius-md (0.375rem)', newValue: 'radius-full (9999px)' },
          { oldValue: 'indigo-500 (#6366f1)', newValue: 'indigo-600 (#4f46e5)' },
        ],
        itemSchema: {
          fields: [
            { id: 'oldValue', type: 'text', label: 'Old Value' },
            { id: 'newValue', type: 'text', label: 'New Value' },
          ],
        },
      }),
      createTextSlot({
        id: 'upload_label',
        selector: '[data-slot="upload_label"]',
        label: 'Upload Label',
        description: 'Label for the upload inspiration button',
        prdMapping: null,
        fallback: 'Upload Inspiration',
        validation: { maxLength: 25 },
      }),
      createTextSlot({
        id: 'input_model_label',
        selector: '[data-slot="input_model_label"]',
        label: 'Input Model Label',
        description: 'Model label shown below input area',
        prdMapping: null,
        fallback: 'Model: Gemini 2.5 Flash Lite',
        validation: { maxLength: 35 },
      }),

      // === RIGHT PANEL - TOOLBAR ===
      createListSlot({
        id: 'viewport_options',
        selector: '[data-slot-list="viewport_options"]',
        label: 'Viewport Options',
        description: 'Device viewport switcher options',
        prdMapping: null,
        fallback: [
          { name: 'Desktop', active: true },
          { name: 'Tablet', active: false },
          { name: 'Mobile', active: false },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Viewport Name' },
            { id: 'active', type: 'boolean', label: 'Is Active' },
          ],
        },
      }),
      createTextSlot({
        id: 'preview_status',
        selector: '[data-slot="preview_status"]',
        label: 'Preview Status',
        description: 'Status label in preview toolbar',
        prdMapping: null,
        fallback: 'Live Preview',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'fullscreen_label',
        selector: '[data-slot="fullscreen_label"]',
        label: 'Fullscreen Label',
        description: 'Label for fullscreen button',
        prdMapping: null,
        fallback: 'Full Screen',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'expand_button',
        selector: '[data-slot="expand_button"]',
        label: 'Expand Button Text',
        description: 'Text for the expand to full page button',
        prdMapping: null,
        fallback: 'Expand to Full Page',
        validation: { maxLength: 25 },
      }),

      // === RIGHT PANEL - PREVIEW NAVBAR ===
      createTextSlot({
        id: 'preview_company_name',
        selector: '[data-slot="preview_company_name"]',
        label: 'Preview Company Name',
        description: 'Company name in the preview mock navbar',
        prdMapping: 'prd.productName',
        fallback: 'Acme Corp',
        validation: { maxLength: 20 },
      }),
      createListSlot({
        id: 'preview_nav_items',
        selector: '[data-slot-list="preview_nav_items"]',
        label: 'Preview Nav Items',
        description: 'Navigation items in preview mock navbar',
        prdMapping: null,
        fallback: [
          { name: 'Overview', active: false },
          { name: 'Customers', active: true },
          { name: 'Settings', active: false },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Nav Item Name' },
            { id: 'active', type: 'boolean', label: 'Is Active' },
          ],
        },
      }),

      // === RIGHT PANEL - PREVIEW CONTENT ===
      createTextSlot({
        id: 'preview_page_title',
        selector: '[data-slot="preview_page_title"]',
        label: 'Preview Page Title',
        description: 'Main heading in preview content area',
        prdMapping: null,
        fallback: 'Customer Overview',
        validation: { maxLength: 40 },
      }),
      createTextSlot({
        id: 'preview_page_subtitle',
        selector: '[data-slot="preview_page_subtitle"]',
        label: 'Preview Page Subtitle',
        description: 'Subtitle/description in preview content area',
        prdMapping: null,
        fallback: 'Manage your user base and view growth metrics.',
        validation: { maxLength: 80 },
      }),
      createTextSlot({
        id: 'preview_secondary_button',
        selector: '[data-slot="preview_secondary_button"]',
        label: 'Preview Secondary Button',
        description: 'Secondary action button text in preview',
        prdMapping: null,
        fallback: 'Filter',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'preview_primary_button',
        selector: '[data-slot="preview_primary_button"]',
        label: 'Preview Primary Button',
        description: 'Primary action button text in preview',
        prdMapping: null,
        fallback: 'Add Customer',
        validation: { maxLength: 20 },
      }),

      // === RIGHT PANEL - STATS CARDS ===
      createListSlot({
        id: 'stats_cards',
        selector: '[data-slot-list="stats_cards"]',
        label: 'Stats Cards',
        description: 'Stats/metric cards in the preview dashboard',
        prdMapping: 'insights.successMetrics',
        fallback: [
          { value: '2,420', label: 'Total Users', change: '+12.5%', changeType: 'positive', icon: 'users' },
          { value: '$48.2k', label: 'Monthly Revenue', change: '+4.2%', changeType: 'positive', icon: 'bar-chart' },
          { value: '99.9%', label: 'Uptime', change: '0.0%', changeType: 'neutral', icon: 'activity' },
        ],
        itemSchema: {
          fields: [
            { id: 'value', type: 'text', label: 'Metric Value' },
            { id: 'label', type: 'text', label: 'Metric Label' },
            { id: 'change', type: 'text', label: 'Change Percentage' },
            { id: 'changeType', type: 'text', label: 'Change Type (positive/negative/neutral)' },
            { id: 'icon', type: 'text', label: 'Lucide Icon Name' },
          ],
        },
        validation: { minLength: 2, maxLength: 6 },
      }),

      // === RIGHT PANEL - TABLE ===
      createTextSlot({
        id: 'table_title',
        selector: '[data-slot="table_title"]',
        label: 'Table Title',
        description: 'Title for the data table section',
        prdMapping: null,
        fallback: 'Recent Signups',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'table_action',
        selector: '[data-slot="table_action"]',
        label: 'Table Action Link',
        description: 'Action link text in table header',
        prdMapping: null,
        fallback: 'View all',
        validation: { maxLength: 15 },
      }),
      createListSlot({
        id: 'table_rows',
        selector: '[data-slot-list="table_rows"]',
        label: 'Table Rows',
        description: 'Data rows in the table',
        prdMapping: null,
        fallback: [
          { name: 'Sarah Miller', email: 'sarah@linear.app', plan: 'Pro Plan', time: '2 min ago', avatarGradient: 'from-indigo-500 to-purple-500' },
          { name: 'Tom Cook', email: 'tom@vercel.com', plan: 'Team Plan', time: '45 min ago', avatarGradient: 'from-emerald-500 to-teal-500' },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'User Name' },
            { id: 'email', type: 'text', label: 'Email' },
            { id: 'plan', type: 'text', label: 'Plan Type' },
            { id: 'time', type: 'text', label: 'Relative Time' },
            { id: 'avatarGradient', type: 'text', label: 'Avatar Gradient Classes' },
          ],
        },
        validation: { minLength: 1, maxLength: 10 },
      }),

      // === FLOATING CONTROLS ===
      createTextSlot({
        id: 'version_indicator',
        selector: '[data-slot="version_indicator"]',
        label: 'Version Indicator',
        description: 'Current version/variation indicator text',
        prdMapping: null,
        fallback: 'Variation 2 of 3',
        validation: { maxLength: 25 },
      }),
      createTextSlot({
        id: 'select_design_button',
        selector: '[data-slot="select_design_button"]',
        label: 'Select Design Button',
        description: 'Button text for selecting the current design',
        prdMapping: null,
        fallback: 'Select This Design',
        validation: { maxLength: 25 },
      }),
    ],

    // Group slots by section for UI organization
    sections: {
      meta: ['page_title'],
      sidebar_brand: ['product_name', 'project_name'],
      sidebar_navigation: ['nav_section_pipeline', 'nav_section_assets', 'active_step_name', 'pipeline_items', 'asset_items'],
      sidebar_usage: ['usage_label_1', 'usage_value_1', 'usage_label_2', 'usage_value_2', 'system_status'],
      header: ['header_section', 'header_subsection', 'model_indicator'],
      left_panel_tabs: ['panel_tabs'],
      left_panel_chat: ['ai_message_content', 'ai_message_list', 'user_initials', 'user_message_content', 'processing_status', 'diff_card_title', 'diff_card_model', 'token_changes', 'upload_label', 'input_model_label'],
      right_panel_toolbar: ['viewport_options', 'preview_status', 'fullscreen_label', 'expand_button'],
      preview_navbar: ['preview_company_name', 'preview_nav_items'],
      preview_content: ['preview_page_title', 'preview_page_subtitle', 'preview_secondary_button', 'preview_primary_button'],
      preview_stats: ['stats_cards'],
      preview_table: ['table_title', 'table_action', 'table_rows'],
      floating_controls: ['version_indicator', 'select_design_button'],
    },

    // CSS variable mappings for design token overrides
    designTokenOverrides: DEFAULT_TOKEN_OVERRIDES,
  }),

  // Template metadata
  meta: {
    author: 'IdeaForge',
    createdAt: '2025-12-28',
    tags: ['dashboard', 'app', 'saas', 'dark-theme', 'split-view', 'chat-ui', 'preview-canvas', 'sidebar'],
    complexity: 'high',
    estimatedTokens: 1200,
    previewImage: null, // Could add a base64 thumbnail
  },

  archetype: {
    primary: 'creator-aspirational',
    secondary: ['startup-velocity'],
    compatibility: {
      'creator-aspirational': 90,
      'startup-velocity': 80,
      'enterprise-technical': 55,
      'consumer-premium': 60,
    },
  },
};

export default DESIGN_STUDIO_TEMPLATE;

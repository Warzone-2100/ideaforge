// ============================================================================
// NEXUS ENTERPRISE - LANDING PAGE TEMPLATE
// ============================================================================
//
// A futuristic dark enterprise AI landing page with:
// - 3D animated background (Unicorn Studio)
// - Fixed navigation with glass effect
// - Hero section with scramble text animations
// - Client marquee strip
// - Bento-style features grid with spotlight effects
// - Developer SDK section with code preview
// - Sticky pipeline visualization section
// - Pricing tiers
// - Footer with newsletter signup
//
// Original source: User's pre-made template (NEXUS//OS design)
// ============================================================================

import {
  createTextSlot,
  createRichTextSlot,
  createListSlot,
  createContentMap,
  DEFAULT_TOKEN_OVERRIDES,
} from '../../contentMaps/schema';

export const NEXUS_ENTERPRISE_TEMPLATE = {
  id: 'nexus-enterprise-landing',
  name: 'Nexus Enterprise',
  category: 'landing',
  description: 'Futuristic enterprise AI landing page with 3D backgrounds, bento grid features, pricing tiers, and advanced animations',
  version: '1.0.0',

  // The HTML template with data-slot attributes
  html: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title data-slot="page_title">NEXUS // OS | Enterprise AI Infrastructure</title>
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Space+Grotesk:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
<!-- GSAP & Lenis -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/@studio-freight/lenis@1.0.29/dist/lenis.min.js"></script>
<script>
tailwind.config = {
theme: {
extend: {
colors: {
accent: '#FF3B00',
surface: '#0F0F0F',
},
fontFamily: {
sans: ['Inter', 'sans-serif'],
display: ['Space Grotesk', 'sans-serif'],
mono: ['JetBrains Mono', 'monospace'],
},
animation: {
'spin-slow': 'spin 15s linear infinite',
'reverse-spin': 'spin 20s linear infinite reverse',
'marquee': 'marquee 30s linear infinite',
'scan': 'scan 4s linear infinite',
'blink': 'blink 2s ease-in-out infinite',
'dash': 'dash 20s linear infinite',
'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
},
keyframes: {
marquee: {
'0%': { transform: 'translateX(0)' },
'100%': { transform: 'translateX(-33.333%)' },
},
scan: {
'0%': { top: '-20%' },
'100%': { top: '120%' },
},
blink: {
'0%, 100%': { opacity: 1 },
'50%': { opacity: 0.3 },
},
dash: {
to: { 'stroke-dashoffset': '1000' }
}
}
}
}
}
</script>
<style>
/* --- CORE SETTINGS --- */
html {
background-color: #050505;
}
body {
margin: 0; padding: 0;
background-color: transparent;
color: #e0e0e0;
overflow-x: hidden;
cursor: auto;
}
/* --- UTILS --- */
.glass-panel {
background: rgba(10, 10, 10, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.08);
position: relative;
overflow: hidden;
}
/* Spotlight Effect */
.spotlight-card::before {
content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
border-radius: inherit;
background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.04), transparent 40%);
z-index: 2; opacity: 0; transition: opacity 0.5s; pointer-events: none;
}
.spotlight-card:hover::before { opacity: 1; }
.spotlight-card::after {
content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
border-radius: inherit; padding: 1px;
background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 59, 0, 0.3), transparent 40%);
-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
-webkit-mask-composite: xor; mask-composite: exclude;
z-index: 3; opacity: 0; transition: opacity 0.5s; pointer-events: none;
}
.spotlight-card:hover::after { opacity: 1; }
.marquee-mask {
mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
-webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
.scan-line {
position: absolute; left: 0; width: 100%; height: 50px;
background: linear-gradient(to bottom, transparent, rgba(255, 59, 0, 0.3), transparent);
opacity: 0.5; animation: scan 3s linear infinite; z-index: 10; pointer-events: none;
}
.noise-overlay {
position: fixed; inset: 0; z-index: 9000; pointer-events: none; opacity: 0.04;
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
.btn-magnetic { display: inline-block; }
.dot-grid {
background-image: radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px);
background-size: 20px 20px;
}
.skew-target { will-change: transform; }
</style></head>
<body class="antialiased selection:bg-accent selection:text-white">

<!-- GLOBAL BACKDROP -->
<div class="fixed inset-0 bg-[#050505] -z-50"></div>

<!-- 3D BACKGROUND (Unicorn Studio) -->
<div class="aura-background-component fixed top-0 w-full h-screen -z-10" data-alpha-mask="80" style="mask-image: linear-gradient(to bottom, transparent, black 0%, black 80%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)">
    <div class="aura-background-component top-0 w-full -z-10 absolute h-full">
        <div data-us-project="NMlvqnkICwYYJ6lYb064" class="absolute w-full h-full left-0 top-0 -z-10"></div>
        <script type="text/javascript">
            !function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();
        </script>
    </div>
</div>

<!-- NOISE LAYER -->
<div class="noise-overlay"></div>

<!-- NAVIGATION -->
<nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <a href="#" class="group hover-trigger">
            <span class="font-display font-bold text-xl tracking-tighter text-white group-hover:text-accent transition-colors" data-slot="logo_text">NEXUS<span class="text-accent group-hover:text-white transition-colors">//</span>OS</span>
        </a>
        <div class="hidden md:flex gap-8 text-xs font-mono tracking-widest text-gray-400" data-slot-list="nav_links">
            <a href="#features" class="hover:text-white transition-colors hover-trigger">[01] MODULES</a>
            <a href="#developers" class="hover:text-white transition-colors hover-trigger">[02] DEVELOPERS</a>
            <a href="#pipeline" class="hover:text-white transition-colors hover-trigger">[03] PIPELINE</a>
        </div>
        <div class="flex items-center gap-4">
            <span class="hidden lg:block text-[10px] font-mono text-green-500 flex items-center gap-2" data-slot="status_indicator">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                SYSTEM ONLINE
            </span>
            <button class="border border-white/20 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-black transition-all hover-trigger btn-magnetic" data-slot="nav_cta">
                Console Login
            </button>
        </div>
    </div>
</nav>

<main>
    <!-- HERO SECTION -->
    <section class="skew-target relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none"></div>

        <div class="relative z-20 text-center max-w-5xl px-6">
            <div class="inline-flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
                <span class="font-mono text-[10px] text-accent tracking-widest uppercase" data-slot="hero_badge">v4.0.2 Stable Release</span>
            </div>
            <h1 class="font-display font-bold text-6xl md:text-9xl tracking-tighter mb-6 leading-[0.9] text-white mix-blend-screen scramble-text" data-slot="hero_headline">
                SYNTHETIC <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">COGNITION</span>
            </h1>
            <p class="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-light" data-slot="hero_subheadline">
                The enterprise infrastructure layer for autonomous agents. <br>
                Zero latency. Zero hallucinations. Pure deterministic compute.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button class="bg-accent text-black px-8 py-4 font-bold text-sm uppercase tracking-widest hover:bg-white transition-all hover-trigger w-full sm:w-auto btn-magnetic" data-slot="cta_primary">
                    Start Instance
                </button>
                <button class="px-8 py-4 border border-white/20 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all hover-trigger w-full sm:w-auto btn-magnetic" data-slot="cta_secondary">
                    Read Whitepaper
                </button>
            </div>
        </div>
    </section>

    <!-- MARQUEE -->
    <div class="border-y border-white/5 bg-[#080808] py-8 relative z-20 overflow-hidden marquee-mask w-full">
        <div class="flex whitespace-nowrap animate-marquee w-[max-content]">
            <div class="flex gap-20 px-10 items-center" data-slot-list="client_logos">
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">ORBITAL</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">SYNTHETICS</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">HYPERION</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">VERTEX</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">QUANTUM</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">NVIDIA</span>
            </div>
            <div class="flex gap-20 px-10 items-center">
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">ORBITAL</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">SYNTHETICS</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">HYPERION</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">VERTEX</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">QUANTUM</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">NVIDIA</span>
            </div>
            <div class="flex gap-20 px-10 items-center">
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">ORBITAL</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">SYNTHETICS</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">HYPERION</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">VERTEX</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">QUANTUM</span>
                <span class="font-display font-bold text-2xl text-white/30 hover:text-white transition-colors">NVIDIA</span>
            </div>
        </div>
    </div>

    <!-- BENTO FEATURES -->
    <section id="features" class="skew-target py-32 px-6 relative z-20">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-8">
                <div>
                    <span class="text-accent font-mono text-xs tracking-widest block mb-2" data-slot="features_label">/// CORE MODULES</span>
                    <h2 class="font-display font-bold text-white text-4xl md:text-5xl scramble-text" data-slot="features_headline">Neural Engine</h2>
                </div>
                <div class="text-right">
                    <div class="flex items-center justify-end gap-2 mb-1">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-blink"></span>
                        <span class="font-mono text-xs text-white" data-slot="grid_status">GRID: ACTIVE</span>
                    </div>
                    <p class="text-gray-500 font-mono text-xs uppercase tracking-widest" data-slot="nodes_count">
                        Nodes Online: 8,492
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 grid-rows-3 gap-6 h-auto md:h-[900px]" data-slot-list="bento_features">
                <!-- Vector Synthesis -->
                <div class="md:col-span-2 md:row-span-2 glass-panel spotlight-card rounded-xl overflow-hidden relative group">
                    <div class="scan-line"></div>
                    <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/61d6ed66-a853-4d7e-b477-0127a02a7694_1600w.webp" class="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" alt="Processor">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div class="absolute top-6 right-6 border border-white/20 bg-black/50 px-3 py-1 rounded text-[10px] font-mono text-accent" data-slot="bento_feature_1_tag">PROCESSING_BATCH_04</div>
                    <div class="absolute bottom-0 left-0 p-8 z-10 w-full">
                        <div class="w-10 h-10 bg-accent flex items-center justify-center mb-4 text-black font-bold">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <h3 class="font-display font-bold text-2xl text-white mb-2" data-slot="bento_feature_1_title">Vector Synthesis</h3>
                        <p class="text-gray-300 text-sm max-w-sm" data-slot="bento_feature_1_description">Embedding generation at 400k tokens/sec on dedicated H100 clusters.</p>
                    </div>
                </div>

                <!-- Uptime -->
                <div class="md:col-span-1 md:row-span-1 glass-panel spotlight-card rounded-xl p-6 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <span class="font-mono text-[10px] text-gray-500 uppercase" data-slot="bento_uptime_label">Uptime</span>
                        <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div class="text-center py-2">
                        <div class="text-4xl font-display font-bold text-white counter" data-target="99.99" data-slot="bento_uptime_value">99.99</div>
                        <div class="text-[10px] text-gray-500 mt-1" data-slot="bento_uptime_subtitle">SLA Guarantee</div>
                    </div>
                </div>

                <!-- Encryption -->
                <div class="md:col-span-1 md:row-span-1 glass-panel spotlight-card rounded-xl p-6 flex flex-col justify-between overflow-hidden">
                    <div class="flex items-center gap-2 text-white mb-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <span class="font-display font-bold text-sm" data-slot="bento_security_title">Enclave</span>
                    </div>
                    <div class="relative h-12 overflow-hidden font-mono text-[9px] text-gray-600 leading-relaxed">
                        <div class="animate-[marquee_5s_linear_infinite_reverse] flex flex-col">
                            <span>0x7f8d9a2b3c4d5e6f</span>
                            <span>0x1a2b3c4d5e6f7a8b</span>
                            <span>0x9c8d7e6f5a4b3c2d</span>
                            <span>0x1f2e3d4c5b6a7988</span>
                        </div>
                    </div>
                    <div class="text-[10px] text-accent mt-2 flex items-center gap-1" data-slot="bento_security_badge">
                        <span class="w-1 h-1 bg-accent rounded-full"></span> SOC2 TYPE II
                    </div>
                </div>

                <!-- Rate Limit -->
                <div class="md:col-span-1 md:row-span-1 glass-panel spotlight-card rounded-xl p-6 flex flex-col justify-between">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-mono text-[10px] text-gray-500 uppercase" data-slot="bento_throughput_label">Throughput</span>
                        <svg width="14" height="14" class="text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <div class="flex-grow flex items-center">
                        <div class="w-full bg-white/10 h-16 rounded flex items-end px-1 gap-1">
                            <div class="w-1/5 bg-accent/20 h-[40%] rounded-sm"></div>
                            <div class="w-1/5 bg-accent/40 h-[60%] rounded-sm"></div>
                            <div class="w-1/5 bg-accent/60 h-[30%] rounded-sm"></div>
                            <div class="w-1/5 bg-accent/80 h-[80%] rounded-sm"></div>
                            <div class="w-1/5 bg-accent h-[50%] rounded-sm"></div>
                        </div>
                    </div>
                    <div class="text-right text-[10px] text-white font-mono mt-2" data-slot="bento_throughput_value">4.2M REQ/S</div>
                </div>

                <!-- Anomaly -->
                <div class="md:col-span-1 md:row-span-1 glass-panel spotlight-card rounded-xl p-6 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-red-900/10 z-0"></div>
                    <div class="relative z-10 flex flex-col h-full justify-between">
                        <div class="flex justify-between items-start">
                            <span class="font-display font-bold text-sm text-white" data-slot="bento_threat_title">Threat Shield</span>
                            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse-fast"></div>
                        </div>
                        <div class="font-mono text-[10px] text-red-300/70" data-slot="bento_threat_logs">
                            <div>&gt; SCANNING...</div>
                            <div>&gt; NO THREATS</div>
                            <div>&gt; PACKET_LOSS: 0%</div>
                        </div>
                    </div>
                </div>

                <!-- Context -->
                <div class="md:col-span-2 md:row-span-1 glass-panel spotlight-card rounded-xl p-8 flex items-center justify-between hover-trigger">
                     <div>
                        <h3 class="font-display font-bold text-xl text-white mb-2" data-slot="bento_context_title">128k Context</h3>
                        <p class="text-gray-300 text-xs font-mono" data-slot="bento_context_description">RAG-Optimized Memory Layer</p>
                     </div>
                     <div class="flex flex-col gap-1.5 w-40">
                        <div class="flex justify-between text-[8px] text-gray-500 font-mono mb-1">
                            <span>USAGE</span>
                            <span data-slot="bento_context_usage">82%</span>
                        </div>
                        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-accent to-yellow-500 w-[82%] rounded-full"></div>
                        </div>
                     </div>
                </div>

                <!-- Global Map -->
                <div class="md:col-span-2 md:row-span-1 glass-panel spotlight-card rounded-xl p-6 relative overflow-hidden flex flex-col justify-center">
                    <div class="absolute inset-0 dot-grid opacity-30"></div>
                    <div class="flex justify-between items-center mb-2 z-10 absolute top-6 left-6 right-6">
                        <span class="font-display font-bold text-white text-lg" data-slot="bento_edge_title">Edge Nodes</span>
                        <span class="text-accent text-xs font-mono border border-accent/30 px-2 py-0.5 rounded" data-slot="bento_edge_status">LIVE</span>
                    </div>
                    <div class="relative w-full h-full z-0 mt-8 opacity-60">
                        <div class="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                        <div class="absolute top-[40%] right-[30%] w-1 h-1 bg-gray-500 rounded-full"></div>
                        <div class="absolute top-[60%] left-[40%] w-1 h-1 bg-gray-500 rounded-full"></div>
                        <div class="absolute top-[25%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75 shadow-[0_0_10px_white]"></div>
                        <svg class="absolute inset-0 w-full h-full" style="pointer-events: none;">
                            <line x1="20%" y1="30%" x2="40%" y2="60%" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"></line>
                            <line x1="20%" y1="30%" x2="80%" y2="25%" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"></line>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- DEVELOPER SECTION -->
    <section id="developers" class="skew-target py-24 bg-[#050505] border-t border-white/5 relative z-20">
        <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <span class="text-accent font-mono text-xs tracking-widest block mb-4" data-slot="dev_section_label">/// DEVELOPER EXPERIENCE</span>
                <h2 class="font-display font-bold text-4xl md:text-5xl mb-6 text-white scramble-text" data-slot="dev_section_headline">Built for Builders</h2>
                <p class="text-gray-400 text-lg mb-8 leading-relaxed" data-slot="dev_section_description">
                    Don't wrestle with Docker containers. Our SDK abstracts the complexity of cluster management into a simple Python interface.
                </p>
                <div class="space-y-6" data-slot-list="dev_steps">
                    <div class="group flex gap-4 p-4 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer hover-trigger">
                        <div class="font-mono text-gray-600 text-sm group-hover:text-accent">01</div>
                        <div>
                            <h4 class="font-bold text-white">Pip Install</h4>
                            <p class="text-sm text-gray-500">Get up and running in 30 seconds.</p>
                        </div>
                    </div>
                    <div class="group flex gap-4 p-4 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer hover-trigger">
                        <div class="font-mono text-gray-600 text-sm group-hover:text-accent">02</div>
                        <div>
                            <h4 class="font-bold text-white">Authenticate</h4>
                            <p class="text-sm text-gray-500">Zero-trust API key management.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="relative group hover-trigger">
                <div class="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div class="relative bg-[#0a0a0a] border border-white/10 rounded-lg p-6 font-mono text-sm shadow-2xl overflow-hidden min-h-[300px]">
                    <div class="flex gap-2 mb-6 border-b border-white/5 pb-4">
                        <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <div class="text-gray-400" data-slot="code_preview">
                        <span class="text-purple-400">import</span> nexus <span class="text-purple-400">as</span> nx
                        <span class="text-gray-600"># Connect to the grid</span>
                        client = nx.Client(api_key=<span class="text-green-400">"nx_live_..."</span>)
                        <span class="text-gray-600"># Run deterministic inference</span>
                        response = client.generate(
                        &nbsp;&nbsp;model=<span class="text-green-400">"nexus-v4-turbo"</span>,
                        &nbsp;&nbsp;prompt=<span class="text-green-400">"Optimize this SVG..."</span>,
                        &nbsp;&nbsp;temperature=<span class="text-blue-400">0.0</span>
                        )
                        print(response.content)
                    </div>
                    <div class="mt-2 text-accent animate-pulse">_</div>
                </div>
            </div>
        </div>
    </section>

    <!-- PIPELINE SECTION (STICKY FIXED) -->
    <section id="pipeline" class="py-24 bg-[#050505] relative z-20 border-t border-white/5">
        <div class="max-w-[1400px] mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 relative">

                <!-- Left Column: Sticky Visual -->
                <div class="order-2 lg:order-1 relative">
                    <div class="sticky top-24 w-full aspect-square max-h-[60vh] bg-[#080808] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-10 group shadow-2xl">
                        <!-- Background Grid -->
                        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                        <!-- Central Node -->
                        <div class="relative w-40 h-40 border border-accent rounded-full flex items-center justify-center z-10 shadow-[0_0_50px_rgba(255,59,0,0.3)] bg-black/50 backdrop-blur-sm">
                            <div class="w-32 h-32 bg-accent/10 rounded-full animate-pulse"></div>
                            <div class="absolute text-white font-mono text-xs tracking-widest" data-slot="pipeline_central_label">PROCESSING</div>
                        </div>

                        <!-- Orbiting Nodes -->
                        <div class="absolute w-[70%] h-[70%] border border-white/5 rounded-full animate-spin-slow">
                            <div class="w-4 h-4 bg-white rounded-full absolute -top-2 left-1/2 -translate-x-1/2 shadow-[0_0_15px_white]"></div>
                        </div>
                        <div class="absolute w-[90%] h-[90%] border border-white/5 rounded-full animate-reverse-spin">
                            <div class="w-3 h-3 bg-accent rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Scrollable Text Steps -->
                <div class="order-1 lg:order-2 py-20 pb-0">
                    <span class="text-accent font-mono text-xs tracking-widest block mb-10" data-slot="pipeline_section_label">/// THE PIPELINE</span>

                    <div data-slot-list="pipeline_steps">
                        <div class="step-item mb-48 opacity-30 transition-opacity duration-500">
                            <h3 class="text-4xl font-display font-bold mb-4 text-white" data-slot="pipeline_step_1_title">01. Ingestion</h3>
                            <p class="text-xl text-white leading-relaxed font-light" data-slot="pipeline_step_1_description">
                                Connect your data lakes. We index documents into vector embeddings automatically.
                            </p>
                        </div>

                        <div class="step-item mb-48 opacity-30 transition-opacity duration-500">
                            <h3 class="text-4xl font-display font-bold mb-4 text-white" data-slot="pipeline_step_2_title">02. Reasoning</h3>
                            <p class="text-xl text-white leading-relaxed font-light" data-slot="pipeline_step_2_description">
                                Requests hit our routing layer. Complex logic is routed to H100 clusters for "Chain of Thought" processing.
                            </p>
                        </div>

                        <div class="step-item opacity-30 transition-opacity duration-500">
                            <h3 class="text-4xl font-display font-bold mb-4 text-white" data-slot="pipeline_step_3_title">03. Synthesis</h3>
                            <p class="text-xl text-white leading-relaxed font-light" data-slot="pipeline_step_3_description">
                                The answer is formatted into JSON and delivered via streaming API in sub-20ms.
                            </p>
                        </div>
                    </div>

                    <!-- Spacer to allow scroll past last item -->
                    <div class="h-40"></div>
                </div>
            </div>
        </div>
    </section>

    <!-- PRICING TABLE -->
    <section id="pricing" class="skew-target py-32 px-6 bg-[#050505] relative z-20 border-t border-white/5">
        <div class="max-w-7xl mx-auto">
            <h2 class="font-display font-bold text-4xl text-white text-center mb-16 scramble-text" data-slot="pricing_headline">Compute Tiers</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8" data-slot-list="pricing_tiers">
                <div class="border border-white/10 p-8 rounded-2xl hover:bg-white/5 transition-colors hover-trigger spotlight-card glass-panel">
                    <div class="font-mono text-xs text-gray-500 mb-4 z-10 relative" data-slot="pricing_tier_1_name">/ DEVELOPER</div>
                    <div class="text-3xl font-bold text-white mb-6 z-10 relative" data-slot="pricing_tier_1_price">$0<span class="text-sm font-normal text-gray-500">/mo</span></div>
                    <ul class="space-y-4 text-sm text-gray-300 mb-8 font-mono z-10 relative" data-slot="pricing_tier_1_features">
                        <li class="flex gap-3"><span>&#10003;</span> 5,000 Tokens</li>
                        <li class="flex gap-3"><span>&#10003;</span> 2 Concurrent</li>
                    </ul>
                    <button class="w-full py-3 border border-white/20 rounded font-bold uppercase text-xs tracking-wider text-white hover:bg-white hover:text-black transition-all z-10 relative" data-slot="pricing_tier_1_cta">Start Free</button>
                </div>

                <div class="border border-accent bg-[#0a0a0a] p-8 rounded-2xl relative hover-trigger transform md:-translate-y-4 shadow-[0_0_30px_rgba(255,59,0,0.1)] spotlight-card">
                    <div class="absolute top-0 right-0 bg-accent text-black text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg z-10" data-slot="pricing_tier_2_badge">Popular</div>
                    <div class="font-mono text-xs text-accent mb-4 z-10 relative" data-slot="pricing_tier_2_name">/ PRODUCTION</div>
                    <div class="text-3xl font-bold text-white mb-6 z-10 relative" data-slot="pricing_tier_2_price">$0.02<span class="text-sm font-normal text-gray-500">/1k tokens</span></div>
                    <ul class="space-y-4 text-sm text-gray-300 mb-8 font-mono z-10 relative" data-slot="pricing_tier_2_features">
                        <li class="flex gap-3"><span class="text-accent">&#10003;</span> Unlimited Tokens</li>
                        <li class="flex gap-3"><span class="text-accent">&#10003;</span> 50 Concurrent</li>
                    </ul>
                    <button class="w-full py-3 bg-accent text-black rounded font-bold uppercase text-xs tracking-wider hover:bg-white transition-all z-10 relative" data-slot="pricing_tier_2_cta">Deploy Key</button>
                </div>

                <div class="border border-white/10 p-8 rounded-2xl hover:bg-white/5 transition-colors hover-trigger spotlight-card glass-panel">
                    <div class="font-mono text-xs text-gray-500 mb-4 z-10 relative" data-slot="pricing_tier_3_name">/ CLUSTER</div>
                    <div class="text-3xl font-bold text-white mb-6 z-10 relative" data-slot="pricing_tier_3_price">Custom</div>
                    <ul class="space-y-4 text-sm text-gray-300 mb-8 font-mono z-10 relative" data-slot="pricing_tier_3_features">
                        <li class="flex gap-3"><span>&#10003;</span> Dedicated GPUs</li>
                        <li class="flex gap-3"><span>&#10003;</span> Custom Fine-tuning</li>
                    </ul>
                    <button class="w-full py-3 border border-white/20 rounded font-bold uppercase text-xs tracking-wider text-white hover:bg-white hover:text-black transition-all z-10 relative" data-slot="pricing_tier_3_cta">Contact Sales</button>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-[#020202] pt-32 pb-10 px-6 border-t border-white/10 relative overflow-hidden">
        <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-none select-none pointer-events-none opacity-5">
            <span class="text-[20vw] font-display font-black text-white whitespace-nowrap -ml-10" data-slot="footer_watermark">NEXUS</span>
        </div>

        <div class="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div>
                <h3 class="text-2xl font-display font-bold text-white mb-6" data-slot="footer_cta_headline">Ready to scale?</h3>
                <div class="flex gap-4">
                    <input type="email" placeholder="email@company.com" class="bg-white/5 border border-white/10 px-4 py-3 rounded text-sm w-64 focus:outline-none focus:border-accent text-white" data-slot="footer_email_placeholder">
                    <button class="bg-accent text-black px-6 py-3 rounded font-bold text-sm hover:bg-white transition-colors" data-slot="footer_subscribe_cta">JOIN</button>
                </div>
            </div>

            <div class="flex gap-12 text-sm text-gray-500 font-mono tracking-wider uppercase" data-slot-list="footer_link_columns">
                <div class="flex flex-col gap-3">
                    <span class="text-white">Platform</span>
                    <a href="#" class="hover:text-accent transition-colors">API</a>
                    <a href="#" class="hover:text-accent transition-colors">Docs</a>
                    <a href="#" class="hover:text-accent transition-colors">Status</a>
                </div>
                <div class="flex flex-col gap-3">
                    <span class="text-white">Legal</span>
                    <a href="#" class="hover:text-accent transition-colors">Privacy</a>
                    <a href="#" class="hover:text-accent transition-colors">Terms</a>
                </div>
            </div>
        </div>

        <div class="max-w-[1400px] mx-auto mt-20 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-mono uppercase">
            <span data-slot="footer_copyright">&copy; 2025 NEXUS LABS INC.</span>
            <span class="mt-2 md:mt-0" data-slot="footer_locations">TOKYO / SAN FRANCISCO / BERLIN</span>
        </div>
    </footer>

</main>

<script>
    // --- 1. SETUP LENIS & SCROLL SKEW ---
    const lenis = new Lenis({
        lerp: 0.1,
        smooth: true,
        direction: 'vertical',
    });

    let currentSkew = 0;
    function raf(time) {
        lenis.raf(time);

        // Interaction: Liquid Scroll Skew
        const skewTarget = lenis.velocity * 0.1;
        currentSkew += (skewTarget - currentSkew) * 0.1;
        const clampedSkew = Math.max(Math.min(currentSkew, 5), -5);

        document.querySelectorAll('.skew-target').forEach(el => {
            el.style.transform = \`skewY(\${clampedSkew}deg)\`;
        });

        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- 2. SPOTLIGHT INTERACTION ---
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.spotlight-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', \`\${x}px\`);
            card.style.setProperty('--mouse-y', \`\${y}px\`);
        });
    });

    // --- 3. TEXT SCRAMBLE INTERACTION ---
    class ScrambleText {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\\\/[]{}--=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += \`<span class="opacity-50">\${char}</span>\`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    const scrambleElements = document.querySelectorAll('.scramble-text');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const fx = new ScrambleText(el);
                fx.setText(el.innerText);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    scrambleElements.forEach(el => observer.observe(el));

    // --- 4. MAGNETIC BUTTONS ---
    const buttons = document.querySelectorAll('.btn-magnetic');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.2 });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.2 });
        });
    });

    // --- 5. ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    const counter = document.querySelector('.counter');
    if(counter) {
        gsap.from(counter, {
            textContent: 90.00,
            duration: 2,
            ease: "power1.out",
            snap: { textContent: 0.01 },
            scrollTrigger: {
                trigger: counter,
                start: "top 85%",
                once: true
            },
            onUpdate: function() {
                this.targets()[0].innerHTML = parseFloat(this.targets()[0].textContent).toFixed(2);
            }
        });
    }

    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach((item) => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 80%",
                end: "bottom center",
                onEnter: () => gsap.to(item, { opacity: 1, duration: 0.5 }),
                onLeave: () => gsap.to(item, { opacity: 0.3, duration: 0.5 }),
                onEnterBack: () => gsap.to(item, { opacity: 1, duration: 0.5 }),
                onLeaveBack: () => gsap.to(item, { opacity: 0.3, duration: 0.5 }),
            }
        });
    });

    gsap.utils.toArray('.glass-panel').forEach((panel, i) => {
        gsap.from(panel, {
            scrollTrigger: {
                trigger: panel,
                start: "top 90%"
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.05,
            ease: "power3.out"
        });
    });

</script>

</body></html>`,

  // Content Map defining all replaceable slots
  contentMap: createContentMap({
    templateId: 'nexus-enterprise-landing',
    version: '1.0.0',
    slots: [
      // === NAVIGATION ===
      createTextSlot({
        id: 'logo_text',
        selector: '[data-slot="logo_text"]',
        label: 'Logo Text',
        description: 'Brand name in navigation (supports // separator)',
        prdMapping: 'prd.productName',
        fallback: 'NEXUS//OS',
        validation: { required: true, maxLength: 30 },
      }),
      createListSlot({
        id: 'nav_links',
        selector: '[data-slot-list="nav_links"]',
        label: 'Navigation Links',
        description: 'Header navigation links with bracket numbering',
        prdMapping: null,
        fallback: [
          { text: '[01] MODULES', href: '#features' },
          { text: '[02] DEVELOPERS', href: '#developers' },
          { text: '[03] PIPELINE', href: '#pipeline' },
        ],
        itemSchema: {
          fields: [
            { id: 'text', type: 'text', label: 'Link Text' },
            { id: 'href', type: 'link', label: 'URL' },
          ],
        },
      }),
      createTextSlot({
        id: 'status_indicator',
        selector: '[data-slot="status_indicator"]',
        label: 'Status Indicator',
        description: 'System status text in nav',
        prdMapping: null,
        fallback: 'SYSTEM ONLINE',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'nav_cta',
        selector: '[data-slot="nav_cta"]',
        label: 'Navigation CTA',
        description: 'Button text in the nav bar',
        prdMapping: null,
        fallback: 'Console Login',
        validation: { maxLength: 20 },
      }),

      // === HERO SECTION ===
      createTextSlot({
        id: 'page_title',
        selector: '[data-slot="page_title"]',
        label: 'Page Title',
        description: 'Browser tab title',
        prdMapping: null,
        fallback: 'NEXUS // OS | Enterprise AI Infrastructure',
        validation: { maxLength: 60 },
      }),
      createTextSlot({
        id: 'hero_badge',
        selector: '[data-slot="hero_badge"]',
        label: 'Hero Badge',
        description: 'Small badge text above the headline (version, status)',
        prdMapping: null,
        fallback: 'v4.0.2 Stable Release',
        validation: { maxLength: 40 },
      }),
      createRichTextSlot({
        id: 'hero_headline',
        selector: '[data-slot="hero_headline"]',
        label: 'Hero Headline',
        description: 'Main attention-grabbing headline with gradient text support',
        prdMapping: null,
        fallback: 'SYNTHETIC <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">COGNITION</span>',
        validation: { required: true, maxLength: 100 },
      }),
      createTextSlot({
        id: 'hero_subheadline',
        selector: '[data-slot="hero_subheadline"]',
        label: 'Hero Subheadline',
        description: 'Supporting text under the headline',
        prdMapping: 'prd.valueProposition',
        fallback: 'The enterprise infrastructure layer for autonomous agents. Zero latency. Zero hallucinations. Pure deterministic compute.',
        validation: { maxLength: 200 },
      }),
      createTextSlot({
        id: 'cta_primary',
        selector: '[data-slot="cta_primary"]',
        label: 'Primary CTA',
        description: 'Main call-to-action button text',
        prdMapping: null,
        fallback: 'Start Instance',
        validation: { maxLength: 25 },
      }),
      createTextSlot({
        id: 'cta_secondary',
        selector: '[data-slot="cta_secondary"]',
        label: 'Secondary CTA',
        description: 'Secondary action button text',
        prdMapping: null,
        fallback: 'Read Whitepaper',
        validation: { maxLength: 25 },
      }),

      // === MARQUEE / CLIENT LOGOS ===
      createListSlot({
        id: 'client_logos',
        selector: '[data-slot-list="client_logos"]',
        label: 'Client Logos',
        description: 'Client/partner names for marquee strip',
        prdMapping: null,
        fallback: [
          { name: 'ORBITAL' },
          { name: 'SYNTHETICS' },
          { name: 'HYPERION' },
          { name: 'VERTEX' },
          { name: 'QUANTUM' },
          { name: 'NVIDIA' },
        ],
        itemSchema: {
          fields: [
            { id: 'name', type: 'text', label: 'Company Name' },
          ],
        },
        validation: { minLength: 4, maxLength: 8 },
      }),

      // === BENTO FEATURES SECTION ===
      createTextSlot({
        id: 'features_label',
        selector: '[data-slot="features_label"]',
        label: 'Features Section Label',
        description: 'Small label above features headline',
        prdMapping: null,
        fallback: '/// CORE MODULES',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'features_headline',
        selector: '[data-slot="features_headline"]',
        label: 'Features Headline',
        description: 'Main headline for features section',
        prdMapping: null,
        fallback: 'Neural Engine',
        validation: { maxLength: 40 },
      }),
      createTextSlot({
        id: 'grid_status',
        selector: '[data-slot="grid_status"]',
        label: 'Grid Status',
        description: 'Status indicator text for features grid',
        prdMapping: null,
        fallback: 'GRID: ACTIVE',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'nodes_count',
        selector: '[data-slot="nodes_count"]',
        label: 'Nodes Count',
        description: 'Nodes online counter text',
        prdMapping: null,
        fallback: 'Nodes Online: 8,492',
        validation: { maxLength: 30 },
      }),

      // Bento Feature 1 (Large card)
      createTextSlot({
        id: 'bento_feature_1_tag',
        selector: '[data-slot="bento_feature_1_tag"]',
        label: 'Feature 1 Tag',
        description: 'Tag/badge for main feature card',
        prdMapping: null,
        fallback: 'PROCESSING_BATCH_04',
        validation: { maxLength: 25 },
      }),
      createTextSlot({
        id: 'bento_feature_1_title',
        selector: '[data-slot="bento_feature_1_title"]',
        label: 'Feature 1 Title',
        description: 'Title for main feature card',
        prdMapping: 'features[0].name',
        fallback: 'Vector Synthesis',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'bento_feature_1_description',
        selector: '[data-slot="bento_feature_1_description"]',
        label: 'Feature 1 Description',
        description: 'Description for main feature card',
        prdMapping: 'features[0].description',
        fallback: 'Embedding generation at 400k tokens/sec on dedicated H100 clusters.',
        validation: { maxLength: 100 },
      }),

      // Uptime card
      createTextSlot({
        id: 'bento_uptime_label',
        selector: '[data-slot="bento_uptime_label"]',
        label: 'Uptime Label',
        description: 'Label for uptime metric card',
        prdMapping: null,
        fallback: 'Uptime',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'bento_uptime_value',
        selector: '[data-slot="bento_uptime_value"]',
        label: 'Uptime Value',
        description: 'Uptime percentage value',
        prdMapping: null,
        fallback: '99.99',
        validation: { maxLength: 10 },
      }),
      createTextSlot({
        id: 'bento_uptime_subtitle',
        selector: '[data-slot="bento_uptime_subtitle"]',
        label: 'Uptime Subtitle',
        description: 'Subtitle under uptime value',
        prdMapping: null,
        fallback: 'SLA Guarantee',
        validation: { maxLength: 20 },
      }),

      // Security card
      createTextSlot({
        id: 'bento_security_title',
        selector: '[data-slot="bento_security_title"]',
        label: 'Security Title',
        description: 'Title for security/encryption card',
        prdMapping: null,
        fallback: 'Enclave',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'bento_security_badge',
        selector: '[data-slot="bento_security_badge"]',
        label: 'Security Badge',
        description: 'Compliance badge text',
        prdMapping: null,
        fallback: 'SOC2 TYPE II',
        validation: { maxLength: 20 },
      }),

      // Throughput card
      createTextSlot({
        id: 'bento_throughput_label',
        selector: '[data-slot="bento_throughput_label"]',
        label: 'Throughput Label',
        description: 'Label for throughput metric card',
        prdMapping: null,
        fallback: 'Throughput',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'bento_throughput_value',
        selector: '[data-slot="bento_throughput_value"]',
        label: 'Throughput Value',
        description: 'Throughput metric value',
        prdMapping: null,
        fallback: '4.2M REQ/S',
        validation: { maxLength: 15 },
      }),

      // Threat card
      createTextSlot({
        id: 'bento_threat_title',
        selector: '[data-slot="bento_threat_title"]',
        label: 'Threat Shield Title',
        description: 'Title for threat monitoring card',
        prdMapping: null,
        fallback: 'Threat Shield',
        validation: { maxLength: 20 },
      }),
      createRichTextSlot({
        id: 'bento_threat_logs',
        selector: '[data-slot="bento_threat_logs"]',
        label: 'Threat Logs',
        description: 'Terminal-style log lines',
        prdMapping: null,
        fallback: '<div>&gt; SCANNING...</div><div>&gt; NO THREATS</div><div>&gt; PACKET_LOSS: 0%</div>',
        validation: { maxLength: 100 },
      }),

      // Context card
      createTextSlot({
        id: 'bento_context_title',
        selector: '[data-slot="bento_context_title"]',
        label: 'Context Title',
        description: 'Title for context window card',
        prdMapping: null,
        fallback: '128k Context',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'bento_context_description',
        selector: '[data-slot="bento_context_description"]',
        label: 'Context Description',
        description: 'Description for context card',
        prdMapping: null,
        fallback: 'RAG-Optimized Memory Layer',
        validation: { maxLength: 40 },
      }),
      createTextSlot({
        id: 'bento_context_usage',
        selector: '[data-slot="bento_context_usage"]',
        label: 'Context Usage',
        description: 'Usage percentage value',
        prdMapping: null,
        fallback: '82%',
        validation: { maxLength: 5 },
      }),

      // Edge nodes card
      createTextSlot({
        id: 'bento_edge_title',
        selector: '[data-slot="bento_edge_title"]',
        label: 'Edge Nodes Title',
        description: 'Title for edge nodes map card',
        prdMapping: null,
        fallback: 'Edge Nodes',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'bento_edge_status',
        selector: '[data-slot="bento_edge_status"]',
        label: 'Edge Status',
        description: 'Status badge for edge nodes',
        prdMapping: null,
        fallback: 'LIVE',
        validation: { maxLength: 10 },
      }),

      // === DEVELOPER SECTION ===
      createTextSlot({
        id: 'dev_section_label',
        selector: '[data-slot="dev_section_label"]',
        label: 'Developer Section Label',
        description: 'Small label above developer section headline',
        prdMapping: null,
        fallback: '/// DEVELOPER EXPERIENCE',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'dev_section_headline',
        selector: '[data-slot="dev_section_headline"]',
        label: 'Developer Section Headline',
        description: 'Main headline for developer section',
        prdMapping: null,
        fallback: 'Built for Builders',
        validation: { maxLength: 40 },
      }),
      createTextSlot({
        id: 'dev_section_description',
        selector: '[data-slot="dev_section_description"]',
        label: 'Developer Section Description',
        description: 'Description text for developer section',
        prdMapping: null,
        fallback: "Don't wrestle with Docker containers. Our SDK abstracts the complexity of cluster management into a simple Python interface.",
        validation: { maxLength: 200 },
      }),
      createListSlot({
        id: 'dev_steps',
        selector: '[data-slot-list="dev_steps"]',
        label: 'Developer Steps',
        description: 'Onboarding steps for developers',
        prdMapping: null,
        fallback: [
          { number: '01', title: 'Pip Install', description: 'Get up and running in 30 seconds.' },
          { number: '02', title: 'Authenticate', description: 'Zero-trust API key management.' },
        ],
        itemSchema: {
          fields: [
            { id: 'number', type: 'text', label: 'Step Number' },
            { id: 'title', type: 'text', label: 'Step Title' },
            { id: 'description', type: 'text', label: 'Step Description' },
          ],
        },
        validation: { minLength: 2, maxLength: 4 },
      }),
      createRichTextSlot({
        id: 'code_preview',
        selector: '[data-slot="code_preview"]',
        label: 'Code Preview',
        description: 'Code snippet in the terminal preview',
        prdMapping: null,
        fallback: '<span class="text-purple-400">import</span> nexus <span class="text-purple-400">as</span> nx\n<span class="text-gray-600"># Connect to the grid</span>\nclient = nx.Client(api_key=<span class="text-green-400">"nx_live_..."</span>)',
        validation: { maxLength: 500 },
      }),

      // === PIPELINE SECTION ===
      createTextSlot({
        id: 'pipeline_section_label',
        selector: '[data-slot="pipeline_section_label"]',
        label: 'Pipeline Section Label',
        description: 'Small label above pipeline section',
        prdMapping: null,
        fallback: '/// THE PIPELINE',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'pipeline_central_label',
        selector: '[data-slot="pipeline_central_label"]',
        label: 'Pipeline Central Label',
        description: 'Label in the center of the orbital visualization',
        prdMapping: null,
        fallback: 'PROCESSING',
        validation: { maxLength: 15 },
      }),
      createListSlot({
        id: 'pipeline_steps',
        selector: '[data-slot-list="pipeline_steps"]',
        label: 'Pipeline Steps',
        description: 'Steps in the pipeline process',
        prdMapping: null,
        fallback: [
          { title: '01. Ingestion', description: 'Connect your data lakes. We index documents into vector embeddings automatically.' },
          { title: '02. Reasoning', description: 'Requests hit our routing layer. Complex logic is routed to H100 clusters for "Chain of Thought" processing.' },
          { title: '03. Synthesis', description: 'The answer is formatted into JSON and delivered via streaming API in sub-20ms.' },
        ],
        itemSchema: {
          fields: [
            { id: 'title', type: 'text', label: 'Step Title' },
            { id: 'description', type: 'text', label: 'Step Description' },
          ],
        },
        validation: { minLength: 2, maxLength: 5 },
      }),

      // === PRICING SECTION ===
      createTextSlot({
        id: 'pricing_headline',
        selector: '[data-slot="pricing_headline"]',
        label: 'Pricing Headline',
        description: 'Main headline for pricing section',
        prdMapping: null,
        fallback: 'Compute Tiers',
        validation: { maxLength: 30 },
      }),

      // Tier 1
      createTextSlot({
        id: 'pricing_tier_1_name',
        selector: '[data-slot="pricing_tier_1_name"]',
        label: 'Tier 1 Name',
        description: 'Name for first pricing tier',
        prdMapping: null,
        fallback: '/ DEVELOPER',
        validation: { maxLength: 20 },
      }),
      createRichTextSlot({
        id: 'pricing_tier_1_price',
        selector: '[data-slot="pricing_tier_1_price"]',
        label: 'Tier 1 Price',
        description: 'Price display for tier 1',
        prdMapping: null,
        fallback: '$0<span class="text-sm font-normal text-gray-500">/mo</span>',
        validation: { maxLength: 30 },
      }),
      createRichTextSlot({
        id: 'pricing_tier_1_features',
        selector: '[data-slot="pricing_tier_1_features"]',
        label: 'Tier 1 Features',
        description: 'Feature list for tier 1',
        prdMapping: null,
        fallback: '<li class="flex gap-3"><span>&#10003;</span> 5,000 Tokens</li><li class="flex gap-3"><span>&#10003;</span> 2 Concurrent</li>',
        validation: { maxLength: 300 },
      }),
      createTextSlot({
        id: 'pricing_tier_1_cta',
        selector: '[data-slot="pricing_tier_1_cta"]',
        label: 'Tier 1 CTA',
        description: 'Button text for tier 1',
        prdMapping: null,
        fallback: 'Start Free',
        validation: { maxLength: 20 },
      }),

      // Tier 2 (Featured)
      createTextSlot({
        id: 'pricing_tier_2_badge',
        selector: '[data-slot="pricing_tier_2_badge"]',
        label: 'Tier 2 Badge',
        description: 'Badge text for featured tier',
        prdMapping: null,
        fallback: 'Popular',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'pricing_tier_2_name',
        selector: '[data-slot="pricing_tier_2_name"]',
        label: 'Tier 2 Name',
        description: 'Name for second pricing tier',
        prdMapping: null,
        fallback: '/ PRODUCTION',
        validation: { maxLength: 20 },
      }),
      createRichTextSlot({
        id: 'pricing_tier_2_price',
        selector: '[data-slot="pricing_tier_2_price"]',
        label: 'Tier 2 Price',
        description: 'Price display for tier 2',
        prdMapping: null,
        fallback: '$0.02<span class="text-sm font-normal text-gray-500">/1k tokens</span>',
        validation: { maxLength: 30 },
      }),
      createRichTextSlot({
        id: 'pricing_tier_2_features',
        selector: '[data-slot="pricing_tier_2_features"]',
        label: 'Tier 2 Features',
        description: 'Feature list for tier 2',
        prdMapping: null,
        fallback: '<li class="flex gap-3"><span class="text-accent">&#10003;</span> Unlimited Tokens</li><li class="flex gap-3"><span class="text-accent">&#10003;</span> 50 Concurrent</li>',
        validation: { maxLength: 300 },
      }),
      createTextSlot({
        id: 'pricing_tier_2_cta',
        selector: '[data-slot="pricing_tier_2_cta"]',
        label: 'Tier 2 CTA',
        description: 'Button text for tier 2',
        prdMapping: null,
        fallback: 'Deploy Key',
        validation: { maxLength: 20 },
      }),

      // Tier 3
      createTextSlot({
        id: 'pricing_tier_3_name',
        selector: '[data-slot="pricing_tier_3_name"]',
        label: 'Tier 3 Name',
        description: 'Name for third pricing tier',
        prdMapping: null,
        fallback: '/ CLUSTER',
        validation: { maxLength: 20 },
      }),
      createTextSlot({
        id: 'pricing_tier_3_price',
        selector: '[data-slot="pricing_tier_3_price"]',
        label: 'Tier 3 Price',
        description: 'Price display for tier 3',
        prdMapping: null,
        fallback: 'Custom',
        validation: { maxLength: 20 },
      }),
      createRichTextSlot({
        id: 'pricing_tier_3_features',
        selector: '[data-slot="pricing_tier_3_features"]',
        label: 'Tier 3 Features',
        description: 'Feature list for tier 3',
        prdMapping: null,
        fallback: '<li class="flex gap-3"><span>&#10003;</span> Dedicated GPUs</li><li class="flex gap-3"><span>&#10003;</span> Custom Fine-tuning</li>',
        validation: { maxLength: 300 },
      }),
      createTextSlot({
        id: 'pricing_tier_3_cta',
        selector: '[data-slot="pricing_tier_3_cta"]',
        label: 'Tier 3 CTA',
        description: 'Button text for tier 3',
        prdMapping: null,
        fallback: 'Contact Sales',
        validation: { maxLength: 20 },
      }),

      // === FOOTER ===
      createTextSlot({
        id: 'footer_watermark',
        selector: '[data-slot="footer_watermark"]',
        label: 'Footer Watermark',
        description: 'Large background watermark text',
        prdMapping: null,
        fallback: 'NEXUS',
        validation: { maxLength: 15 },
      }),
      createTextSlot({
        id: 'footer_cta_headline',
        selector: '[data-slot="footer_cta_headline"]',
        label: 'Footer CTA Headline',
        description: 'Headline above email signup',
        prdMapping: null,
        fallback: 'Ready to scale?',
        validation: { maxLength: 30 },
      }),
      createTextSlot({
        id: 'footer_subscribe_cta',
        selector: '[data-slot="footer_subscribe_cta"]',
        label: 'Subscribe Button',
        description: 'Text for subscribe/join button',
        prdMapping: null,
        fallback: 'JOIN',
        validation: { maxLength: 15 },
      }),
      createListSlot({
        id: 'footer_link_columns',
        selector: '[data-slot-list="footer_link_columns"]',
        label: 'Footer Link Columns',
        description: 'Footer navigation columns',
        prdMapping: null,
        fallback: [
          {
            title: 'Platform',
            links: [
              { text: 'API', href: '#' },
              { text: 'Docs', href: '#' },
              { text: 'Status', href: '#' },
            ]
          },
          {
            title: 'Legal',
            links: [
              { text: 'Privacy', href: '#' },
              { text: 'Terms', href: '#' },
            ]
          },
        ],
        itemSchema: {
          fields: [
            { id: 'title', type: 'text', label: 'Column Title' },
            { id: 'links', type: 'list', label: 'Links', itemSchema: {
              fields: [
                { id: 'text', type: 'text', label: 'Link Text' },
                { id: 'href', type: 'link', label: 'URL' },
              ]
            }},
          ],
        },
      }),
      createTextSlot({
        id: 'footer_copyright',
        selector: '[data-slot="footer_copyright"]',
        label: 'Footer Copyright',
        description: 'Copyright text in footer',
        prdMapping: null,
        fallback: '© 2025 NEXUS LABS INC.',
        validation: { maxLength: 50 },
      }),
      createTextSlot({
        id: 'footer_locations',
        selector: '[data-slot="footer_locations"]',
        label: 'Footer Locations',
        description: 'Office locations in footer',
        prdMapping: null,
        fallback: 'TOKYO / SAN FRANCISCO / BERLIN',
        validation: { maxLength: 50 },
      }),
    ],

    // Group slots by section for UI organization
    sections: {
      navigation: ['logo_text', 'nav_links', 'status_indicator', 'nav_cta'],
      hero: ['page_title', 'hero_badge', 'hero_headline', 'hero_subheadline', 'cta_primary', 'cta_secondary'],
      marquee: ['client_logos'],
      features: [
        'features_label', 'features_headline', 'grid_status', 'nodes_count',
        'bento_feature_1_tag', 'bento_feature_1_title', 'bento_feature_1_description',
        'bento_uptime_label', 'bento_uptime_value', 'bento_uptime_subtitle',
        'bento_security_title', 'bento_security_badge',
        'bento_throughput_label', 'bento_throughput_value',
        'bento_threat_title', 'bento_threat_logs',
        'bento_context_title', 'bento_context_description', 'bento_context_usage',
        'bento_edge_title', 'bento_edge_status',
      ],
      developer: ['dev_section_label', 'dev_section_headline', 'dev_section_description', 'dev_steps', 'code_preview'],
      pipeline: ['pipeline_section_label', 'pipeline_central_label', 'pipeline_steps'],
      pricing: [
        'pricing_headline',
        'pricing_tier_1_name', 'pricing_tier_1_price', 'pricing_tier_1_features', 'pricing_tier_1_cta',
        'pricing_tier_2_badge', 'pricing_tier_2_name', 'pricing_tier_2_price', 'pricing_tier_2_features', 'pricing_tier_2_cta',
        'pricing_tier_3_name', 'pricing_tier_3_price', 'pricing_tier_3_features', 'pricing_tier_3_cta',
      ],
      footer: ['footer_watermark', 'footer_cta_headline', 'footer_subscribe_cta', 'footer_link_columns', 'footer_copyright', 'footer_locations'],
    },

    // CSS variable mappings for design token overrides
    designTokenOverrides: DEFAULT_TOKEN_OVERRIDES,
  }),

  // Template metadata
  meta: {
    author: 'IdeaForge',
    createdAt: '2025-12-28',
    tags: ['landing', 'enterprise', 'ai', 'saas', 'dark-theme', 'bento', '3d-background', 'animations', 'pricing', 'futuristic'],
    complexity: 'advanced',
    estimatedTokens: 2500,
    previewImage: null,
  },

  archetype: {
    primary: 'enterprise-technical',
    secondary: ['startup-velocity'],
    compatibility: {
      'enterprise-technical': 95,
      'startup-velocity': 70,
      'creator-aspirational': 30,
      'consumer-premium': 40,
    },
  },
};

export default NEXUS_ENTERPRISE_TEMPLATE;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Typewriter effect for hero input
const prompts = [
  'Build a SaaS for team collaboration...',
  'Create a marketplace for digital assets...',
  'Design an AI writing assistant...',
  'Generate a project management tool...',
];

function TypewriterInput() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const prompt = prompts[currentPromptIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < prompt.length) {
          setCurrentText(prompt.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(prompt.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
        }
      }
    }, isDeleting ? 30 : 50);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPromptIndex]);

  return (
    <div className="flex-1 text-left text-base text-white font-mono h-6 flex items-center overflow-hidden">
      <span>{currentText}</span>
      <span className="w-1.5 h-5 bg-indigo-500 inline-block ml-1 animate-pulse" />
    </div>
  );
}

// Shiny CTA Button
function ShinyButton({ children, to }) {
  return (
    <Link to={to} className="shiny-cta group">
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-[#888888] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Custom Styles */}
      <style>{`
        .glass-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
        }
        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
        }
        .bg-grid {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .input-glow:focus-within {
          box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.3);
          border-color: rgba(99, 102, 241, 0.5);
        }
        @property --gradient-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        .shiny-cta {
          --gradient-angle: 0deg;
          position: relative;
          overflow: hidden;
          border-radius: 9999px;
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 500;
          color: #ffffff;
          background: linear-gradient(#000000, #000000) padding-box,
                      conic-gradient(from var(--gradient-angle), transparent 0%, #4f46e5 5%, #818cf8 15%, #4f46e5 30%, transparent 40%, transparent 100%) border-box;
          border: 1px solid transparent;
          box-shadow: inset 0 0 0 1px #1a1818;
          cursor: pointer;
          animation: border-spin 2.5s linear infinite;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        @keyframes border-spin { to { --gradient-angle: 360deg; } }
        .shiny-cta:hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px -5px rgba(79, 70, 229, 0.3), inset 0 0 0 1px #2e2e2e;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${scrolled ? 'border-white/5 bg-[#030303]/80 backdrop-blur-xl' : 'border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
                <path d="M12 3L3 9V21H21V9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-medium">IdeaForge</span>
          </Link>

          <div className="flex gap-6 items-center">
            <a href="#features" className="hover:text-white transition-colors hidden sm:block text-xs font-medium">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors hidden sm:block text-xs font-medium">Workflow</a>
            <Link to="/app" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/app" className="text-xs font-medium text-black bg-white hover:bg-gray-200 transition-colors px-3 py-1.5 rounded-md tracking-tight">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="overflow-hidden pt-32 pb-24 relative">
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" style={{ maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 100%)' }} />

        <div className="flex flex-col z-10 text-center max-w-4xl mx-auto px-6 relative items-center">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
            Research to code
            <br />
            <span className="text-gray-600">in minutes, not weeks</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mb-10 font-light leading-relaxed">
            IdeaForge transforms your research into production-ready PRDs,
            features, and AI coding agent prompts, all evidence-based.
          </p>

          {/* Animated Input */}
          <div className="w-full max-w-xl relative group z-10 mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="flex input-glow bg-[#0a0a0a] border-white/10 border rounded-xl py-3 px-5 relative shadow-2xl items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 mr-4 animate-pulse">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
              </svg>
              <TypewriterInput />
              <button className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors ml-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-12">
            <ShinyButton to="/app">Start Building</ShinyButton>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-20">
            <span>Works with:</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-300">Claude Code</span>
            <span className="text-gray-700">|</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Cursor</span>
            <span className="text-gray-700">|</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-300/80">Gemini</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-3xl blur-2xl opacity-50" />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {/* Window Bar */}
              <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] font-mono text-gray-500">IdeaForge — Research to Production</span>
                <div className="w-16" />
              </div>

              {/* Content */}
              <div className="grid grid-cols-12 gap-0 min-h-[400px]">
                {/* Sidebar */}
                <div className="col-span-3 border-r border-white/5 p-4">
                  <div className="space-y-1">
                    {[
                      { name: 'Research', done: true },
                      { name: 'Analysis', done: true },
                      { name: 'Features', active: true },
                      { name: 'PRD', done: false },
                      { name: 'Prompts', done: false },
                      { name: 'Stories', done: false },
                    ].map((step, i) => (
                      <div
                        key={step.name}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                          step.active
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            : 'text-gray-500 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                          step.done ? 'bg-emerald-500/20 text-emerald-400' :
                          step.active ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-white/5 text-gray-600'
                        }`}>
                          {step.done ? '✓' : i + 1}
                        </div>
                        {step.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main */}
                <div className="col-span-9 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white font-medium text-sm mb-1">Generated Features</h3>
                      <p className="text-gray-600 text-xs">12 features extracted from research</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'AI-Powered Research Analysis', status: 'Accepted', priority: 'MVP' },
                      { name: 'Evidence-Based Feature Generation', status: 'Accepted', priority: 'MVP' },
                      { name: 'Multi-Format Export System', status: 'Pending', priority: 'High' },
                    ].map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${feature.status === 'Accepted' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                          <span className="text-gray-300 text-xs">{feature.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            feature.priority === 'MVP' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-gray-400'
                          }`}>
                            {feature.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] text-gray-600">
                    <span>3 of 12 features shown</span>
                    <span className="text-indigo-400 cursor-pointer hover:text-indigo-300">View all →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="border-y border-white/5 bg-[#050505] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-400 mb-6">
              6-Step Workflow
            </div>
            <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-4">
              From chaos to clarity
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Transform scattered research into structured specifications that AI coding assistants can actually execute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Import Research',
                desc: 'Paste your market research, competitor analysis, or user interviews. Any format works.',
                color: 'indigo'
              },
              {
                step: '02',
                title: 'AI Analysis',
                desc: 'Extract market insights, pain points, technical requirements, and success metrics automatically.',
                color: 'purple'
              },
              {
                step: '03',
                title: 'Generate Features',
                desc: 'Get evidence-based feature suggestions with user stories, acceptance criteria, and complexity.',
                color: 'blue'
              },
              {
                step: '04',
                title: 'Create PRD',
                desc: 'Generate comprehensive Product Requirement Documents with functional specs and NFRs.',
                color: 'emerald'
              },
              {
                step: '05',
                title: 'Export Prompts',
                desc: 'Output optimized prompts for Claude Code, Cursor, Gemini, or universal format.',
                color: 'yellow'
              },
              {
                step: '06',
                title: 'Story Files',
                desc: 'Generate BMAD-compliant atomic story files with traceability and security requirements.',
                color: 'rose'
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 rounded-xl group">
                <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-400 font-mono text-xs mb-4 group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <h3 className="text-white font-medium mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-400 mb-6">
              3 Ways of Building
            </div>
            <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-4">
              Research meets specification
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every feature, every requirement, every prompt, traced back to real research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Analysis Card */}
            <div className="glass-card group overflow-hidden rounded-2xl p-8 relative flex flex-col h-full">
              <div className="h-32 w-full mb-6 rounded-xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/10 flex items-center justify-center relative overflow-hidden group-hover:border-indigo-500/20 transition-all duration-500">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf810_1px,transparent_1px),linear-gradient(to_bottom,#818cf810_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                <div className="relative w-40 p-3 rounded-lg bg-[#0A0A0A] border border-white/5 shadow-2xl flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-1 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-1 border-b border-white/5 pb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <div className="h-1 w-12 bg-white/10 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="self-end h-1.5 w-16 bg-indigo-500/20 rounded-full" />
                    <div className="h-1.5 w-24 bg-white/5 rounded-full" />
                    <div className="h-1.5 w-20 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg text-white font-medium mb-3">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Multi-model AI extracts insights, identifies gaps, and generates evidence-based features from your research.
              </p>
            </div>

            {/* PRD Generation Card */}
            <div className="glass-card group overflow-hidden rounded-2xl p-8 relative flex flex-col h-full">
              <div className="h-32 w-full mb-6 rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/10 flex items-center justify-center relative overflow-hidden group-hover:border-emerald-500/20 transition-all duration-500">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-[#0A0A0A] border border-emerald-500/30 shadow-lg flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-lg text-white font-medium mb-3">PRD Generation</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Create comprehensive Product Requirement Documents with functional requirements, NFRs, and success metrics.
              </p>
            </div>

            {/* Agent Prompts Card */}
            <div className="glass-card group overflow-hidden rounded-2xl p-8 relative flex flex-col h-full">
              <div className="h-32 w-full mb-6 rounded-xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/10 flex items-center justify-center relative overflow-hidden group-hover:border-yellow-500/20 transition-all duration-500">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#eab30810_1px,transparent_1px),linear-gradient(to_bottom,#eab30810_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                <div className="relative w-40 p-3 rounded-lg bg-[#0A0A0A] border border-white/5 shadow-2xl font-mono text-[6px] transform translate-y-2 group-hover:translate-y-1 transition-transform duration-500">
                  <div className="flex gap-1.5 mb-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      <div className="w-4 h-1 bg-yellow-500/40 rounded" />
                      <div className="w-8 h-1 bg-white/10 rounded" />
                    </div>
                    <div className="flex gap-1 pl-2">
                      <div className="w-6 h-1 bg-white/10 rounded" />
                      <div className="w-2 h-1 bg-yellow-500/40 rounded" />
                    </div>
                    <div className="flex gap-1 pl-2">
                      <div className="w-8 h-1 bg-white/10 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg text-white font-medium mb-3">Agent Prompts</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Export optimized prompts for Claude Code, Cursor, Gemini, or any AI coding assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why IdeaForge */}
      <section className="border-t border-white/5 bg-[#050505] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-medium text-white mb-12 tracking-tight">
            Why IdeaForge?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                ),
                title: 'Evidence-Based',
                desc: 'Every feature links back to real research. No more building in the dark or guessing what users want.'
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: '10x Faster',
                desc: 'Transform hours of manual PRD writing into minutes. Focus on building, not documenting.'
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="m18 16 4-4-4-4" />
                    <path d="m6 8-4 4 4 4" />
                    <path d="m14.5 4-5 16" />
                  </svg>
                ),
                title: 'Multi-Format Export',
                desc: 'Claude Code, Cursor, Gemini, or universal format. Export prompts optimized for your preferred AI assistant.'
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ),
                title: 'Multi-Model AI',
                desc: 'Tier-based routing uses the best AI model for each task. Speed tier for analysis, max brain for critical specs.'
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                ),
                title: 'Design Studio',
                desc: 'Generate design briefs and component specs that match your brand archetype. No more generic UI.'
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
                title: 'BMAD Compliant',
                desc: 'Story files follow BMAD 2025 best practices with traceability, security requirements, and architectural context.'
              },
            ].map((item) => (
              <div key={item.title} className="glass-card p-6 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-white font-medium mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-4">
            Ready to transform your research?
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Stop building features nobody wants. Start with evidence.
          </p>
          <ShinyButton to="/app">Start Building</ShinyButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-black">
                  <path d="M12 3L3 9V21H21V9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white font-medium text-sm">IdeaForge</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-500 hover:text-white text-xs transition-colors">Features</a>
              <a href="#workflow" className="text-gray-500 hover:text-white text-xs transition-colors">Workflow</a>
              <Link to="/app" className="text-gray-500 hover:text-white text-xs transition-colors">Launch App</Link>
            </div>
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} IdeaForge
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Download,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  Palette,
  Paintbrush,
  MessageSquare,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';

const formats = [
  {
    id: 'claude',
    name: 'Claude Code',
    file: 'CLAUDE.md',
    description: 'Optimized for Claude with XML tags and explicit structure',
    icon: '🤖',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    file: '.cursorrules',
    description: 'MDC format with glob patterns and rule hierarchy',
    icon: '⚡',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    file: 'GEMINI.md',
    description: 'Hierarchical structure with stepwise formatting',
    icon: '💎',
  },
  {
    id: 'universal',
    name: 'Universal',
    file: 'AGENTS.md',
    description: 'Works across all major coding agents',
    icon: '🌐',
  },
];

export default function ExportStep() {
  const {
    research,
    insights,
    prd,
    exportFormat,
    setExportFormat,
    setCurrentStep,
    getAcceptedFeatures,
  } = useAppStore();

  const [generatedPrompts, setGeneratedPrompts] = useState({});
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [skillFiles, setSkillFiles] = useState([]);
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  // Story files state
  const [stories, setStories] = useState(null);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState(null);
  const [expandedStory, setExpandedStory] = useState(null);
  const [showStories, setShowStories] = useState(false);

  // Design brief state
  const [designBrief, setDesignBrief] = useState(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [designError, setDesignError] = useState(null);
  const [showDesign, setShowDesign] = useState(false);
  const [expandedDesignSection, setExpandedDesignSection] = useState(null);

  // Chat/ideation state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const generateStories = async () => {
    setStoriesLoading(true);
    setStoriesError(null);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.generateStories(acceptedFeatures, prd.content);

      if (result.success) {
        setStories(result);
      } else {
        setStoriesError(result.error || 'Failed to generate story files');
      }
    } catch (err) {
      setStoriesError(err.message || 'An error occurred');
    } finally {
      setStoriesLoading(false);
    }
  };

  const downloadStory = (story) => {
    const blob = new Blob([story.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = story.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllStories = () => {
    if (!stories?.stories) return;

    // Download each story file individually
    stories.stories.forEach((story, i) => {
      setTimeout(() => downloadStory(story), i * 100);
    });
  };

  const copyStory = async (story) => {
    try {
      await navigator.clipboard.writeText(story.content);
      setCopied(`story-${story.filename}`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateDesign = async () => {
    setDesignLoading(true);
    setDesignError(null);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.generateDesignBrief(
        research.content,
        insights,
        acceptedFeatures,
        null // productContext - could add this later
      );

      if (result.success) {
        setDesignBrief(result.designBrief);
      } else {
        setDesignError(result.error || 'Failed to generate design brief');
      }
    } catch (err) {
      setDesignError(err.message || 'An error occurred');
    } finally {
      setDesignLoading(false);
    }
  };

  const downloadDesignBrief = () => {
    if (!designBrief) return;

    const content = JSON.stringify(designBrief, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-brief.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDesignAsMarkdown = () => {
    if (!designBrief) return;

    const md = formatDesignBriefAsMarkdown(designBrief);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DESIGN-BRIEF.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDesignBriefAsMarkdown = (brief) => {
    let md = `# Design Brief\n\n`;
    md += `## Visual Identity\n\n`;
    md += `**Mood:** ${brief.visualIdentity?.moodDescription || ''}\n\n`;
    md += `**Philosophy:** ${brief.visualIdentity?.designPhilosophy || ''}\n\n`;

    if (brief.visualIdentity?.references?.length) {
      md += `### References\n`;
      brief.visualIdentity.references.forEach(ref => {
        md += `- **${ref.product}**: Take: ${ref.whatToTake} | Avoid: ${ref.whatToAvoid}\n`;
      });
      md += `\n`;
    }

    if (brief.visualIdentity?.antiPatterns?.length) {
      md += `### Anti-Patterns (NEVER DO)\n`;
      brief.visualIdentity.antiPatterns.forEach(ap => {
        md += `- ❌ ${ap}\n`;
      });
      md += `\n`;
    }

    md += `## Design Tokens\n\n`;
    md += `### Colors\n`;
    if (brief.designTokens?.colors) {
      Object.entries(brief.designTokens.colors).forEach(([name, val]) => {
        md += `- **${name}**: \`${val.value}\` - ${val.usage}\n`;
      });
    }
    md += `\n`;

    md += `### Typography\n`;
    if (brief.designTokens?.typography) {
      md += `- **Font:** ${brief.designTokens.typography.fontFamily}\n`;
      md += `- **Weights:** ${brief.designTokens.typography.weights}\n`;
      if (brief.designTokens.typography.scale) {
        md += `- **Scale:**\n`;
        Object.entries(brief.designTokens.typography.scale).forEach(([size, val]) => {
          md += `  - ${size}: ${val}\n`;
        });
      }
    }
    md += `\n`;

    md += `### Spacing & Radius\n`;
    if (brief.designTokens?.spacing) {
      md += `- **Unit:** ${brief.designTokens.spacing.unit}\n`;
      md += `- **Scale:** ${brief.designTokens.spacing.scale}\n`;
    }
    if (brief.designTokens?.radius) {
      Object.entries(brief.designTokens.radius).forEach(([size, val]) => {
        md += `- **${size}:** ${val}\n`;
      });
    }
    md += `\n`;

    md += `## Component Patterns\n\n`;
    if (brief.componentPatterns) {
      Object.entries(brief.componentPatterns).forEach(([component, patterns]) => {
        md += `### ${component.charAt(0).toUpperCase() + component.slice(1)}\n`;
        if (typeof patterns === 'object') {
          Object.entries(patterns).forEach(([key, val]) => {
            md += `- **${key}:** ${val}\n`;
          });
        }
        md += `\n`;
      });
    }

    md += `## Accessibility\n\n`;
    if (brief.accessibilityRequirements) {
      Object.entries(brief.accessibilityRequirements).forEach(([key, val]) => {
        md += `- **${key}:** ${val}\n`;
      });
    }
    md += `\n`;

    md += `## Content Guidelines\n\n`;
    if (brief.contentGuidelines) {
      md += `**Tone:** ${brief.contentGuidelines.toneOfVoice || ''}\n\n`;
      if (brief.contentGuidelines.microcopy) {
        Object.entries(brief.contentGuidelines.microcopy).forEach(([key, val]) => {
          md += `- **${key}:** ${val}\n`;
        });
      }
    }

    return md;
  };

  const handleChatSubmit = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.chatExport(userMessage, {
        research: research.content,
        insights,
        features: acceptedFeatures,
        prd: prd.content,
        designBrief,
        stories: stories?.stories,
        currentFocus: exportFormat,
      });

      if (result.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickPrompts = [
    "How can I improve my PRD for Claude Code?",
    "Suggest better design tokens for a SaaS app",
    "What's missing from my story files?",
    "Make my prompts more specific",
  ];

  const generatePrompt = async (formatId) => {
    setLoading((prev) => ({ ...prev, [formatId]: true }));
    setError(null);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.generatePrompt(
        formatId,
        research.content,
        insights,
        acceptedFeatures,
        prd.content
      );

      if (result.success) {
        setGeneratedPrompts((prev) => ({ ...prev, [formatId]: result.prompt }));
        // Store detected skills if returned
        if (result.detectedSkills && result.detectedSkills.length > 0) {
          setDetectedSkills(result.detectedSkills);
        }
        // Store skill files if returned
        if (result.skillFiles && result.skillFiles.length > 0) {
          setSkillFiles(result.skillFiles);
        }
      } else {
        setError(result.error || `Failed to generate ${formatId} prompt`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading((prev) => ({ ...prev, [formatId]: false }));
    }
  };

  // Auto-generate selected format on mount
  useEffect(() => {
    if (!generatedPrompts[exportFormat]) {
      generatePrompt(exportFormat);
    }
  }, [exportFormat]);

  const handleFormatChange = (formatId) => {
    setExportFormat(formatId);
    if (!generatedPrompts[formatId]) {
      generatePrompt(formatId);
    }
  };

  const handleCopy = async (formatId) => {
    const prompt = generatedPrompts[formatId];
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(formatId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (formatId) => {
    const prompt = generatedPrompts[formatId];
    const format = formats.find((f) => f.id === formatId);
    if (!prompt || !format) return;

    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    setCurrentStep('prd');
  };

  const currentFormat = formats.find((f) => f.id === exportFormat);
  const currentPrompt = generatedPrompts[exportFormat];
  const isLoading = loading[exportFormat];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
          <Download className="w-4 h-4 text-indigo-400" />
          Step 5 of 5
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
          Export Agent Instructions
        </h1>
        <p className="text-zinc-500 text-[15px]">
          Generate optimized prompts for your preferred coding agent.
        </p>
      </div>

      {/* Format selector */}
      <div className="grid grid-cols-4 gap-3">
        {formats.map((format) => (
          <button
            key={format.id}
            onClick={() => handleFormatChange(format.id)}
            className={`
              p-4 rounded-xl border transition-all duration-200 text-left
              ${exportFormat === format.id
                ? 'bg-indigo-500/10 border-indigo-500/30'
                : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700'
              }
            `}
          >
            <div className="text-2xl mb-2">{format.icon}</div>
            <div className={`text-[14px] font-medium ${
              exportFormat === format.id ? 'text-indigo-400' : 'text-zinc-200'
            }`}>
              {format.name}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">{format.file}</div>
          </button>
        ))}
      </div>

      {/* Detected Skills */}
      {detectedSkills.length > 0 && (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-medium text-zinc-300">
              Detected Integrations
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                         bg-indigo-500/10 border border-indigo-500/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                <span className="text-xs font-medium text-indigo-300">
                  {skill.name}
                </span>
                {skill.matchedKeywords && skill.matchedKeywords.length > 0 && (
                  <span className="text-[10px] text-indigo-400/60">
                    ({skill.matchedKeywords.slice(0, 2).join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            The generated prompt includes integration patterns and MCP instructions for these services.
          </p>
        </div>
      )}

      {/* Generated prompt */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-zinc-200">
                {currentFormat?.file}
              </div>
              <div className="text-[11px] text-zinc-500">
                {currentFormat?.description}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePrompt(exportFormat)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                       bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            <button
              onClick={() => handleCopy(exportFormat)}
              disabled={!currentPrompt || isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed ${
                         copied === exportFormat
                           ? 'bg-emerald-500/10 text-emerald-400'
                           : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                       }`}
            >
              {copied === exportFormat ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied === exportFormat ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => handleDownload(exportFormat)}
              disabled={!currentPrompt || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                       bg-indigo-500 text-white hover:bg-indigo-400 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-zinc-400 text-sm">
                Generating {currentFormat?.name} prompt...
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => generatePrompt(exportFormat)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          ) : currentPrompt ? (
            <pre className="p-6 text-[13px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {currentPrompt}
            </pre>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-zinc-500">Select a format to generate</p>
            </div>
          )}
        </div>
      </div>

      {/* Design Brief Section */}
      <div className="card overflow-hidden">
        <button
          onClick={() => {
            setShowDesign(!showDesign);
            if (!designBrief && !designLoading) {
              generateDesign();
            }
          }}
          className="w-full flex items-center justify-between px-4 py-4 border-b border-zinc-800/50 bg-zinc-900/50 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-left">
              <div className="text-[14px] font-medium text-zinc-200">
                Design Brief
              </div>
              <div className="text-[12px] text-zinc-500">
                Specific UI/UX direction - no generic "modern and clean"
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {designBrief && (
              <span className="text-[12px] text-emerald-400">Generated</span>
            )}
            {showDesign ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </button>

        {showDesign && (
          <div className="p-4 space-y-4">
            {designLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                <p className="text-zinc-400 text-sm">Generating design brief...</p>
              </div>
            ) : designError ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <p className="text-red-400 text-sm">{designError}</p>
                <button
                  onClick={generateDesign}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            ) : designBrief ? (
              <>
                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={generateDesign}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                             bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                  <button
                    onClick={downloadDesignAsMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                             bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Markdown
                  </button>
                  <button
                    onClick={downloadDesignBrief}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                             bg-pink-500 text-white hover:bg-pink-400 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    JSON
                  </button>
                </div>

                {/* Visual Identity */}
                <div className="space-y-3">
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <h4 className="text-[13px] font-medium text-pink-400 mb-2 flex items-center gap-2">
                      <Paintbrush className="w-4 h-4" />
                      Visual Identity
                    </h4>
                    <p className="text-[13px] text-zinc-300 mb-2">
                      {designBrief.visualIdentity?.moodDescription}
                    </p>
                    <p className="text-[12px] text-zinc-500 italic">
                      "{designBrief.visualIdentity?.designPhilosophy}"
                    </p>
                  </div>

                  {/* References */}
                  {designBrief.visualIdentity?.references?.length > 0 && (
                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <h4 className="text-[12px] font-medium text-zinc-400 mb-2">Design References</h4>
                      <div className="space-y-2">
                        {designBrief.visualIdentity.references.map((ref, i) => (
                          <div key={i} className="flex items-start gap-2 text-[12px]">
                            <span className="text-pink-400 font-medium">{ref.product}:</span>
                            <span className="text-emerald-400">✓ {ref.whatToTake}</span>
                            <span className="text-zinc-600">|</span>
                            <span className="text-red-400">✗ {ref.whatToAvoid}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anti-patterns */}
                  {designBrief.visualIdentity?.antiPatterns?.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                      <h4 className="text-[12px] font-medium text-red-400 mb-2">❌ Never Do These</h4>
                      <div className="flex flex-wrap gap-2">
                        {designBrief.visualIdentity.antiPatterns.map((ap, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-red-500/10 text-[11px] text-red-300">
                            {ap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Tokens */}
                  {designBrief.designTokens?.colors && (
                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <h4 className="text-[12px] font-medium text-zinc-400 mb-3">Color Tokens</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(designBrief.designTokens.colors).map(([name, val]) => (
                          <div key={name} className="text-center">
                            <div
                              className="w-full h-8 rounded-md border border-zinc-700 mb-1"
                              style={{ backgroundColor: val.value }}
                            />
                            <div className="text-[10px] text-zinc-400">{name}</div>
                            <div className="text-[9px] text-zinc-600 font-mono">{val.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typography */}
                  {designBrief.designTokens?.typography && (
                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <h4 className="text-[12px] font-medium text-zinc-400 mb-2">Typography</h4>
                      <p className="text-[12px] text-zinc-300 font-mono mb-2">
                        {designBrief.designTokens.typography.fontFamily}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {designBrief.designTokens.typography.weights}
                      </p>
                    </div>
                  )}

                  {/* Component preview */}
                  {designBrief.componentPatterns && (
                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <h4 className="text-[12px] font-medium text-zinc-400 mb-2">Component Patterns</h4>
                      <div className="space-y-2 text-[11px]">
                        {Object.entries(designBrief.componentPatterns).slice(0, 3).map(([component, patterns]) => (
                          <div key={component}>
                            <span className="text-pink-400 font-medium">{component}:</span>
                            {typeof patterns === 'object' && (
                              <span className="text-zinc-400 ml-2">
                                {Object.values(patterns)[0]?.substring(0, 60)}...
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <Palette className="w-6 h-6 text-zinc-500" />
                <p className="text-zinc-500 text-sm">Click to generate design brief</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Story Files Section */}
      <div className="card overflow-hidden">
        <button
          onClick={() => {
            setShowStories(!showStories);
            if (!stories && !storiesLoading) {
              generateStories();
            }
          }}
          className="w-full flex items-center justify-between px-4 py-4 border-b border-zinc-800/50 bg-zinc-900/50 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-left">
              <div className="text-[14px] font-medium text-zinc-200">
                Story Files (BMAD-style)
              </div>
              <div className="text-[12px] text-zinc-500">
                Atomic, AI-digestible story files for coding agents
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stories && (
              <span className="text-[12px] text-zinc-400">
                {stories.stories?.length || 0} stories
              </span>
            )}
            {showStories ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </button>

        {showStories && (
          <div className="p-4 space-y-4">
            {storiesLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                <p className="text-zinc-400 text-sm">Generating story files...</p>
              </div>
            ) : storiesError ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <p className="text-red-400 text-sm">{storiesError}</p>
                <button
                  onClick={generateStories}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            ) : stories ? (
              <>
                {/* Story summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] text-zinc-500">
                      {stories.totalComplexity}
                    </span>
                    {stories.implementationOrder?.length > 0 && (
                      <span className="text-[12px] text-emerald-400">
                        Implementation order defined
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateStories}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                               bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={downloadAllStories}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                               bg-violet-500 text-white hover:bg-violet-400 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download All Stories
                    </button>
                  </div>
                </div>

                {/* Epic summary */}
                {Object.keys(stories.epicSummary || {}).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stories.epicSummary).map(([epicNum, epicName]) => (
                      <span
                        key={epicNum}
                        className="px-2 py-1 rounded-md bg-zinc-800/50 text-[11px] text-zinc-400"
                      >
                        Epic {epicNum}: {epicName}
                      </span>
                    ))}
                  </div>
                )}

                {/* Story list */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {stories.stories?.map((story) => (
                    <div
                      key={story.filename}
                      className="border border-zinc-800/50 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedStory(
                          expandedStory === story.filename ? null : story.filename
                        )}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-violet-400" />
                          <span className="text-[13px] text-zinc-200">
                            Story {story.epicNumber}.{story.storyNumber}: {story.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {story.filename}
                          </span>
                          {expandedStory === story.filename ? (
                            <ChevronUp className="w-4 h-4 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                      </button>

                      {expandedStory === story.filename && (
                        <div className="border-t border-zinc-800/50">
                          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
                            <button
                              onClick={() => copyStory(story)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                                copied === `story-${story.filename}`
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              {copied === `story-${story.filename}` ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copied === `story-${story.filename}` ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={() => downloadStory(story)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-[11px]
                                       bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                          <pre className="p-4 text-[12px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                            {story.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <FolderOpen className="w-6 h-6 text-zinc-500" />
                <p className="text-zinc-500 text-sm">Click to generate story files</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick export all */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-medium text-zinc-200">Export Complete Project</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Download all files: PRD, agent prompts, design brief, story files, and Claude Skills
            </p>
          </div>
          <button
            onClick={async () => {
              // Generate everything if not already generated
              if (!designBrief && !designLoading) {
                await generateDesign();
              }
              if (!stories && !storiesLoading) {
                await generateStories();
              }
              for (const format of formats) {
                if (!generatedPrompts[format.id]) {
                  await generatePrompt(format.id);
                }
              }

              // Download each file with delay to avoid browser blocking
              const downloads = [];
              let delay = 0;

              // 1. Download PRD
              if (prd?.content) {
                setTimeout(() => {
                  const blob = new Blob([prd.content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'PRD.md';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, delay);
                delay += 100;
              }

              // 2. Download all agent prompts
              for (const format of formats) {
                setTimeout(() => handleDownload(format.id), delay);
                delay += 100;
              }

              // 3. Download design brief (both formats)
              if (designBrief) {
                // JSON
                setTimeout(() => {
                  const content = JSON.stringify(designBrief, null, 2);
                  const blob = new Blob([content], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'design-brief.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, delay);
                delay += 100;

                // Markdown
                setTimeout(() => {
                  const md = formatDesignBriefAsMarkdown(designBrief);
                  const blob = new Blob([md], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'DESIGN-BRIEF.md';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, delay);
                delay += 100;
              }

              // 4. Download all story files
              if (stories?.stories) {
                stories.stories.forEach((story) => {
                  setTimeout(() => downloadStory(story), delay);
                  delay += 100;
                });
              }

              // 5. Download all skill files (Claude Agent Skills)
              if (skillFiles && skillFiles.length > 0) {
                skillFiles.forEach((skill) => {
                  setTimeout(() => {
                    const blob = new Blob([skill.content], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = skill.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, delay);
                  delay += 100;
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                     bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download All Files
          </button>
        </div>
      </div>

      {/* AI Ideation Chat */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full flex items-center justify-between px-4 py-4 border-b border-zinc-800/50 bg-zinc-900/50 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-[14px] font-medium text-zinc-200">
                AI Ideation & Refinement
              </div>
              <div className="text-[12px] text-zinc-500">
                Chat with AI to improve your exports
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {chatMessages.length > 0 && (
              <span className="text-[12px] text-zinc-400">
                {chatMessages.length} messages
              </span>
            )}
            {showChat ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </button>

        {showChat && (
          <div className="flex flex-col h-[400px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Sparkles className="w-8 h-8 text-emerald-400/50" />
                  <div className="text-center">
                    <p className="text-zinc-400 text-sm mb-3">
                      Ask me to help improve your exports
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setChatInput(prompt);
                          }}
                          className="px-3 py-1.5 rounded-full bg-zinc-800/50 text-[11px] text-zinc-400
                                   hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-indigo-500/20 text-zinc-200'
                          : 'bg-zinc-800/50 text-zinc-300'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="markdown-preview text-[13px]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[13px]">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleChatSubmit}
              className="p-4 border-t border-zinc-800/50 bg-zinc-900/30"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about PRD, design, stories, or prompts..."
                  className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50
                           text-[13px] text-zinc-200 placeholder-zinc-500
                           focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 rounded-lg bg-emerald-500 text-white
                           hover:bg-emerald-400 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                   text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PRD
        </button>

        <div className="flex items-center gap-2 text-[13px] text-emerald-400">
          <Check className="w-4 h-4" />
          Workflow complete!
        </div>
      </div>
    </div>
  );
}

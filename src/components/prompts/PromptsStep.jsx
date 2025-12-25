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
  ChevronRight,
  Sparkles,
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

export default function PromptsStep() {
  const {
    research,
    insights,
    prd,
    setCurrentStep,
    getAcceptedFeatures,
    agentPrompts,
    setAgentPrompt,
    setGeneratingAgentPrompts,
  } = useAppStore();

  const [selectedFormat, setSelectedFormat] = useState('claude');
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);
  const [detectedSkills, setDetectedSkills] = useState([]);

  // Load from store on mount
  useEffect(() => {
    // If we have prompts in store, we're good
    // No auto-generation!
  }, []);

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
        setAgentPrompt(formatId, result.prompt);
        if (result.detectedIntegrations) {
          setDetectedSkills(result.detectedIntegrations);
        }
      } else {
        setError(result.error || 'Failed to generate prompt');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading((prev) => ({ ...prev, [formatId]: false }));
    }
  };

  const generateAllPrompts = async () => {
    setGeneratingAgentPrompts(true);
    for (const format of formats) {
      if (!agentPrompts[format.id]) {
        await generatePrompt(format.id);
      }
    }
    setGeneratingAgentPrompts(false);
  };

  const handleCopy = async (formatId) => {
    const prompt = agentPrompts[formatId];
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(formatId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadPrompt = (formatId) => {
    const format = formats.find((f) => f.id === formatId);
    const prompt = agentPrompts[formatId];
    if (!prompt || !format) return;

    const blob = new Blob([prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllPrompts = () => {
    formats.forEach((format, i) => {
      if (agentPrompts[format.id]) {
        setTimeout(() => downloadPrompt(format.id), i * 100);
      }
    });
  };

  const allGenerated = formats.every((f) => agentPrompts[f.id]);
  const anyGenerated = formats.some((f) => agentPrompts[f.id]);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentStep('prd')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PRD
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Step 5 of 8
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Agent Prompts</h1>
              <p className="text-zinc-400">
                Generate optimized instructions for Claude Code, Cursor, Gemini, and other coding agents
              </p>
            </div>

            <button
              onClick={() => setCurrentStep('design')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              Continue to Design
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detected Integrations */}
        {detectedSkills.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Detected Integrations</h3>
                <p className="text-sm text-zinc-400 mb-2">
                  Found {detectedSkills.length} integration{detectedSkills.length !== 1 ? 's' : ''} in your PRD
                </p>
                <div className="flex flex-wrap gap-2">
                  {detectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-white mb-1">Error</h3>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Generate All Button */}
        {!allGenerated && (
          <div className="mb-6">
            <button
              onClick={generateAllPrompts}
              disabled={loading.claude || loading.cursor || loading.gemini || loading.universal}
              className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading.claude || loading.cursor || loading.gemini || loading.universal ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating prompts...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate All Agent Prompts
                </>
              )}
            </button>
          </div>
        )}

        {/* Download All Button */}
        {anyGenerated && (
          <div className="mb-6">
            <button
              onClick={downloadAllPrompts}
              className="w-full px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download All Generated Prompts
            </button>
          </div>
        )}

        {/* Format Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap
                ${
                  selectedFormat === format.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                }
              `}
            >
              <span>{format.icon}</span>
              <span className="font-medium">{format.name}</span>
              {agentPrompts[format.id] && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Selected Format Content */}
        {formats.map((format) => {
          if (selectedFormat !== format.id) return null;

          const prompt = agentPrompts[format.id];
          const isLoading = loading[format.id];

          return (
            <div key={format.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {format.icon} {format.name}
                  </h2>
                  <p className="text-sm text-zinc-400">{format.description}</p>
                  <p className="text-xs text-zinc-500 mt-1">File: {format.file}</p>
                </div>

                <div className="flex gap-2">
                  {prompt && (
                    <>
                      <button
                        onClick={() => handleCopy(format.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
                      >
                        {copied === format.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => downloadPrompt(format.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => generatePrompt(format.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        {prompt ? 'Regenerate' : 'Generate'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
              ) : prompt ? (
                <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50 overflow-auto max-h-[600px]">
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
                    {prompt}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-zinc-600 mb-3" />
                  <p className="text-zinc-400 mb-1">No prompt generated yet</p>
                  <p className="text-sm text-zinc-500">
                    Click "Generate" to create the {format.name} prompt
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileCode,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Edit3,
  Eye,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';

export default function PRDStep() {
  const {
    research,
    insights,
    features,
    prd,
    setPRD,
    setPRDGenerating,
    setCurrentStep,
    getAcceptedFeatures,
  } = useAppStore();

  const [viewMode, setViewMode] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generatePRD = async () => {
    setPRDGenerating(true);
    setError(null);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.generatePRD(research.content, insights, acceptedFeatures);

      if (result.success) {
        setPRD({ content: result.prd });
      } else {
        setError(result.error || 'Failed to generate PRD');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  // Auto-generate PRD on first visit
  useEffect(() => {
    if (!prd.content && !prd.isGenerating) {
      generatePRD();
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prd.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBack = () => {
    setCurrentStep('features');
  };

  const handleProceed = () => {
    // PRD is complete, proceed to Agent Prompts step
    setCurrentStep('prompts');
  };

  const canProceed = prd.content !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          Step 4 of 8
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
          Product Requirements Document
        </h1>
        <p className="text-zinc-500 text-[15px]">
          A comprehensive PRD based on your research and selected features.
        </p>
      </div>

      {/* Loading state */}
      {prd.isGenerating && (
        <div className="card p-12 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-zinc-200 font-medium">Generating your PRD...</p>
            <p className="text-zinc-500 text-sm mt-1">
              Creating product overview, user stories, and specifications
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !prd.isGenerating && (
        <div className="card p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Generation Failed</p>
              <p className="text-zinc-500 text-sm mt-1">{error}</p>
              <button
                onClick={generatePRD}
                className="mt-3 flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRD content */}
      {prd.content && !prd.isGenerating && (
        <div className="card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Markdown
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  copied
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={generatePRD}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium
                         bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="h-[500px] overflow-y-auto">
            {viewMode === 'preview' ? (
              <div className="p-6 markdown-preview">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {prd.content}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="p-6 text-[13px] text-zinc-300 font-mono whitespace-pre-wrap">
                {prd.content}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                   text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </button>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium
            transition-all duration-200
            ${canProceed
              ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          Continue to Agent Prompts
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
  Code,
  Target,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';

const insightCategories = [
  {
    key: 'marketInsights',
    label: 'Market Insights',
    icon: TrendingUp,
    color: 'indigo',
    description: 'Size, trends, and opportunities',
  },
  {
    key: 'competitorGaps',
    label: 'Competitor Gaps',
    icon: Target,
    color: 'violet',
    description: 'What competitors are missing',
  },
  {
    key: 'painPoints',
    label: 'Pain Points',
    icon: AlertCircle,
    color: 'amber',
    description: 'Problems to solve',
  },
  {
    key: 'technicalRequirements',
    label: 'Technical Requirements',
    icon: Code,
    color: 'emerald',
    description: 'Implied tech needs',
  },
  {
    key: 'successMetrics',
    label: 'Success Metrics',
    icon: CheckCircle2,
    color: 'sky',
    description: 'How to measure value',
  },
];

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    icon: 'bg-indigo-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    icon: 'bg-violet-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    icon: 'bg-amber-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'bg-emerald-500/20',
  },
  sky: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    text: 'text-sky-400',
    icon: 'bg-sky-500/20',
  },
};

export default function AnalysisStep() {
  const {
    research,
    insights,
    setInsights,
    setAnalyzing,
    setCurrentStep,
    canProceedToFeatures,
  } = useAppStore();

  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const result = await aiService.analyzeResearch(research.content);
      if (result.success) {
        setInsights(result.insights);
      } else {
        setError(result.error || 'Failed to analyze research');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    }
  };

  // Auto-run analysis on first visit if not already analyzed
  useEffect(() => {
    if (!insights.isAnalyzed && !insights.isAnalyzing && research.content) {
      runAnalysis();
    }
  }, []);

  const handleBack = () => {
    setCurrentStep('research');
  };

  const handleProceed = () => {
    if (canProceedToFeatures()) {
      setCurrentStep('features');
    }
  };

  const canProceed = canProceedToFeatures();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Step 2 of 8
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
          AI Analysis
        </h1>
        <p className="text-zinc-500 text-[15px]">
          We've extracted key insights from your research. Review and refine before generating features.
        </p>
      </div>

      {/* Loading state */}
      {insights.isAnalyzing && (
        <div className="card p-12 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-zinc-200 font-medium">Analyzing your research...</p>
            <p className="text-zinc-500 text-sm mt-1">
              Extracting market insights, pain points, and opportunities
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !insights.isAnalyzing && (
        <div className="card p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Analysis Failed</p>
              <p className="text-zinc-500 text-sm mt-1">{error}</p>
              <button
                onClick={runAnalysis}
                className="mt-3 flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insights grid */}
      {insights.isAnalyzed && !insights.isAnalyzing && (
        <div className="space-y-4">
          {insightCategories.map((category) => {
            const items = insights[category.key] || [];
            const colors = colorClasses[category.color];
            const Icon = category.icon;

            return (
              <div key={category.key} className={`card p-4 ${colors.bg} ${colors.border} border`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${colors.icon} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className={`text-[14px] font-medium ${colors.text}`}>
                      {category.label}
                    </h3>
                    <p className="text-[11px] text-zinc-500">{category.description}</p>
                  </div>
                  <span className="ml-auto text-[12px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                    {items.length} found
                  </span>
                </div>

                {items.length > 0 ? (
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-[13px] text-zinc-300 pl-2"
                      >
                        <span className={`${colors.text} mt-1`}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-zinc-600 pl-2 italic">
                    No insights found in this category
                  </p>
                )}
              </div>
            );
          })}

          {/* Re-analyze button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={runAnalysis}
              className="flex items-center gap-2 px-4 py-2 text-[13px] text-zinc-400
                       hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze research
            </button>
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
          Back to Research
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
          Generate Features
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

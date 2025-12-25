import {
  FileText,
  Sparkles,
  LayoutList,
  FileCode,
  Code,
  Palette,
  BookOpen,
  Download,
  Check,
  Circle,
  ChevronRight
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';

const steps = [
  {
    id: 'research',
    label: 'Research',
    description: 'Upload or paste your research',
    icon: FileText,
  },
  {
    id: 'analysis',
    label: 'Analysis',
    description: 'AI extracts key insights',
    icon: Sparkles,
  },
  {
    id: 'features',
    label: 'Features',
    description: 'Review & refine features',
    icon: LayoutList,
  },
  {
    id: 'prd',
    label: 'PRD',
    description: 'Generate requirements doc',
    icon: FileCode,
  },
  {
    id: 'prompts',
    label: 'Agent Prompts',
    description: 'Generate coding agent files',
    icon: Code,
  },
  {
    id: 'design',
    label: 'Design Studio',
    description: 'Create UI variations',
    icon: Palette,
  },
  {
    id: 'stories',
    label: 'Story Files',
    description: 'BMAD-style stories',
    icon: BookOpen,
  },
  {
    id: 'export',
    label: 'Final Export',
    description: 'Download everything',
    icon: Download,
  },
];

export default function Sidebar() {
  const {
    currentStep,
    setCurrentStep,
    research,
    insights,
    features,
    prd,
    agentPrompts,
    designVariations,
    storyFiles,
    canProceedToAnalysis,
    canProceedToFeatures,
    canProceedToPRD,
    canProceedToPrompts,
    canProceedToDesign,
    canProceedToStories,
    canProceedToExport,
  } = useAppStore();

  const getStepStatus = (stepId) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    if (stepId === 'research' && research.content) return 'completed';
    if (stepId === 'analysis' && insights.isAnalyzed) return 'completed';
    if (stepId === 'features' && features.items.some((f) => f.status === 'accepted')) return 'completed';
    if (stepId === 'prd' && prd.content) return 'completed';
    if (stepId === 'prompts' && (agentPrompts.claude || agentPrompts.cursor || agentPrompts.gemini || agentPrompts.universal)) return 'completed';
    if (stepId === 'design' && (designVariations.designBrief || designVariations.variations?.length > 0)) return 'completed';
    if (stepId === 'stories' && storyFiles.files?.length > 0) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  const canNavigateTo = (stepId) => {
    switch (stepId) {
      case 'research':
        return true;
      case 'analysis':
        return canProceedToAnalysis();
      case 'features':
        return canProceedToFeatures();
      case 'prd':
        return canProceedToPRD();
      case 'prompts':
        return canProceedToPrompts();
      case 'design':
        return canProceedToDesign();
      case 'stories':
        return canProceedToStories();
      case 'export':
        return canProceedToExport();
      default:
        return false;
    }
  };

  const handleStepClick = (stepId) => {
    if (canNavigateTo(stepId)) {
      setCurrentStep(stepId);
    }
  };

  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-900/30 flex flex-col">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          Workflow
        </h2>
        <nav className="space-y-1">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const canNavigate = canNavigateTo(step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!canNavigate}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                  transition-all duration-200 group
                  ${status === 'current'
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'hover:bg-zinc-800/50'
                  }
                  ${!canNavigate ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : status === 'current'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-zinc-800/50 text-zinc-500'
                  }
                `}>
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-[13px] font-medium
                    ${status === 'current'
                      ? 'text-zinc-100'
                      : status === 'completed'
                        ? 'text-zinc-300'
                        : 'text-zinc-500'
                    }
                  `}>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-zinc-600 truncate">
                    {step.description}
                  </div>
                </div>
                {status === 'current' && (
                  <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Progress indicator */}
      <div className="mt-auto p-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-medium text-zinc-400">Progress</div>
          <div className="text-xs text-zinc-600">
            {steps.filter((s) => getStepStatus(s.id) === 'completed').length}/8
          </div>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <div
                key={step.id}
                className={`
                  h-1 flex-1 rounded-full transition-colors duration-300
                  ${status === 'completed'
                    ? 'bg-emerald-500'
                    : status === 'current'
                      ? 'bg-indigo-500'
                      : 'bg-zinc-800'
                  }
                `}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}

import { Check, Circle, ChevronRight, FileText, Target, Layout, Edit3, Download } from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';

// ============================================================================
// WORKFLOW HEADER V3.0 (Intent-Driven Architecture)
// ============================================================================
//
// Displays the 5-step progress indicator and allows navigation between steps.
// Steps: Context → Intent → Template → Content → Export
//
// Key change: Added Intent step between Context and Template for design intent extraction
//
// ============================================================================

const STEPS = [
  {
    id: 'context',
    label: 'Context',
    description: 'Import PRD data',
    icon: FileText,
  },
  {
    id: 'intent',
    label: 'Intent',
    description: 'Design direction',
    icon: Target,
  },
  {
    id: 'template',
    label: 'Template',
    description: 'Select layout',
    icon: Layout,
  },
  {
    id: 'content',
    label: 'Content',
    description: 'Edit & refine',
    icon: Edit3,
  },
  {
    id: 'export',
    label: 'Export',
    description: 'Download assets',
    icon: Download,
  },
];

export default function WorkflowHeader() {
  const {
    currentStep,
    setCurrentStep,
    canProceedToStep,
    importedContext,
    designIntent,
    templateSelection,
    contentGeneration,
  } = useDesignStudioStore();

  // Determine step status
  const getStepStatus = (stepId) => {
    const stepIndex = STEPS.findIndex((s) => s.id === stepId);
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    // Check completion based on the new 5-step workflow
    if (stepId === 'context' && importedContext) return 'completed';
    if (stepId === 'intent' && designIntent?.isFinalized) return 'completed';
    if (stepId === 'template' && templateSelection?.isFinalized) return 'completed';
    if (stepId === 'content' && contentGeneration?.isComplete) return 'completed';
    if (stepId === 'export') return 'upcoming'; // Export is terminal, never "completed" in indicator

    // Current step
    if (stepId === currentStep) return 'current';

    // Past step (but not completed based on above logic)
    if (stepIndex < currentIndex) return 'past';

    return 'upcoming';
  };

  const handleStepClick = (stepId) => {
    if (canProceedToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="border-b border-zinc-800/50 bg-zinc-900/50">
      <div className="px-6 py-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const canNavigate = canProceedToStep(step.id);
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Button */}
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!canNavigate}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                    ${status === 'current' ? 'bg-indigo-500/10' : ''}
                    ${canNavigate ? 'hover:bg-zinc-800/50 cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  {/* Step Number/Check */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-colors duration-200
                    ${status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : status === 'current'
                        ? 'bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/30'
                        : status === 'past'
                          ? 'bg-zinc-700/50 text-zinc-400'
                          : 'bg-zinc-800/50 text-zinc-600'
                    }
                  `}>
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="text-left">
                    <div className={`
                      text-sm font-medium
                      ${status === 'current'
                        ? 'text-white'
                        : status === 'completed'
                          ? 'text-zinc-300'
                          : status === 'past'
                            ? 'text-zinc-400'
                            : 'text-zinc-500'
                      }
                    `}>
                      {step.label}
                    </div>
                    <div className={`
                      text-xs
                      ${status === 'current' || status === 'completed'
                        ? 'text-zinc-500'
                        : 'text-zinc-600'
                      }
                    `}>
                      {step.description}
                    </div>
                  </div>
                </button>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-2">
                    <div className={`
                      h-px transition-colors duration-200
                      ${status === 'completed' ? 'bg-emerald-500/50' : 'bg-zinc-800'}
                    `} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{
              width: `${((STEPS.findIndex(s => s.id === currentStep) + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

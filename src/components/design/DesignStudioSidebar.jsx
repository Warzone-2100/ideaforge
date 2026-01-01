import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
  Loader2,
  FileText,
  Target,
  LayoutTemplate,
  PenTool,
  Download,
  Trash2,
  Eye,
  Clock,
  Image,
} from 'lucide-react';
import useDesignStudioStore from '../../stores/useDesignStudioStore';

// ============================================================================
// DESIGN STUDIO SIDEBAR
// ============================================================================
//
// Left sidebar showing:
//   1. Workflow progress (5 steps with completion status)
//   2. Generated designs history (persisted variations)
//
// ============================================================================

const WORKFLOW_STEPS = [
  { id: 'context', label: 'Import Context', icon: FileText, description: 'PRD & research data' },
  { id: 'intent', label: 'Design Intent', icon: Target, description: 'Archetype & audience' },
  { id: 'template', label: 'Template', icon: LayoutTemplate, description: 'Select a template' },
  { id: 'content', label: 'Design & Edit', icon: PenTool, description: 'Generate & customize' },
  { id: 'export', label: 'Export', icon: Download, description: 'Download your design' },
];

export default function DesignStudioSidebar() {
  const {
    currentStep,
    setCurrentStep,
    canProceedToStep,
    importedContext,
    designIntent,
    templateSelection,
    contentGeneration,
    savedDesigns,
    removeSavedDesign,
  } = useDesignStudioStore();

  const [showHistory, setShowHistory] = useState(true);

  // Determine step status
  const getStepStatus = (stepId) => {
    const stepOrder = ['context', 'intent', 'template', 'content', 'export'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepId === 'context') {
      return importedContext ? 'completed' : currentStep === 'context' ? 'current' : 'pending';
    }
    if (stepId === 'intent') {
      if (designIntent?.isFinalized) return 'completed';
      if (designIntent?.isExtracting) return 'loading';
      return currentStep === 'intent' ? 'current' : 'pending';
    }
    if (stepId === 'template') {
      if (templateSelection?.isFinalized) return 'completed';
      return currentStep === 'template' ? 'current' : 'pending';
    }
    if (stepId === 'content') {
      if (contentGeneration?.isComplete) return 'completed';
      if (contentGeneration?.isGenerating) return 'loading';
      return currentStep === 'content' ? 'current' : 'pending';
    }
    if (stepId === 'export') {
      return currentStep === 'export' ? 'current' : 'pending';
    }

    return stepIndex < currentIndex ? 'completed' : stepIndex === currentIndex ? 'current' : 'pending';
  };

  const handleStepClick = (stepId) => {
    if (canProceedToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const designs = savedDesigns || [];

  return (
    <aside className="w-64 bg-zinc-900/50 border-r border-zinc-800/50 flex flex-col h-full">
      {/* Workflow Progress */}
      <div className="p-4 border-b border-zinc-800/50">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Workflow Progress
        </h3>
        <div className="space-y-1">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const canNavigate = canProceedToStep(step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!canNavigate}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  status === 'current'
                    ? 'bg-indigo-500/10 border border-indigo-500/30'
                    : canNavigate
                    ? 'hover:bg-zinc-800/50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Status Icon */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  status === 'completed'
                    ? 'bg-emerald-500/20'
                    : status === 'current'
                    ? 'bg-indigo-500/20'
                    : status === 'loading'
                    ? 'bg-amber-500/20'
                    : 'bg-zinc-800'
                }`}>
                  {status === 'completed' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : status === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : status === 'current' ? (
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Circle className="w-3 h-3 text-zinc-600" />
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-white' : status === 'completed' ? 'text-zinc-300' : 'text-zinc-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-zinc-600 truncate">
                    {step.description}
                  </div>
                </div>

                {/* Step Number */}
                <span className={`text-xs ${
                  status === 'current' ? 'text-indigo-400' : 'text-zinc-600'
                }`}>
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated Designs History */}
      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Saved Designs
            </span>
            {designs.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">
                {designs.length}
              </span>
            )}
          </div>
          {showHistory ? (
            <ChevronDown className="w-4 h-4 text-zinc-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {showHistory && (
          <div className="px-4 pb-4">
            {designs.length > 0 ? (
              <div className="space-y-2">
                {designs.map((design) => (
                  <DesignHistoryItem
                    key={design.id}
                    design={design}
                    onDelete={() => removeSavedDesign(design.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <Image className="w-6 h-6 text-zinc-700" />
                </div>
                <p className="text-sm text-zinc-600 mb-1">No saved designs yet</p>
                <p className="text-xs text-zinc-700">
                  Generate designs in Step 4 to see them here
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 bg-zinc-800/30 rounded-lg">
            <div className="text-lg font-semibold text-white">
              {designs.length}
            </div>
            <div className="text-[10px] text-zinc-500">Designs Saved</div>
          </div>
          <div className="px-3 py-2 bg-zinc-800/30 rounded-lg">
            <div className="text-lg font-semibold text-white">
              {WORKFLOW_STEPS.filter(s => getStepStatus(s.id) === 'completed').length}/5
            </div>
            <div className="text-[10px] text-zinc-500">Steps Done</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Individual design history item
function DesignHistoryItem({ design, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div
        className="group relative rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-zinc-800 relative">
          {design.thumbnail ? (
            <img
              src={design.thumbnail}
              alt={design.name}
              className="w-full h-full object-cover"
            />
          ) : design.html ? (
            <iframe
              srcDoc={design.html}
              className="w-full h-full border-0 pointer-events-none"
              style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%', height: '400%' }}
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LayoutTemplate className="w-8 h-8 text-zinc-700" />
            </div>
          )}

          {/* Hover Actions */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2 bg-zinc-900/80">
          <div className="text-xs font-medium text-white truncate">
            {design.name || design.templateName || 'Untitled Design'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500">
            <Clock className="w-3 h-3" />
            {formatDate(design.savedAt)}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <DesignPreviewModal
          design={design}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// Full-screen preview modal
function DesignPreviewModal({ design, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {design.name || 'Design Preview'}
            </h3>
            <p className="text-sm text-zinc-500">
              {design.templateName && `Based on ${design.templateName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
        <div className="h-[70vh] bg-white">
          {design.html ? (
            <iframe
              srcDoc={design.html}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <p className="text-zinc-500">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

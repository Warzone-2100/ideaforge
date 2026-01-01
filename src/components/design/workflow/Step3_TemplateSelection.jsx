import { useState, useEffect } from 'react';
import {
  Layout,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Check,
  Star,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { getCodeTemplates } from '../../../data/templates/codeTemplates';
import { rankTemplates, getMatchTier } from '../../../services/archetypeMatchingService';
import ArchetypeIndicator from '../ArchetypeIndicator';
import MatchScoreCard from '../MatchScoreCard';

// ============================================================================
// STEP 3: TEMPLATE SELECTION (V3)
// ============================================================================
//
// Allows user to select a pre-built template based on their design intent.
// Templates are ranked by match score against the extracted archetype.
//
// ============================================================================

export default function Step3_TemplateSelection({ onNext, onBack }) {
  const {
    designIntent,
    templateSelection,
    setTemplateSelection,
    selectTemplate,
    setRankedTemplates,
    finalizeTemplateSelection,
  } = useDesignStudioStore();

  const [isLoading, setIsLoading] = useState(true);

  // Get templates and rank them by match score
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const rawTemplates = getCodeTemplates();

        // Rank templates if we have design intent
        if (designIntent?.isExtracted && typeof rankTemplates === 'function') {
          const ranked = rankTemplates(designIntent, rawTemplates);
          setRankedTemplates(ranked);
        } else {
          // No ranking, just add null match data
          setRankedTemplates(rawTemplates.map(t => ({ ...t, match: null })));
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [designIntent, setRankedTemplates]);

  const templates = templateSelection.rankedTemplates || [];
  const selectedTemplate = templateSelection.selectedTemplate;

  const handleSelectTemplate = (template) => {
    selectTemplate(template, template.match);
  };

  const handleProceed = () => {
    if (selectedTemplate) {
      finalizeTemplateSelection();
      if (onNext) onNext();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
            <Layout className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Loading Templates
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-4">
          Finding the best templates for your design intent...
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          This usually takes a moment
        </div>
      </div>
    );
  }

  // No templates available
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Templates Available
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-6">
          No templates found. Please check your template configuration.
        </p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Select Template</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Choose a template that matches your design intent. Templates are ranked by compatibility.
          </p>
        </div>
        {designIntent?.archetype && (
          <ArchetypeIndicator archetype={designIntent.archetype} />
        )}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          const matchTier = template.match ? getMatchTier(template.match.score) : null;

          return (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50'
              }`}
            >
              {/* Match Score Badge */}
              {template.match && (
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    matchTier === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                    matchTier === 'good' ? 'bg-blue-500/20 text-blue-400' :
                    matchTier === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-zinc-700 text-zinc-400'
                  }`}>
                    {template.match.score}% match
                  </div>
                </div>
              )}

              {/* Template Preview - Live HTML Render */}
              <div className="aspect-video bg-white rounded-lg mb-3 overflow-hidden relative">
                {template.html ? (
                  <iframe
                    srcDoc={template.html}
                    className="w-full h-full border-0 pointer-events-none"
                    style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%', height: '400%' }}
                    title={`Preview of ${template.name}`}
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <Layout className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{template.name}</h3>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Template Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && selectedTemplate.match && (
        <div className="mt-6">
          <MatchScoreCard match={selectedTemplate.match} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Intent
        </button>

        <button
          onClick={handleProceed}
          disabled={!selectedTemplate}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Content
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

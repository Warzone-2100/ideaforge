import { useState, useEffect } from 'react';
import {
  Edit3,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  Eye,
  Code,
  MessageSquare,
  Wand2,
  Palette,
  Save,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { parseTemplate, generateOutput } from '../../../services/templateService';
import { aiService } from '../../../services/aiService';
import ContentSlotEditor from '../ContentSlotEditor';
import TemplatePreview from '../TemplatePreview';
import DesignChatPanel from '../DesignChatPanel';

// ============================================================================
// STEP 4: DESIGN & CONTENT EDITING (V3)
// ============================================================================
//
// Two modes:
// 1. AI REDESIGN - Generate new design variations based on template + PRD
// 2. SLOT EDITING - Fill and edit content slots in the template
//
// Includes collaborative chat for design refinement.
//
// ============================================================================

const MODES = {
  GENERATE: 'generate',
  EDIT: 'edit',
  PREVIEW: 'preview',
  CODE: 'code',
};

export default function Step4_ContentEditing({ onNext, onBack }) {
  const {
    importedContext,
    templateSelection,
    contentGeneration,
    setContentGeneration,
    setContentGenerating,
    setContentError,
    updateSlotContent,
    resetContentGeneration,
    designIntent,
    designLanguage,
    // Persisted variations from store
    generatedVariations,
    addGeneratedVariation,
    selectGeneratedVariation,
    clearGeneratedVariations,
    // Save to history
    saveDesign,
  } = useDesignStudioStore();

  const [mode, setMode] = useState(MODES.GENERATE);
  const [parsedTemplate, setParsedTemplate] = useState(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Get the currently selected variation from store
  const selectedVariation = generatedVariations?.find(v => v.isSelected) || null;

  const selectedTemplate = templateSelection?.selectedTemplate;
  const filledContent = contentGeneration?.filledContent;
  const isGenerating = contentGeneration?.isGenerating;
  const error = contentGeneration?.error;

  // Build prdContext from importedContext
  const prdContext = importedContext ? {
    research: importedContext.research,
    insights: importedContext.insights,
    features: importedContext.features,
    prd: importedContext.prd,
  } : null;

  // Parse template when it changes
  useEffect(() => {
    if (selectedTemplate) {
      try {
        const parsed = parseTemplate(selectedTemplate);
        setParsedTemplate(parsed);
      } catch (err) {
        console.error('Failed to parse template:', err);
      }
    }
  }, [selectedTemplate]);

  // Generate AI design variations based on template as inspiration
  const handleGenerateVariations = async (count = 3) => {
    if (!selectedTemplate || !prdContext) return;

    setIsGeneratingVariations(true);
    // Clear previous variations only when generating fresh batch
    if (count === 3) {
      clearGeneratedVariations();
    }

    try {
      for (let i = 0; i < count; i++) {
        const result = await aiService.generateDesignVariation({
          pageType: selectedTemplate.category || 'landing',
          layout: {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            // Use template HTML as inspiration
            inspirationHtml: selectedTemplate.html?.substring(0, 2000),
          },
          designLanguage: designLanguage || {},
          variationIndex: generatedVariations.length + i,
          prdContext: {
            research: prdContext.research || '',
            features: prdContext.features || [],
            prd: prdContext.prd || '',
            insights: prdContext.insights || {},
          },
        });

        if (result.success && result.variation) {
          // Add to store (persisted)
          addGeneratedVariation({
            ...result.variation,
            templateId: selectedTemplate.id,
            templateName: selectedTemplate.name,
          });
        }
      }
    } catch (err) {
      console.error('Failed to generate variations:', err);
      setContentError(err.message || 'Failed to generate design variations');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  // Adapt template content with AI (slot filling)
  const adaptContent = async () => {
    if (!selectedTemplate || !prdContext) return;

    setContentGenerating(true);

    try {
      const { slots } = parseTemplate(selectedTemplate);
      const intentForAI = designIntent?.isExtracted ? designIntent : null;
      const result = await aiService.adaptTemplateContent(slots, prdContext, intentForAI);

      if (result.success) {
        setContentGeneration(result.filledContent);
        setMode(MODES.EDIT);
      } else {
        throw new Error(result.error || 'Failed to adapt content');
      }
    } catch (err) {
      console.error('Content adaptation failed:', err);
      setContentError(err.message || 'Failed to adapt template content');
    }
  };

  const handleSelectVariation = (variation) => {
    // Mark as selected in store (persisted)
    selectGeneratedVariation(variation.id);
    // Store the variation HTML as the generated content
    setContentGeneration({ _generatedHtml: variation.html, _variation: variation });
    setMode(MODES.PREVIEW);
  };

  // Save design to history
  const handleSaveDesign = () => {
    const html = getOutputHtml();
    if (!html) return;

    saveDesign({
      name: selectedTemplate?.name || 'Untitled Design',
      templateName: selectedTemplate?.name,
      templateId: selectedTemplate?.id,
      html,
      archetype: designIntent?.archetype,
      // Generate a simple thumbnail (first 500 chars of HTML for preview)
      thumbnail: null, // Could be a base64 screenshot in future
    });
  };

  const handleUseTemplate = async () => {
    // Use the original template with AI-filled slots
    await adaptContent();
  };

  const handleSlotUpdate = (slotId, value) => {
    updateSlotContent(slotId, value);
  };

  const handleProceed = () => {
    if (filledContent || selectedVariation) {
      // Auto-save design to history when proceeding
      handleSaveDesign();
      if (onNext) onNext();
    }
  };

  // Get the final HTML to display
  const getOutputHtml = () => {
    // If we have a selected variation, use that
    if (selectedVariation?.html) {
      return selectedVariation.html;
    }
    // If we have generated HTML in content
    if (filledContent?._generatedHtml) {
      return filledContent._generatedHtml;
    }
    // Otherwise generate from template + filled slots
    if (!selectedTemplate || !filledContent) return '';
    try {
      return generateOutput(selectedTemplate, filledContent);
    } catch (err) {
      console.error('Failed to generate output:', err);
      return '';
    }
  };

  // No template selected
  if (!selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Template Selected
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-6">
          Please go back and select a template first.
        </p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Design Your Page
            </h2>
            <p className="text-sm text-zinc-500">
              Using "{selectedTemplate.name}" as inspiration
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-lg">
              <button
                onClick={() => setMode(MODES.GENERATE)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === MODES.GENERATE
                    ? 'bg-indigo-500 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                AI Design
              </button>
              <button
                onClick={() => setMode(MODES.EDIT)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === MODES.EDIT
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit Slots
              </button>
              <button
                onClick={() => setMode(MODES.PREVIEW)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === MODES.PREVIEW
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setMode(MODES.CODE)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  mode === MODES.CODE
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
            </div>

            {/* Save Design Button */}
            {(filledContent || selectedVariation) && (
              <button
                onClick={handleSaveDesign}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                title="Save design to history"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Chat with AI Designer"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* AI DESIGN MODE */}
          {mode === MODES.GENERATE && (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Generate Design Variations
                  </h3>
                  <p className="text-sm text-zinc-400">
                    AI will create new designs inspired by your template and PRD context
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleUseTemplate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    <Palette className="w-4 h-4" />
                    Use Template Directly
                  </button>
                  <button
                    onClick={() => handleGenerateVariations(3)}
                    disabled={isGeneratingVariations}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isGeneratingVariations
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                    }`}
                  >
                    {isGeneratingVariations ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate 3 Variations
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Variations Grid */}
              {generatedVariations.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedVariations.map((variation, index) => (
                    <div
                      key={variation.id}
                      className={`relative rounded-xl border overflow-hidden transition-all cursor-pointer ${
                        selectedVariation?.id === variation.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                      onClick={() => handleSelectVariation(variation)}
                    >
                      {/* Preview */}
                      <div className="aspect-[4/3] bg-white overflow-hidden">
                        {variation.html ? (
                          <iframe
                            srcDoc={variation.html}
                            className="w-full h-full border-0 pointer-events-none"
                            style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                            sandbox="allow-same-origin"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <Code className="w-8 h-8 text-zinc-600" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 bg-zinc-900/80 border-t border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            Variation {index + 1}
                          </span>
                          {selectedVariation?.id === variation.id && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <Check className="w-3 h-3" />
                              Selected
                            </span>
                          )}
                        </div>
                        {variation.description && (
                          <p className="text-xs text-zinc-500 line-clamp-2">
                            {variation.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Generate More Card */}
                  <button
                    onClick={() => handleGenerateVariations(1)}
                    disabled={isGeneratingVariations}
                    className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 flex flex-col items-center justify-center gap-3 transition-colors"
                  >
                    {isGeneratingVariations ? (
                      <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                    ) : (
                      <RefreshCw className="w-8 h-8 text-zinc-600" />
                    )}
                    <span className="text-sm text-zinc-500">Generate More</span>
                  </button>
                </div>
              ) : !isGeneratingVariations ? (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/30 rounded-xl border border-zinc-800">
                  <Sparkles className="w-12 h-12 text-zinc-700 mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-400 mb-2">
                    No variations yet
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-sm text-center mb-6">
                    Click "Generate 3 Variations" to create AI-designed pages based on your template and PRD.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="absolute inset-0 animate-ping">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-full" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Generating Designs
                  </h3>
                  <p className="text-sm text-zinc-400">
                    AI is creating {generatedVariations.length + 1} of 3 variations...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EDIT MODE */}
          {mode === MODES.EDIT && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                  <p className="text-sm text-zinc-400">Filling content slots...</p>
                </div>
              ) : filledContent && parsedTemplate ? (
                <ContentSlotEditor
                  slots={parsedTemplate.slots}
                  filledContent={filledContent}
                  onUpdate={handleSlotUpdate}
                  sections={parsedTemplate.sections}
                />
              ) : (
                <div className="text-center py-12">
                  <Edit3 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-4">
                    No content generated yet
                  </p>
                  <button
                    onClick={handleUseTemplate}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
                  >
                    Fill Content Slots
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PREVIEW MODE */}
          {mode === MODES.PREVIEW && (
            <div className="h-full min-h-[500px]">
              <TemplatePreview html={getOutputHtml()} />
            </div>
          )}

          {/* CODE MODE */}
          {mode === MODES.CODE && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap overflow-auto max-h-[500px]">
                {getOutputHtml() || 'No code generated yet'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Templates
          </button>

          <button
            onClick={handleProceed}
            disabled={!filledContent && !selectedVariation}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
          >
            Continue to Export
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="w-80 border-l border-zinc-800/50 flex-shrink-0">
          <DesignChatPanel />
        </div>
      )}
    </div>
  );
}

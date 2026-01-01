import { useState } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Loader2,
  Check,
  X,
  Download,
  Copy,
  Eye,
  Rocket,
  LayoutDashboard,
  Settings,
  User,
  RefreshCw,
  Code,
  FileJson,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { LAYOUT_TEMPLATES, PAGE_TYPE_INFO } from '../../../data/design/layoutTemplates';
import { aiService } from '../../../services/aiService';

// ============================================================================
// STEP 4: GENERATE
// ============================================================================
//
// Generate variations for each page type and export the design system.
// Uses design language tokens + selected layout to generate code.
//
// ============================================================================

const PAGE_TYPE_ICONS = {
  landing: Rocket,
  dashboard: LayoutDashboard,
  settings: Settings,
  profile: User,
};

export default function Step4_Generate() {
  const {
    layouts,
    designLanguage,
    generations,
    selectedVariations,
    addVariation,
    removeVariation,
    selectVariation,
    clearVariations,
    isGenerating,
    setGenerating,
    activePageType,
    setActivePageType,
    goToPreviousStep,
    getExportData,
    getSelectedLayout,
    importedContext, // PRD context from Step 1
  } = useDesignStudioStore();

  const [previewVariation, setPreviewVariation] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Get page types that have layouts selected
  const configuredPageTypes = Object.entries(layouts)
    .filter(([_, layoutId]) => layoutId !== null)
    .map(([pageType]) => pageType);

  const currentVariations = generations[activePageType] || [];
  const selectedVariationId = selectedVariations[activePageType];
  const currentLayout = getSelectedLayout(activePageType);

  const handleGenerate = async (count = 3) => {
    if (!currentLayout) return;

    setGenerating(true, activePageType);

    try {
      for (let i = 0; i < count; i++) {
        const result = await aiService.generateDesignVariation({
          pageType: activePageType,
          layout: currentLayout,
          designLanguage,
          variationIndex: currentVariations.length + i,
          // Pass PRD context so AI knows what the product is about
          prdContext: {
            research: importedContext?.research || '',
            features: importedContext?.features || [],
            prd: importedContext?.prd || '',
            insights: importedContext?.insights || {},
          },
        });

        if (result.success && result.variation) {
          addVariation(activePageType, {
            html: result.variation.html,
            code: result.variation.code,
            description: result.variation.description,
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate variation:', error);
    } finally {
      setGenerating(false, null);
    }
  };

  const handleCopyCode = async (variation) => {
    try {
      await navigator.clipboard.writeText(variation.code || variation.html);
      setCopiedId(variation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExport = () => {
    const exportData = getExportData();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-system.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTokens = () => {
    const tokens = {
      colors: designLanguage.colors,
      typography: designLanguage.typography,
      spacing: designLanguage.spacing,
      radii: designLanguage.radii,
      shadows: designLanguage.shadows,
    };
    const blob = new Blob([JSON.stringify(tokens, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-tokens.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Summary stats
  const totalVariations = Object.values(generations).flat().length;
  const totalSelected = Object.values(selectedVariations).filter(Boolean).length;

  return (
    <div className="flex h-full">
      {/* Page Type Sidebar */}
      <div className="w-56 border-r border-zinc-800/50 bg-zinc-900/30 flex flex-col">
        <div className="p-4 border-b border-zinc-800/50">
          <h3 className="text-sm font-semibold text-white">Generate</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Create variations for each page
          </p>
        </div>

        <div className="flex-1 p-2 space-y-1">
          {configuredPageTypes.map((pageType) => {
            const Icon = PAGE_TYPE_ICONS[pageType];
            const info = PAGE_TYPE_INFO[pageType];
            const isActive = activePageType === pageType;
            const variationCount = (generations[pageType] || []).length;
            const hasSelection = selectedVariations[pageType] !== null;

            return (
              <button
                key={pageType}
                onClick={() => setActivePageType(pageType)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${isActive
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'hover:bg-zinc-800/50'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${hasSelection
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isActive
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-zinc-800/50 text-zinc-500'
                  }
                `}>
                  {hasSelection ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {info?.name || pageType}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {variationCount} variation{variationCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Export Section */}
        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          <button
            onClick={handleExportTokens}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
          >
            <FileJson className="w-4 h-4" />
            Export Tokens
          </button>
          <button
            onClick={handleExport}
            disabled={totalSelected === 0}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
              ${totalSelected > 0
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {PAGE_TYPE_INFO[activePageType]?.name || activePageType} Variations
            </h2>
            <p className="text-sm text-zinc-500">
              Layout: {currentLayout?.name || 'None'} • {currentVariations.length} generated
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentVariations.length > 0 && (
              <button
                onClick={() => clearVariations(activePageType)}
                className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              onClick={() => handleGenerate(3)}
              disabled={isGenerating || !currentLayout}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${isGenerating
                  ? 'bg-zinc-800 text-zinc-400'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {currentVariations.length > 0 ? 'More' : '3 Variations'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Variations Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentVariations.length === 0 && !isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Sparkles className="w-12 h-12 text-zinc-700 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">
                No variations yet
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mb-6">
                Click "Generate 3 Variations" to create designs using your design language and selected layout.
              </p>
              <button
                onClick={() => handleGenerate(3)}
                disabled={!currentLayout}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Variations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {currentVariations.map((variation, index) => {
                const isSelected = selectedVariationId === variation.id;

                return (
                  <div
                    key={variation.id}
                    className={`
                      relative rounded-xl border overflow-hidden transition-all duration-200
                      ${isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-zinc-800 hover:border-zinc-700'
                      }
                    `}
                  >
                    {/* Preview */}
                    <div
                      className="aspect-[4/3] p-2 overflow-hidden"
                      style={{ backgroundColor: designLanguage.colors.background }}
                    >
                      {variation.html ? (
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <style>
                                  body { margin: 0; font-family: ${designLanguage.typography.fontFamily}, sans-serif; }
                                </style>
                              </head>
                              <body>${variation.html}</body>
                            </html>
                          `}
                          className="w-full h-full rounded border-0 pointer-events-none"
                          style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewVariation(variation)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopyCode(variation)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            title="Copy Code"
                          >
                            {copiedId === variation.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeVariation(activePageType, variation.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {variation.description && (
                        <p className="text-xs text-zinc-500 mb-2 line-clamp-2">
                          {variation.description}
                        </p>
                      )}

                      <button
                        onClick={() => selectVariation(activePageType, isSelected ? null : variation.id)}
                        className={`
                          w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }
                        `}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Generate More Card */}
              {currentVariations.length > 0 && !isGenerating && (
                <button
                  onClick={() => handleGenerate(1)}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 flex flex-col items-center justify-center gap-3 transition-colors group"
                >
                  <RefreshCw className="w-8 h-8 text-zinc-600 group-hover:text-zinc-400" />
                  <span className="text-sm text-zinc-500 group-hover:text-zinc-400">
                    Generate More
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Layouts
          </button>

          <div className="text-sm text-zinc-500">
            {totalVariations} total variations • {totalSelected} selected
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewVariation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <button
                onClick={() => setPreviewVariation(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewVariation.html ? (
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <style>
                          body { margin: 0; font-family: ${designLanguage.typography.fontFamily}, sans-serif; }
                        </style>
                      </head>
                      <body>${previewVariation.html}</body>
                    </html>
                  `}
                  className="w-full h-[600px] rounded-lg border border-zinc-700"
                />
              ) : (
                <pre className="text-sm text-zinc-300 bg-zinc-800 p-4 rounded-lg overflow-auto">
                  {previewVariation.code || 'No code available'}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

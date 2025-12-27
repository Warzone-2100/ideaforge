import { useState } from 'react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';
import VariationCard from './VariationCard';
import HomepagePreview from './HomepagePreview';

export default function DesignVariationsStep() {
  const {
    designVariations,
    setGeneratingVariations,
    setDesignVariations,
    selectVariation,
    setExpandingHomepage,
    setHomepage,
    setPageVariations,
    setPageGenerating,
    selectPageVariation,
    setPageExpanding,
    setPageFullPage,
    getEffectivePreferences,
  } = useAppStore();

  // Handle old localStorage state that may not have the new structure
  const currentPage = designVariations?.currentPage || 'landing';
  const pages = designVariations?.pages || {};
  const designBrief = designVariations?.designBrief || null;
  const editedDesignBrief = designVariations?.editedDesignBrief || null;
  // Use edited brief if available, fallback to AI-generated brief
  const activeDesignBrief = editedDesignBrief || designBrief;
  const defaultPageTypes = [
    { id: 'landing', label: 'Landing Page', description: 'Marketing homepage', icon: 'Home', defaultSections: ['hero', 'features', 'pricing', 'cta', 'footer'] },
    { id: 'dashboard', label: 'Dashboard', description: 'Main app interface', icon: 'LayoutDashboard', defaultSections: ['header', 'sidebar', 'main-content'] },
    { id: 'settings', label: 'Settings', description: 'User preferences', icon: 'Settings', defaultSections: ['header', 'nav', 'form-sections'] },
    { id: 'profile', label: 'Profile', description: 'User profile', icon: 'User', defaultSections: ['header', 'avatar', 'info-cards'] },
  ];
  const pageTypes = designVariations?.pageTypes || defaultPageTypes;
  const currentPageData = pages[currentPage];
  const currentPageType = pageTypes.find(p => p.id === currentPage) || defaultPageTypes[0];

  const {
    variations,
    selected,
    fullPage,
    isGenerating,
    isExpanding,
  } = currentPageData || {
    variations: [],
    selected: null,
    fullPage: null,
    isGenerating: false,
    isExpanding: false,
  };

  // Legacy compatibility
  const homepage = fullPage;

  const [error, setError] = useState(null);
  const [showHomepageModal, setShowHomepageModal] = useState(false);

  // Generate 3 variations for current page
  const handleGenerateVariations = async () => {
    if (!activeDesignBrief) {
      setError('No design brief available. Please generate a design brief first.');
      return;
    }

    setError(null);
    setPageGenerating(currentPage, true);

    try {
      // Use edited design brief if available, otherwise use AI-generated brief
      const result = await aiService.generateDesignVariations(activeDesignBrief, currentPage);

      if (result.success && result.variations) {
        setPageVariations(currentPage, result.variations);
      } else {
        throw new Error('Failed to generate variations');
      }
    } catch (err) {
      console.error('Variation generation error:', err);
      setError(err.message || 'Failed to generate design variations');
      setPageGenerating(currentPage, false);
    }
  };

  // Expand selected variation to full page
  const handleExpandToHomepage = async () => {
    if (!selected || !activeDesignBrief) {
      setError('Please select a variation first');
      return;
    }

    setError(null);
    setPageExpanding(currentPage, true);

    try {
      // Use edited design brief if available, otherwise use AI-generated brief
      const result = await aiService.expandToHomepage(selected, activeDesignBrief, currentPage);

      if (result.success && result.homepage) {
        setPageFullPage(currentPage, result.homepage);
      } else {
        throw new Error('Failed to expand to full page');
      }
    } catch (err) {
      console.error('Page expansion error:', err);
      setError(err.message || 'Failed to expand to full page');
      setPageExpanding(currentPage, false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {currentPageType?.label} Variations
        </h1>
        <p className="text-zinc-400">
          Generate 3 different {currentPageType?.label.toLowerCase()} designs using different AI models,
          then expand your favorite to a full page with {currentPageType?.defaultSections?.length || 5}+ sections.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-400 font-medium mb-1">Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Variations Button */}
      {variations.length === 0 && !isGenerating && (
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">
              Ready to Generate {currentPageType?.label} Variations
            </h3>
            <p className="text-zinc-400">
              We'll use 3 different AI models to create unique {currentPageType?.label.toLowerCase()} designs
              based on your design brief. Each variation will have a distinct style and approach.
            </p>
            <button
              onClick={handleGenerateVariations}
              disabled={!designBrief}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate 3 {currentPageType?.label} Variations
            </button>
            {!designBrief && (
              <p className="text-sm text-red-400">Please generate a design brief first</p>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">
              Generating {currentPageType?.label} Variations...
            </h3>
            <p className="text-zinc-400">
              Creating 3 unique {currentPageType?.label.toLowerCase()} designs. This may take 30-60 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Variations Grid */}
      {variations.length > 0 && !isGenerating && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Select Your Favorite</h2>
            <button
              onClick={handleGenerateVariations}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {variations.map((variation) => (
              <VariationCard
                key={variation.id}
                variation={variation}
                isSelected={selected?.id === variation.id}
                onSelect={(v) => selectPageVariation(currentPage, v)}
              />
            ))}
          </div>

          {/* Expand to Full Page Button */}
          {selected && !fullPage && (
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Expand to Full {currentPageType?.label}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Transform this component into a complete {currentPageType?.label.toLowerCase()}
                    with {currentPageType?.defaultSections?.length || 5}+ sections
                  </p>
                </div>
                <button
                  onClick={handleExpandToHomepage}
                  disabled={isExpanding}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  {isExpanding ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Expanding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      Generate Full {currentPageType?.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Full Page Success */}
          {fullPage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-green-400 font-semibold mb-1">
                      {currentPageType?.label} Generated!
                    </h3>
                    <p className="text-green-300 text-sm">
                      Your full {currentPageType?.label.toLowerCase()} with {fullPage.sections?.length || currentPageType?.defaultSections?.length || 5} sections is ready to preview and download.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHomepageModal(true)}
                  className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors"
                >
                  View {currentPageType?.label}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Homepage Preview Modal */}
      {homepage && showHomepageModal && (
        <HomepagePreview
          homepage={homepage}
          onClose={() => setShowHomepageModal(false)}
        />
      )}
    </div>
  );
}

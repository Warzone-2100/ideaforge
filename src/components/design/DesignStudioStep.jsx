import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Palette,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
  Download,
  Eye,
  Edit,
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';
import DesignVariationsStep from './DesignVariationsStep';
import HomepagePreview from './HomepagePreview';
import PageSelector from './PageSelector';
import DesignSystemEditor from './DesignSystemEditor';

const paletteOptions = [
  { id: 'warm', label: 'Warm', description: 'Oranges, reds, yellows', colors: ['#FF6B6B', '#FFD93D', '#FFA500'] },
  { id: 'cool', label: 'Cool', description: 'Blues, greens, purples', colors: ['#6B8AFF', '#6BFFE8', '#A06BFF'] },
  { id: 'neutral', label: 'Neutral', description: 'Grays, blacks, whites', colors: ['#2D3748', '#718096', '#E2E8F0'] },
  { id: 'vibrant', label: 'Vibrant', description: 'Bold, saturated colors', colors: ['#FF00FF', '#00FFFF', '#FFFF00'] },
];

const styleOptions = [
  { id: 'minimal', label: 'Minimal', description: 'Clean, lots of whitespace, simple' },
  { id: 'modern', label: 'Modern', description: 'Contemporary, trendy, polished' },
  { id: 'playful', label: 'Playful', description: 'Fun, colorful, energetic' },
  { id: 'professional', label: 'Professional', description: 'Business, corporate, serious' },
  { id: 'bold', label: 'Bold', description: 'Striking, experimental, unique' },
];

const productReferences = [
  { id: 'linear', label: 'Linear', description: 'Clean, minimal, fast' },
  { id: 'notion', label: 'Notion', description: 'Flexible, collaborative, intuitive' },
  { id: 'stripe', label: 'Stripe', description: 'Professional, developer-focused' },
  { id: 'arc', label: 'Arc Browser', description: 'Innovative, playful, modern' },
  { id: 'vercel', label: 'Vercel', description: 'Dark, sleek, technical' },
];

const moodKeywords = [
  'calm', 'energetic', 'luxurious', 'friendly', 'innovative',
  'trustworthy', 'creative', 'sophisticated', 'accessible', 'efficient',
];

export default function DesignStudioStep() {
  const {
    research,
    insights,
    prd,
    setCurrentStep,
    getAcceptedFeatures,
    designPreferences,
    setDesignPreferences,
    designVariations,
    setDesignBrief,
    setSharedPreferences,
    getEffectivePreferences,
    toggleBriefEditor,
  } = useAppStore();

  // Handle both old and new state structures (for localStorage migration)
  const currentPage = designVariations?.currentPage || 'landing';
  const sharedPreferences = designVariations?.sharedPreferences || {};
  const pages = designVariations?.pages || {};
  const defaultPageData = { variations: [], selected: null, fullPage: null, isGenerating: false, isExpanding: false, overridePreferences: null };
  const currentPageData = pages[currentPage] || defaultPageData;
  const effectivePreferences = getEffectivePreferences ? getEffectivePreferences(currentPage) : sharedPreferences;
  const [usePageOverride, setUsePageOverride] = useState(!!currentPageData?.overridePreferences);

  const [selectedPalette, setSelectedPalette] = useState(effectivePreferences.palette || null);
  const [selectedStyle, setSelectedStyle] = useState(effectivePreferences.style || null);
  const [selectedReferences, setSelectedReferences] = useState(effectivePreferences.references || []);
  const [selectedMoods, setSelectedMoods] = useState(effectivePreferences.mood || []);
  const [customPalette, setCustomPalette] = useState('');

  // Update form when page changes
  useEffect(() => {
    const prefs = getEffectivePreferences(currentPage);
    setSelectedPalette(prefs.palette || null);
    setSelectedStyle(prefs.style || null);
    setSelectedReferences(prefs.references || []);
    setSelectedMoods(prefs.mood || []);
    setCustomPalette('');
    setUsePageOverride(!!currentPageData?.overridePreferences);
  }, [currentPage]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreferences, setShowPreferences] = useState(!designVariations.designBrief);
  const [showVariations, setShowVariations] = useState(!!designVariations.designBrief);

  const handlePaletteSelect = (paletteId) => {
    setSelectedPalette(paletteId);
    setCustomPalette('');
  };

  const toggleReference = (refId) => {
    setSelectedReferences((prev) =>
      prev.includes(refId)
        ? prev.filter((id) => id !== refId)
        : [...prev, refId]
    );
  };

  const toggleMood = (mood) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleGenerateDesignBrief = async () => {
    const preferences = {
      palette: customPalette || selectedPalette,
      style: selectedStyle,
      references: selectedReferences,
      mood: selectedMoods,
    };

    // Save to shared preferences or page override
    if (usePageOverride) {
      // Save as page-specific override
      setDesignPreferences(preferences);
    } else {
      // Save to shared preferences
      setSharedPreferences(preferences);
      // Also update old designPreferences for backward compatibility
      setDesignPreferences(preferences);
    }

    setLoading(true);
    setError(null);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.generateDesignBrief(
        research.content,
        insights,
        acceptedFeatures,
        preferences
      );

      if (result.success) {
        setDesignBrief(result.designBrief);
        setShowPreferences(false);
        setShowVariations(true);
      } else {
        setError(result.error || 'Failed to generate design brief');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = selectedPalette || customPalette;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentStep('prompts')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agent Prompts
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Step 6 of 8
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Design Studio</h1>
              <p className="text-zinc-400">
                Configure your design preferences, generate variations, and create a full homepage
              </p>
            </div>

            <button
              onClick={() => setCurrentStep('stories')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              Continue to Stories
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

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

        {/* Page Selector */}
        {designVariations.designBrief && (
          <PageSelector />
        )}

        {/* Design Preferences Form */}
        {showPreferences && (
          <div className="mb-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                Design Preferences
                {designVariations.designBrief && (
                  <span className="text-sm font-normal text-zinc-500">
                    ({usePageOverride ? `Custom for ${currentPage}` : 'Shared across all pages'})
                  </span>
                )}
              </h2>
              {designVariations.designBrief && (
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Hide
                </button>
              )}
            </div>

            {/* Use Shared vs Custom Toggle */}
            {designVariations.designBrief && (
              <div className="mb-6 p-4 bg-zinc-950/50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePageOverride}
                    onChange={(e) => setUsePageOverride(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      Customize for this page type
                    </div>
                    <div className="text-xs text-zinc-500">
                      Override shared preferences for {currentPage} page only
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Color Palette */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white mb-3">Color Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {paletteOptions.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => handlePaletteSelect(palette.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${
                        selectedPalette === palette.id && !customPalette
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className="flex gap-1 mb-2">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="font-medium text-white text-sm">{palette.label}</div>
                    <div className="text-xs text-zinc-400">{palette.description}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPalette}
                  onChange={(e) => {
                    setCustomPalette(e.target.value);
                    setSelectedPalette(null);
                  }}
                  placeholder="Or enter custom hex colors (e.g., #FF5733, #33FF57)"
                  className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Style */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white mb-3">Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${
                        selectedStyle === style.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className="font-medium text-white text-sm mb-1">{style.label}</div>
                    <div className="text-xs text-zinc-400">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product References */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white mb-3">Product References (Optional)</h3>
              <div className="flex flex-wrap gap-2">
                {productReferences.map((ref) => (
                  <button
                    key={ref.id}
                    onClick={() => toggleReference(ref.id)}
                    className={`
                      px-3 py-2 rounded-lg border transition-all
                      ${
                        selectedReferences.includes(ref.id)
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{ref.label}</div>
                    <div className="text-xs opacity-75">{ref.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Keywords */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white mb-3">Mood (Optional)</h3>
              <div className="flex flex-wrap gap-2">
                {moodKeywords.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => toggleMood(mood)}
                    className={`
                      px-3 py-1.5 rounded-full border text-sm transition-all
                      ${
                        selectedMoods.includes(mood)
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }
                    `}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateDesignBrief}
              disabled={!canGenerate || loading}
              className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating design brief...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {designVariations.designBrief ? 'Regenerate Design Brief' : 'Generate Design Brief'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Show Preferences Button (when hidden) */}
        {!showPreferences && designVariations.designBrief && (
          <button
            onClick={() => setShowPreferences(true)}
            className="mb-6 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Edit Design Preferences
          </button>
        )}

        {/* Design Brief Preview */}
        {designVariations.designBrief && (
          <div className="mb-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Design Brief
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={toggleBriefEditor}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Design System
                </button>
                <button
                  onClick={() => {
                    const content = JSON.stringify(designVariations.designBrief, null, 2);
                    navigator.clipboard.writeText(content);
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
                >
                  Copy JSON
                </button>
                <button
                  onClick={() => {
                    const content = JSON.stringify(designVariations.designBrief, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'design-brief.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Visual Identity */}
              {designVariations.designBrief.visualIdentity && (
                <div className="bg-zinc-950/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Visual Identity</h3>
                  <p className="text-xs text-zinc-400 mb-2">
                    {designVariations.designBrief.visualIdentity.moodDescription}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {designVariations.designBrief.visualIdentity.designPhilosophy}
                  </p>
                </div>
              )}

              {/* Color Palette */}
              {designVariations.designBrief.designTokens?.colors && (
                <div className="bg-zinc-950/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Color Palette</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(designVariations.designBrief.designTokens.colors)
                      .slice(0, 6)
                      .map(([name, data]) => (
                        <div key={name} className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-zinc-700"
                            style={{ backgroundColor: data.value }}
                            title={`${name}: ${data.value}`}
                          />
                          <span className="text-xs text-zinc-400">{name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Typography */}
              {designVariations.designBrief.designTokens?.typography && (
                <div className="bg-zinc-950/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Typography</h3>
                  <p className="text-xs text-zinc-400 mb-1">
                    Font: {designVariations.designBrief.designTokens.typography['font-family']?.value}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Sizes: {Object.keys(designVariations.designBrief.designTokens.typography).filter(k => k.includes('heading')).length} heading styles
                  </p>
                </div>
              )}

              {/* Product References */}
              {designVariations.designBrief.visualIdentity?.references && (
                <div className="bg-zinc-950/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">References</h3>
                  <div className="space-y-1">
                    {designVariations.designBrief.visualIdentity.references.slice(0, 3).map((ref, i) => (
                      <p key={i} className="text-xs text-zinc-400">
                        • {ref.product}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Full JSON */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300 mb-2">
                View Full Design Brief JSON
              </summary>
              <div className="bg-zinc-950/50 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono">
                  {JSON.stringify(designVariations.designBrief, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Design Variations */}
        {showVariations && designVariations.designBrief && (
          <DesignVariationsStep />
        )}

        {/* Empty State */}
        {!designVariations.designBrief && !showPreferences && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Palette className="w-16 h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No design brief yet</h3>
            <p className="text-zinc-400 mb-6">
              Configure your design preferences to generate a design brief
            </p>
            <button
              onClick={() => setShowPreferences(true)}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Configure Design
            </button>
          </div>
        )}
      </div>

      {/* Design System Editor Modal */}
      {designVariations.isEditingBrief && <DesignSystemEditor />}
    </div>
  );
}

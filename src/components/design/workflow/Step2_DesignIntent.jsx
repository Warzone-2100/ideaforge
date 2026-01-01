import { useEffect, useState } from 'react';
import {
  Sparkles,
  Target,
  Users,
  MessageSquare,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  Building2,
  Rocket,
  Crown,
  Palette
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { aiService } from '../../../services/aiService';
import { ARCHETYPES } from '../../../data/templates/archetypes';

// ============================================================================
// STEP 2: DESIGN INTENT (V3)
// ============================================================================
//
// Auto-extracts design intent from PRD context:
//   - Product Archetype (enterprise, creator, consumer, startup)
//   - Target Audience (primary, sophistication, buying power)
//   - Communication Tone (primary, secondary, avoid)
//   - Trust Signals (certifications, testimonials, social proof)
//   - Key Messages (priority-ordered messaging)
//
// User can review and adjust before proceeding to template selection.
//
// ============================================================================

// Archetype icon mapping
const ARCHETYPE_ICONS = {
  'enterprise-technical': Building2,
  'creator-aspirational': Palette,
  'consumer-premium': Crown,
  'startup-velocity': Rocket,
};

// Archetype color mapping
const ARCHETYPE_COLORS = {
  'enterprise-technical': '#3B82F6',
  'creator-aspirational': '#EC4899',
  'consumer-premium': '#A855F7',
  'startup-velocity': '#10B981',
};

export default function Step2_DesignIntent({ onNext, onBack }) {
  const {
    importedContext,
    designIntent,
    setDesignIntent,
    setDesignIntentExtracting,
    setDesignIntentError,
    updateDesignIntent,
    finalizeDesignIntent,
    resetDesignIntent,
  } = useDesignStudioStore();

  const [isReextracting, setIsReextracting] = useState(false);

  // Build prdContext from importedContext
  const prdContext = importedContext ? {
    research: importedContext.research,
    insights: importedContext.insights,
    features: importedContext.features,
    prd: importedContext.prd,
  } : null;

  // Auto-extract on mount if not already extracted
  useEffect(() => {
    if (!designIntent.isExtracted && !designIntent.isExtracting && prdContext) {
      extractIntent();
    }
  }, []);

  const extractIntent = async () => {
    if (!prdContext) {
      setDesignIntentError('No PRD context available');
      return;
    }

    setDesignIntentExtracting(true);

    try {
      const result = await aiService.extractDesignIntent(prdContext);

      if (result.success && result.intent) {
        setDesignIntent(result.intent);
      } else {
        setDesignIntentError(result.error || 'Failed to extract design intent');
      }
    } catch (error) {
      console.error('Intent extraction failed:', error);
      setDesignIntentError(error.message || 'Extraction failed');
    }
  };

  const handleReextract = async () => {
    setIsReextracting(true);
    resetDesignIntent();
    await extractIntent();
    setIsReextracting(false);
  };

  const handleArchetypeChange = (archetype) => {
    updateDesignIntent({ archetype });
  };

  const handleToneChange = (toneType, value) => {
    updateDesignIntent({
      tone: {
        ...designIntent.tone,
        [toneType]: value,
      },
    });
  };

  const handleProceed = () => {
    finalizeDesignIntent();
    if (onNext) onNext();
  };

  // No context available
  if (!prdContext) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Context Available
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-6">
          Please import your PRD context first to extract design intent.
        </p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          Go Back to Import
        </button>
      </div>
    );
  }

  // Loading state
  if (designIntent.isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Analyzing Design Intent
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-4">
          AI is extracting archetype, audience, and tone from your PRD...
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          This usually takes 3-5 seconds
        </div>
      </div>
    );
  }

  // Error state
  if (designIntent.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Extraction Failed
        </h3>
        <p className="text-sm text-red-400 text-center max-w-md mb-6">
          {designIntent.error}
        </p>
        <button
          onClick={handleReextract}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Main content - show extracted intent
  const ArchetypeIcon = ARCHETYPE_ICONS[designIntent.archetype] || Sparkles;
  const archetypeColor = ARCHETYPE_COLORS[designIntent.archetype] || '#6B7280';
  const archetype = ARCHETYPES?.[designIntent.archetype];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Design Intent</h2>
          <p className="text-sm text-zinc-400 mt-1">
            AI-extracted design direction from your PRD. Adjust if needed.
          </p>
        </div>
        <button
          onClick={handleReextract}
          disabled={isReextracting}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isReextracting ? 'animate-spin' : ''}`} />
          Re-analyze
        </button>
      </div>

      {/* Archetype Selection */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="font-medium text-white">Product Archetype</h3>
          {designIntent.archetypeConfidence && (
            <span className="text-xs text-zinc-500 ml-auto">
              {designIntent.archetypeConfidence}% confidence
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {Object.entries(ARCHETYPES || {}).map(([id, arch]) => {
            const Icon = ARCHETYPE_ICONS[id] || Sparkles;
            const isSelected = designIntent.archetype === id;
            const color = ARCHETYPE_COLORS[id];

            return (
              <button
                key={id}
                onClick={() => handleArchetypeChange(id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  isSelected
                    ? 'border-2'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
                style={{
                  borderColor: isSelected ? color : undefined,
                  backgroundColor: isSelected ? `${color}10` : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">
                      {arch.name}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {arch.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {designIntent.archetypeReasoning && (
          <p className="text-xs text-zinc-500 italic">
            "{designIntent.archetypeReasoning}"
          </p>
        )}
      </div>

      {/* Audience & Tone Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Audience */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Target Audience</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Primary</label>
              <div className="text-sm text-white capitalize">
                {designIntent.audience?.primary || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Sophistication</label>
              <div className="text-sm text-white capitalize">
                {designIntent.audience?.sophistication || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Buying Power</label>
              <div className="text-sm text-white capitalize">
                {designIntent.audience?.buyingPower || 'Not specified'}
              </div>
            </div>
          </div>
        </div>

        {/* Tone */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Communication Tone</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Primary Tone</label>
              <div className="text-sm text-white capitalize">
                {designIntent.tone?.primary || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Secondary Tone</label>
              <div className="text-sm text-white capitalize">
                {designIntent.tone?.secondary || 'Not specified'}
              </div>
            </div>
            {designIntent.tone?.avoid?.length > 0 && (
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Avoid</label>
                <div className="flex flex-wrap gap-1">
                  {designIntent.tone.avoid.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      {designIntent.trustSignals?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-medium text-white">Trust Signals</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {designIntent.trustSignals.map((signal, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg"
              >
                <span className="text-xs text-zinc-500 uppercase">
                  {signal.type}
                </span>
                <span className="text-sm text-white">{signal.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Messages */}
      {designIntent.keyMessages?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-medium text-white">Key Messages</h3>
          </div>

          <div className="space-y-2">
            {designIntent.keyMessages.map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs font-medium">
                  {msg.priority}
                </span>
                <span className="text-sm text-zinc-300">{msg.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positioning (if available) */}
      {designIntent.positioning?.category && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="font-medium text-white">Product Positioning</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Category</label>
              <div className="text-sm text-white">
                {designIntent.positioning.category}
              </div>
            </div>
            {designIntent.positioning.versus?.length > 0 && (
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Competing Against</label>
                <div className="flex flex-wrap gap-1">
                  {designIntent.positioning.versus.map((v, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {designIntent.positioning.uniqueAngle && (
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Unique Angle</label>
                <div className="text-sm text-white">
                  {designIntent.positioning.uniqueAngle}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Back to Context
        </button>

        <button
          onClick={handleProceed}
          disabled={!designIntent.archetype}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Templates
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

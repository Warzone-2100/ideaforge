import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Palette,
  Type,
  Maximize,
  Circle,
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  Check,
  Image,
  Sliders,
  Wand2,
  FileCode2,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { MOOD_OPTIONS, REFERENCE_OPTIONS, FONT_OPTIONS, COLOR_PALETTES, PRESET_THEMES } from '../../../data/design/designPresets';
import { aiService } from '../../../services/aiService';
import CodeTemplateSelector from '../CodeTemplateSelector';

// ============================================================================
// STEP 2: DESIGN LANGUAGE
// ============================================================================
//
// Two parts:
//   1. Design Approach Selection - HOW to create the design language
//      - AI Generate: AI creates tokens from PRD analysis
//      - Template: Use template as starting point, AI adapts to PRD
//      - Manual: Start with defaults and customize
//
//   2. Token Editor - Colors, Typography, Spacing, Mood
//      - Direct editing via sliders and pickers
//      - AI chat for conversational refinement
//
// Key: PRD context (from Step 1) informs ALL approaches!
//
// ============================================================================

// Design approach options
const APPROACH_OPTIONS = [
  {
    id: 'generate',
    icon: Wand2,
    title: 'AI Generate',
    description: 'AI analyzes your PRD and creates a tailored design language',
    badge: 'Recommended',
    color: 'indigo',
  },
  {
    id: 'codeTemplate',
    icon: FileCode2,
    title: 'Code Template + PRD',
    description: 'Use pre-built HTML template, AI fills content from your PRD',
    badge: '87% cheaper',
    color: 'emerald',
  },
  {
    id: 'template',
    icon: Image,
    title: 'Design Template + PRD',
    description: 'Start from a template aesthetic, AI adapts it to your product',
    badge: null,
    color: 'violet',
  },
  {
    id: 'manual',
    icon: Sliders,
    title: 'Manual',
    description: 'Start with defaults and customize everything yourself',
    badge: null,
    color: 'zinc',
  },
];

// Color input component
function ColorInput({ label, value, onChange, description }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-700 bg-transparent"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-300">{label}</div>
        {description && (
          <div className="text-xs text-zinc-500 truncate">{description}</div>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-300 uppercase"
      />
    </div>
  );
}

// Section wrapper
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Step2_DesignLanguage() {
  const {
    designApproach,
    setDesignApproach,
    designLanguage,
    setColors,
    setTypography,
    setMood,
    setReferences,
    setRadii,
    setDesignLanguage,
    resetDesignLanguage,
    applyTemplateTokens,
    isLanguageFinalized,
    finalizeDesignLanguage,
    unfinalizeDesignLanguage,
    goToNextStep,
    goToPreviousStep,
    chatMessages,
    addChatMessage,
    clearChat,
    importedContext,
    designTemplates,
    error,
    // Code Template state
    codeTemplate,
    setCodeTemplate,
    setCodeTemplateFilledContent,
    clearCodeTemplate,
  } = useDesignStudioStore();

  const [activeTab, setActiveTab] = useState('colors');
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Auto-generate when approach is set to 'generate'
  useEffect(() => {
    if (designApproach.type === 'generate' && !isGenerating && importedContext) {
      // Only auto-generate if we haven't already
      if (chatMessages.length === 0) {
        handleGenerateFromPRD();
      }
    }
  }, [designApproach.type]);

  const handleApproachSelect = (approachId) => {
    if (approachId === 'template') {
      setShowTemplates(true);
    } else if (approachId === 'codeTemplate') {
      setDesignApproach('codeTemplate');
      setShowTemplates(false);
    } else {
      setDesignApproach(approachId);
      setShowTemplates(false);
    }
  };

  // Handle code template completion
  const handleCodeTemplateComplete = ({ template, filledContent }) => {
    setCodeTemplate(template, filledContent);
    // Mark as finalized - user has already exported from within CodeTemplateSelector
    // No need to navigate to layouts/generate since code templates are self-contained
    finalizeDesignLanguage();
    // Reset approach to show completion and allow starting over
    setDesignApproach(null);
  };

  const handleCodeTemplateCancel = () => {
    setDesignApproach(null);
    clearCodeTemplate();
  };

  const handleTemplateSelect = (preset) => {
    setSelectedPreset(preset);
  };

  const handleApplyTemplate = async () => {
    if (!selectedPreset) return;

    setDesignApproach('template', selectedPreset.id, selectedPreset.name);
    applyTemplateTokens(selectedPreset.tokens);
    setShowTemplates(false);
    setSelectedPreset(null);

    // AI adapts template to PRD context
    addChatMessage('assistant', `Applied "${selectedPreset.name}" template. I'll adapt these tokens to match your product's personality. Feel free to ask for adjustments!`);
  };

  const handleGenerateFromPRD = async () => {
    if (!importedContext) return;

    setIsGenerating(true);
    addChatMessage('assistant', 'Analyzing your PRD to generate a tailored design language...');

    try {
      const result = await aiService.generateDesignLanguage({
        research: importedContext.research || '',
        insights: importedContext.insights || {},
        features: importedContext.features || [],
        prd: importedContext.prd || '',
      });

      if (result.success && result.designLanguage) {
        setDesignLanguage(result.designLanguage);
        addChatMessage('assistant', 'Done! I\'ve created a design language based on your product vision. The colors, typography, and mood are tailored to your target audience. Feel free to ask me to adjust anything!');
      } else {
        addChatMessage('assistant', 'I\'ve set up default tokens. You can customize them or ask me to make specific changes.');
      }
    } catch (error) {
      console.error('Failed to generate design language:', error);
      addChatMessage('assistant', 'I encountered an error, but you can still customize the tokens manually or ask me for help.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const message = chatInput.trim();
    setChatInput('');
    addChatMessage('user', message);
    setIsChatLoading(true);

    try {
      const result = await aiService.chatWithDesignLanguage(message, designLanguage);

      if (result.success) {
        if (result.updatedTokens) {
          if (result.updatedTokens.colors) setColors(result.updatedTokens.colors);
          if (result.updatedTokens.typography) setTypography(result.updatedTokens.typography);
          if (result.updatedTokens.mood) setMood(result.updatedTokens.mood);
          if (result.updatedTokens.references) setReferences(result.updatedTokens.references);
          if (result.updatedTokens.radii) setRadii(result.updatedTokens.radii);
        }
        addChatMessage('assistant', result.message || 'Done! I\'ve updated the design tokens.');
      } else {
        addChatMessage('assistant', result.error || 'Sorry, I couldn\'t process that request.');
      }
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFinalize = () => {
    finalizeDesignLanguage();
    if (!error) {
      goToNextStep();
    }
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing & Radii', icon: Maximize },
    { id: 'mood', label: 'Mood & References', icon: Sparkles },
  ];

  // Template selection view
  if (showTemplates) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={() => setShowTemplates(false)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to approach selection
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Choose a Template</h2>
        <p className="text-zinc-400 mb-2">
          Select a design aesthetic as your starting point.
        </p>
        <p className="text-sm text-indigo-400 mb-8">
          AI will adapt this template's tokens to match your product's personality from the PRD.
        </p>

        {/* Preset Themes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleTemplateSelect(preset)}
              className={`
                relative p-4 rounded-xl border text-left transition-all duration-200
                ${selectedPreset?.id === preset.id
                  ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50'
                }
              `}
            >
              {/* Color Preview */}
              <div className="flex gap-1 mb-3">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: preset.tokens.colors?.primary || '#6366F1' }}
                />
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: preset.tokens.colors?.secondary || '#8B5CF6' }}
                />
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: preset.tokens.colors?.background || '#09090B' }}
                />
                <div
                  className="w-8 h-8 rounded-lg border border-zinc-700"
                  style={{ backgroundColor: preset.tokens.colors?.surface || '#18181B' }}
                />
              </div>

              <h3 className="font-semibold text-white mb-1">{preset.name}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2">{preset.description}</p>

              {/* Mood Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {preset.mood.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {selectedPreset?.id === preset.id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* User Uploaded Templates */}
        {designTemplates.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Your Uploaded Designs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {designTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect({
                    id: template.id,
                    name: template.name,
                    tokens: template.tokens || {},
                  })}
                  className={`
                    relative p-3 rounded-xl border text-left transition-all duration-200
                    ${selectedPreset?.id === template.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }
                  `}
                >
                  {template.thumbnail && (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4 className="font-medium text-white text-sm">{template.name}</h4>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleApplyTemplate}
            disabled={!selectedPreset}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${selectedPreset
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            Apply Template
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Approach selection (if not yet selected)
  if (!designApproach.type) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white mb-3">
            How would you like to create your design language?
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Your PRD context is ready. Choose how to define the visual foundation for your product.
          </p>
        </div>

        {/* Approach Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {APPROACH_OPTIONS.map((option) => {
            const Icon = option.icon;
            const colorClasses = {
              indigo: {
                bg: 'bg-indigo-500/10',
                border: 'border-indigo-500/30',
                icon: 'text-indigo-400',
              },
              emerald: {
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                icon: 'text-emerald-400',
              },
              violet: {
                bg: 'bg-violet-500/10',
                border: 'border-violet-500/30',
                icon: 'text-violet-400',
              },
              zinc: {
                bg: 'bg-zinc-700/20',
                border: 'border-zinc-600/30',
                icon: 'text-zinc-400',
              },
            }[option.color];

            return (
              <button
                key={option.id}
                onClick={() => handleApproachSelect(option.id)}
                className={`
                  relative p-6 rounded-xl border text-left transition-all duration-200
                  hover:scale-[1.02] group border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/30
                `}
              >
                {option.badge && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-500 text-white rounded-full">
                    {option.badge}
                  </span>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses.bg}`}>
                  <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white">
                  {option.title}
                </h3>
                <p className="text-sm text-zinc-500 group-hover:text-zinc-400">
                  {option.description}
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm text-zinc-500 group-hover:text-zinc-300">
                  <span>Select</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Context reminder */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-400">
                PRD context loaded
              </p>
              <p className="text-xs text-emerald-400/70 mt-1">
                {importedContext?.features?.length || 0} features • {importedContext?.prd ? 'PRD ready' : 'No PRD'} • AI will use this to inform design decisions
              </p>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-start mt-8">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Context
          </button>
        </div>
      </div>
    );
  }

  // Code Template Selector (if codeTemplate approach selected)
  if (designApproach.type === 'codeTemplate') {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCodeTemplateCancel}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              <span className="text-lg font-semibold text-white">Code Template + PRD</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <CodeTemplateSelector
            prdContext={{
              research: importedContext?.research || '',
              insights: importedContext?.insights || {},
              features: importedContext?.features || [],
              prd: importedContext?.prd || '',
            }}
            designLanguage={designLanguage}
            onComplete={handleCodeTemplateComplete}
            onCancel={handleCodeTemplateCancel}
          />
        </div>
      </div>
    );
  }

  // Token Editor (approach already selected)
  return (
    <div className="flex h-full">
      {/* Main Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Approach indicator + Tabs */}
        <div className="border-b border-zinc-800/50">
          {/* Current approach */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Approach:</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded">
                {designApproach.type === 'generate' && 'AI Generated'}
                {designApproach.type === 'template' && `Template: ${designApproach.templateName}`}
                {designApproach.type === 'manual' && 'Manual'}
              </span>
            </div>
            <button
              onClick={() => setDesignApproach(null)}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Change approach
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                    border-b-2 -mb-px
                    ${activeTab === tab.id
                      ? 'text-white border-indigo-500'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
              <p className="text-zinc-400">Generating design language from your PRD...</p>
            </div>
          ) : (
            <>
              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <Section title="Brand Colors" icon={Palette}>
                    <div className="space-y-3">
                      <ColorInput
                        label="Primary"
                        value={designLanguage.colors.primary}
                        onChange={(v) => setColors({ primary: v })}
                        description="Main brand color"
                      />
                      <ColorInput
                        label="Secondary"
                        value={designLanguage.colors.secondary}
                        onChange={(v) => setColors({ secondary: v })}
                        description="Supporting brand color"
                      />
                      <ColorInput
                        label="Accent"
                        value={designLanguage.colors.accent}
                        onChange={(v) => setColors({ accent: v })}
                        description="Highlights and CTAs"
                      />
                    </div>
                  </Section>

                  <Section title="Backgrounds" icon={Circle}>
                    <div className="space-y-3">
                      <ColorInput
                        label="Background"
                        value={designLanguage.colors.background}
                        onChange={(v) => setColors({ background: v })}
                        description="Page background"
                      />
                      <ColorInput
                        label="Surface"
                        value={designLanguage.colors.surface}
                        onChange={(v) => setColors({ surface: v })}
                        description="Cards and panels"
                      />
                      <ColorInput
                        label="Surface Hover"
                        value={designLanguage.colors.surfaceHover}
                        onChange={(v) => setColors({ surfaceHover: v })}
                        description="Hover states"
                      />
                    </div>
                  </Section>

                  <Section title="Text Colors">
                    <div className="space-y-3">
                      <ColorInput
                        label="Primary Text"
                        value={designLanguage.colors.text}
                        onChange={(v) => setColors({ text: v })}
                      />
                      <ColorInput
                        label="Secondary Text"
                        value={designLanguage.colors.textSecondary}
                        onChange={(v) => setColors({ textSecondary: v })}
                      />
                      <ColorInput
                        label="Muted Text"
                        value={designLanguage.colors.textMuted}
                        onChange={(v) => setColors({ textMuted: v })}
                      />
                      <ColorInput
                        label="Border"
                        value={designLanguage.colors.border}
                        onChange={(v) => setColors({ border: v })}
                      />
                    </div>
                  </Section>

                  <Section title="Quick Palettes">
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTES.primary.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => setColors({ primary: color })}
                          className="w-8 h-8 rounded-lg border-2 border-zinc-700 hover:border-zinc-500 transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <div className="space-y-6">
                  <Section title="Font Families" icon={Type}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Body Font</label>
                        <select
                          value={designLanguage.typography.fontFamily}
                          onChange={(e) => setTypography({ fontFamily: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        >
                          {FONT_OPTIONS.filter(f => f.category === 'sans-serif').map((font) => (
                            <option key={font.id} value={font.name}>{font.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Heading Font</label>
                        <select
                          value={designLanguage.typography.headingFont}
                          onChange={(e) => setTypography({ headingFont: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        >
                          {FONT_OPTIONS.filter(f => f.category !== 'monospace').map((font) => (
                            <option key={font.id} value={font.name}>{font.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Monospace Font</label>
                        <select
                          value={designLanguage.typography.monoFont}
                          onChange={(e) => setTypography({ monoFont: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        >
                          {FONT_OPTIONS.filter(f => f.category === 'monospace').map((font) => (
                            <option key={font.id} value={font.name}>{font.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Section>

                  <Section title="Type Scale">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Base Size: {designLanguage.typography.baseSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="20"
                          value={designLanguage.typography.baseSize}
                          onChange={(e) => setTypography({ baseSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Scale Ratio: {designLanguage.typography.scaleRatio}
                        </label>
                        <input
                          type="range"
                          min="1.1"
                          max="1.5"
                          step="0.05"
                          value={designLanguage.typography.scaleRatio}
                          onChange={(e) => setTypography({ scaleRatio: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Section>

                  <Section title="Preview">
                    <div
                      className="space-y-2 p-4 rounded-lg"
                      style={{
                        fontFamily: designLanguage.typography.fontFamily,
                        backgroundColor: designLanguage.colors.surface,
                      }}
                    >
                      <h1
                        className="font-bold"
                        style={{
                          fontFamily: designLanguage.typography.headingFont,
                          fontSize: `${designLanguage.typography.baseSize * Math.pow(designLanguage.typography.scaleRatio, 3)}px`,
                          color: designLanguage.colors.text,
                        }}
                      >
                        Heading 1
                      </h1>
                      <h2
                        className="font-semibold"
                        style={{
                          fontFamily: designLanguage.typography.headingFont,
                          fontSize: `${designLanguage.typography.baseSize * Math.pow(designLanguage.typography.scaleRatio, 2)}px`,
                          color: designLanguage.colors.text,
                        }}
                      >
                        Heading 2
                      </h2>
                      <p
                        style={{
                          fontSize: `${designLanguage.typography.baseSize}px`,
                          color: designLanguage.colors.textSecondary,
                        }}
                      >
                        Body text looks like this. It should be easy to read.
                      </p>
                      <code
                        className="text-sm px-2 py-1 rounded inline-block"
                        style={{
                          fontFamily: designLanguage.typography.monoFont,
                          backgroundColor: designLanguage.colors.surfaceHover,
                          color: designLanguage.colors.accent,
                        }}
                      >
                        const code = "monospace";
                      </code>
                    </div>
                  </Section>
                </div>
              )}

              {/* Spacing Tab */}
              {activeTab === 'spacing' && (
                <div className="space-y-6">
                  <Section title="Border Radius" icon={Maximize}>
                    <div className="space-y-4">
                      {['sm', 'md', 'lg', 'xl'].map((size) => (
                        <div key={size}>
                          <label className="block text-sm text-zinc-400 mb-2">
                            {size.toUpperCase()}: {designLanguage.radii[size]}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            value={designLanguage.radii[size]}
                            onChange={(e) => setRadii({ [size]: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-4">
                      {['sm', 'md', 'lg', 'xl'].map((size) => (
                        <div
                          key={size}
                          className="w-16 h-16 flex items-center justify-center text-xs text-zinc-400"
                          style={{
                            backgroundColor: designLanguage.colors.surface,
                            borderRadius: `${designLanguage.radii[size]}px`,
                            border: `1px solid ${designLanguage.colors.border}`,
                          }}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {/* Mood Tab */}
              {activeTab === 'mood' && (
                <div className="space-y-6">
                  <Section title="Mood Tags" icon={Sparkles}>
                    <p className="text-sm text-zinc-500 mb-4">
                      Select tags that describe the feel of your design
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MOOD_OPTIONS.map((mood) => {
                        const isSelected = designLanguage.mood.includes(mood.id);
                        return (
                          <button
                            key={mood.id}
                            onClick={() => {
                              if (isSelected) {
                                setMood(designLanguage.mood.filter(m => m !== mood.id));
                              } else {
                                setMood([...designLanguage.mood, mood.id]);
                              }
                            }}
                            className={`
                              px-3 py-1.5 rounded-lg text-sm transition-colors
                              ${isSelected
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                              }
                            `}
                          >
                            {mood.label}
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="Design References">
                    <p className="text-sm text-zinc-500 mb-4">
                      Products whose design aesthetic you want to emulate
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {REFERENCE_OPTIONS.map((ref) => {
                        const isSelected = designLanguage.references.includes(ref.id);
                        return (
                          <button
                            key={ref.id}
                            onClick={() => {
                              if (isSelected) {
                                setReferences(designLanguage.references.filter(r => r !== ref.id));
                              } else {
                                setReferences([...designLanguage.references, ref.id]);
                              }
                            }}
                            className={`
                              px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2
                              ${isSelected
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                              }
                            `}
                          >
                            <span
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: ref.colors[0] }}
                            />
                            {ref.label}
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={resetDesignLanguage}
              className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
            >
              Continue to Layouts
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-80 border-l border-zinc-800/50 flex flex-col bg-zinc-900/30">
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Ask me to adjust colors, fonts, or mood
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">
                Try: "Make it more corporate" or "Use warmer colors"
              </p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-500/20 text-indigo-100 ml-4'
                  : 'bg-zinc-800/50 text-zinc-300 mr-4'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isChatLoading && (
            <div className="bg-zinc-800/50 text-zinc-400 p-3 rounded-lg mr-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Ask to change tokens..."
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

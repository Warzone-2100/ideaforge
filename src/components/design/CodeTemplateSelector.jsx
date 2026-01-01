import { useState } from 'react';
import { FileCode2, Sparkles, Edit3, Check, ChevronRight, Loader2, AlertCircle, Layout, Download, Copy, Code, ExternalLink } from 'lucide-react';
import { getCodeTemplates } from '../../data/templates/codeTemplates';
import { parseTemplate, generateOutput } from '../../services/templateService';
import ContentSlotEditor from './ContentSlotEditor';
import TemplatePreview from './TemplatePreview';
import { aiService } from '../../services/aiService';
import useDesignStudioStore from '../../stores/useDesignStudioStore';
import { rankTemplates, getMatchTier } from '../../services/archetypeMatchingService';
import ArchetypeIndicator from './ArchetypeIndicator';
import MatchScoreCard from './MatchScoreCard';

const STEPS = {
  SELECT: 'select',
  ADAPT: 'adapt',
  EDIT: 'edit',
  EXPORT: 'export',
};

const STEP_INFO = {
  [STEPS.SELECT]: {
    title: 'Select Template',
    description: 'Choose a pre-built template to customize',
    icon: Layout,
  },
  [STEPS.ADAPT]: {
    title: 'Adapting Content',
    description: 'AI is filling content slots based on your PRD',
    icon: Sparkles,
  },
  [STEPS.EDIT]: {
    title: 'Edit & Preview',
    description: 'Fine-tune content and preview your page',
    icon: Edit3,
  },
  [STEPS.EXPORT]: {
    title: 'Export',
    description: 'Download your completed page',
    icon: Download,
  },
};

export default function CodeTemplateSelector({
  prdContext,
  designLanguage,
  onComplete,
  onCancel,
}) {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [filledContent, setFilledContent] = useState(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { designIntent } = useDesignStudioStore();

  // Get templates and rank them by match score if design intent is available
  const rawTemplates = getCodeTemplates();
  const templates = designIntent?.isExtracted
    ? (typeof rankTemplates === 'function'
        ? rankTemplates(designIntent, rawTemplates)
        : rawTemplates.map(t => ({ ...t, match: null })))
    : rawTemplates.map(t => ({ ...t, match: null }));

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    setError(null);
    setCurrentStep(STEPS.ADAPT);
    setIsAdapting(true);

    try {
      // Parse template to get slots
      const { slots } = parseTemplate(template);

      // Pass designIntent for archetype-aware content generation
      const intentForAI = designIntent?.isExtracted ? designIntent : null;
      const result = await aiService.adaptTemplateContent(slots, prdContext, intentForAI);

      if (result.success) {
        setFilledContent(result.filledContent);
        setCurrentStep(STEPS.EDIT);
      } else {
        throw new Error(result.error || 'Failed to adapt content');
      }
    } catch (err) {
      console.error('Template adaptation failed:', err);
      setError(err.message || 'Failed to adapt template content');
      setCurrentStep(STEPS.SELECT);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleUpdateSlot = (slotId, value) => {
    setFilledContent((prev) => ({
      ...prev,
      [slotId]: value,
    }));
  };

  const handleComplete = () => {
    // Go to export step instead of exiting
    setCurrentStep(STEPS.EXPORT);
  };

  const handleFinalComplete = () => {
    if (onComplete) {
      onComplete({
        template: selectedTemplate,
        filledContent,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === STEPS.EDIT) {
      setCurrentStep(STEPS.SELECT);
      setSelectedTemplate(null);
      setFilledContent(null);
    } else if (currentStep === STEPS.EXPORT) {
      setCurrentStep(STEPS.EDIT);
    }
  };

  const getGeneratedHtml = () => {
    if (!selectedTemplate || !filledContent) return '';
    return generateOutput(selectedTemplate, filledContent, designLanguage);
  };

  const handleDownloadHtml = () => {
    const html = getGeneratedHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.id || 'page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    const html = getGeneratedHtml();
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenInNewTab = () => {
    const html = getGeneratedHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [STEPS.SELECT, STEPS.ADAPT, STEPS.EDIT, STEPS.EXPORT];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, index) => {
          const info = STEP_INFO[step];
          const Icon = info.icon;
          const isActive = currentStep === step;
          const isComplete = index < currentIndex;

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isComplete
                    ? 'bg-zinc-800 text-zinc-400'
                    : 'bg-zinc-900 text-zinc-600'
                }`}
              >
                {isComplete ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                {info.title}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Step 1: Template Selection
  const renderSelectStep = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Choose a Code Template
        </h3>
        <p className="text-sm text-zinc-400">
          Select a pre-built template. AI will adapt the content based on your PRD context.
        </p>
        {designIntent?.archetype && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-zinc-500">Looking for:</span>
            <ArchetypeIndicator archetypeId={designIntent.archetype} size="sm" />
            <span className="text-xs text-zinc-500">templates</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="group p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all text-left"
          >
            {/* Live Template Preview */}
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
                  <FileCode2 className="w-8 h-8 text-zinc-600" />
                </div>
              )}
              {/* Match Score Badge Overlay */}
              {template.match && typeof getMatchTier === 'function' && (
                <div className="absolute top-2 right-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: `${getMatchTier(template.match.score).color}90`,
                      color: '#fff',
                    }}
                  >
                    {template.match.score}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                {template.category}
              </span>
            </div>

            {/* Show archetype indicator if template has archetype */}
            {template.archetype?.primary && (
              <div className="mb-2">
                <ArchetypeIndicator archetypeId={template.archetype.primary} size="sm" />
              </div>
            )}

            <h4 className="text-sm font-medium text-white mb-1">
              {template.name}
            </h4>
            <p className="text-xs text-zinc-500 mb-3">
              {template.description || 'Professional landing page template'}
            </p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                {template.contentMap?.slots?.length || 0} content slots
              </span>
              <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Select <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Show match recommendation for high scores */}
            {template.match?.score >= 85 && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <span className="text-xs text-emerald-400">
                  ✨ {template.match.recommendation}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No templates available yet</p>
        </div>
      )}
    </div>
  );

  // Step 2: Adapting (Loading State)
  const renderAdaptStep = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="absolute inset-0 animate-ping">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        Adapting Content
      </h3>
      <p className="text-sm text-zinc-400 text-center max-w-md mb-4">
        AI is analyzing your PRD and filling content slots with relevant copy...
      </p>

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        This usually takes 5-10 seconds
      </div>
    </div>
  );

  // Step 3: Edit & Preview
  const renderEditStep = () => {
    const slots = selectedTemplate?.contentMap?.slots || [];
    const sections = selectedTemplate?.contentMap?.sections || {};

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {selectedTemplate?.name}
            </h3>
            <p className="text-sm text-zinc-400">
              Edit content and see live preview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to templates
            </button>
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Complete
            </button>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Left: Content Editor */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Content Editor
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ContentSlotEditor
                slots={slots}
                filledContent={filledContent || {}}
                onUpdate={handleUpdateSlot}
                sections={sections}
              />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="min-h-0">
            <TemplatePreview
              template={selectedTemplate}
              filledContent={filledContent || {}}
              designLanguage={designLanguage}
            />
          </div>
        </div>
      </div>
    );
  };

  // Step 4: Export
  const renderExportStep = () => {
    const generatedHtml = getGeneratedHtml();
    const lineCount = generatedHtml.split('\n').length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Export Your Page
            </h3>
            <p className="text-sm text-zinc-400">
              Download, copy, or preview your completed {selectedTemplate?.name}
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to editor
          </button>
        </div>

        {/* Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Download HTML */}
          <button
            onClick={handleDownloadHtml}
            className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all text-left"
          >
            <div className="p-3 bg-emerald-500/20 rounded-lg w-fit mb-4">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Download HTML</h4>
            <p className="text-sm text-zinc-500">
              Save as standalone .html file
            </p>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all text-left"
          >
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
              {copied ? (
                <Check className="w-6 h-6 text-green-400" />
              ) : (
                <Copy className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <h4 className="text-white font-medium mb-1">
              {copied ? 'Copied!' : 'Copy Code'}
            </h4>
            <p className="text-sm text-zinc-500">
              Copy HTML to clipboard
            </p>
          </button>

          {/* Preview in New Tab */}
          <button
            onClick={handleOpenInNewTab}
            className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-500/50 hover:bg-zinc-800/50 transition-all text-left"
          >
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
              <ExternalLink className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Preview</h4>
            <p className="text-sm text-zinc-500">
              Open in new browser tab
            </p>
          </button>
        </div>

        {/* Code Preview */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Code className="w-4 h-4 text-zinc-400" />
              Generated HTML
              <span className="text-xs text-zinc-500">({lineCount} lines)</span>
            </div>
          </div>
          <div className="max-h-[400px] overflow-auto">
            <pre className="p-4 text-xs text-zinc-300 font-mono whitespace-pre-wrap">
              {generatedHtml.substring(0, 3000)}
              {generatedHtml.length > 3000 && (
                <span className="text-zinc-500">
                  {'\n\n'}... ({generatedHtml.length - 3000} more characters)
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* Done Button */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={handleFinalComplete}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition-colors"
          >
            <Check className="w-5 h-5" />
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {renderStepIndicator()}

      <div className="flex-1 min-h-0">
        {currentStep === STEPS.SELECT && renderSelectStep()}
        {currentStep === STEPS.ADAPT && renderAdaptStep()}
        {currentStep === STEPS.EDIT && renderEditStep()}
        {currentStep === STEPS.EXPORT && renderExportStep()}
      </div>
    </div>
  );
}

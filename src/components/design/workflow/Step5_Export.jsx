import { useState } from 'react';
import {
  Download,
  ChevronLeft,
  Copy,
  Check,
  Code,
  FileCode2,
  ExternalLink,
  Package,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { generateOutput } from '../../../services/templateService';
import TemplatePreview from '../TemplatePreview';

// ============================================================================
// STEP 5: EXPORT (V3)
// ============================================================================
//
// Final step - allows user to export the completed design:
//   - Copy HTML to clipboard
//   - Download as HTML file
//   - Preview in new tab
//
// ============================================================================

export default function Step5_Export({ onBack }) {
  const {
    templateSelection,
    contentGeneration,
    designIntent,
    importedContext,
  } = useDesignStudioStore();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'

  const selectedTemplate = templateSelection.selectedTemplate;
  const filledContent = contentGeneration.filledContent;

  // Generate output HTML
  const getOutputHtml = () => {
    if (!selectedTemplate || !filledContent) return '';
    try {
      return generateOutput(selectedTemplate, filledContent);
    } catch (err) {
      console.error('Failed to generate output:', err);
      return '';
    }
  };

  const outputHtml = getOutputHtml();

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download as HTML file
  const handleDownload = () => {
    const blob = new Blob([outputHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name?.toLowerCase().replace(/\s+/g, '-') || 'landing-page'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open preview in new tab
  const handleOpenInNewTab = () => {
    const blob = new Blob([outputHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (!selectedTemplate || !filledContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Nothing to Export
        </h3>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-6">
          Please complete the previous steps first.
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
          <h2 className="text-xl font-semibold text-white">Export Your Design</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Your {selectedTemplate.name} is ready! Preview, copy, or download the final HTML.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy HTML
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">Template</div>
          <div className="font-medium text-white">{selectedTemplate.name}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">Archetype</div>
          <div className="font-medium text-white capitalize">
            {designIntent?.archetype?.replace(/-/g, ' ') || 'Not set'}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">Content Slots</div>
          <div className="font-medium text-white">
            {Object.keys(filledContent).length} filled
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
            activeTab === 'preview'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
            activeTab === 'code'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          HTML Code
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {activeTab === 'preview' ? (
          <TemplatePreview html={outputHtml} />
        ) : (
          <div className="p-6 relative">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap overflow-auto max-h-[450px]">
              {outputHtml}
            </pre>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex items-center pt-4 border-t border-zinc-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Content
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download, Eye, Code, Maximize2, X } from 'lucide-react';
import { generateOutput } from '../../services/templateService';

export default function TemplatePreview({
  template,
  filledContent,
  designLanguage,
  html, // Direct HTML prop (alternative to template+filledContent)
  onRefresh,
  isLoading,
}) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code'
  const [previewHtml, setPreviewHtml] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    // If direct html prop is provided, use it
    if (html) {
      setPreviewHtml(html);
    } else if (template && filledContent) {
      const generated = generateOutput(template, filledContent, designLanguage);
      setPreviewHtml(generated);
    }
  }, [template, filledContent, designLanguage, html]);

  const handleExport = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.id || 'landing-page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Fullscreen modal
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button
            onClick={handleCloseFullscreen}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <iframe
          srcDoc={previewHtml}
          className="w-full h-full"
          title="Template Preview Fullscreen"
          sandbox="allow-scripts"
        />
      </div>
    );
  }

  return (
    <div className="template-preview bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {template?.name || 'Template Preview'}
          </span>
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'bg-indigo-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'code'
                  ? 'bg-indigo-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              Code
            </button>
          </div>

          {/* Actions */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              title="Regenerate content"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={handleFullscreen}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'preview' ? (
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            className="w-full h-full bg-white"
            title="Template Preview"
            sandbox="allow-scripts"
          />
        ) : (
          <pre className="h-full overflow-auto p-4 bg-zinc-950 text-zinc-300 text-xs font-mono">
            <code>{previewHtml}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

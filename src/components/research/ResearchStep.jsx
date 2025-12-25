import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  X,
  Eye,
  Edit3,
  FileUp
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';

export default function ResearchStep() {
  const { research, setResearch, setCurrentStep, canProceedToAnalysis } = useAppStore();
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResearch(e.target.result, file.name);
      };
      reader.readAsText(file);
    }
    setDragActive(false);
  }, [setResearch]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    noClick: true,  // Disable click on dropzone - we'll use explicit button
    noKeyboard: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleProceed = () => {
    if (canProceedToAnalysis()) {
      setCurrentStep('analysis');
    }
  };

  const handleClear = () => {
    setResearch('', null);
  };

  const hasContent = research.content.trim().length > 0;
  const canProceed = canProceedToAnalysis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Step 1 of 8
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
          Add Your Research
        </h1>
        <p className="text-zinc-500 text-[15px]">
          Paste your research dossier or upload a file. Include market research,
          competitor analysis, user insights, or any relevant documentation.
        </p>
      </div>

      {/* Input area */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                viewMode === 'edit'
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              disabled={!hasContent}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            {research.fileName && (
              <span className="text-[11px] text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                {research.fileName}
              </span>
            )}
            {hasContent && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="relative min-h-[400px]">
          {viewMode === 'edit' ? (
            <>
              <textarea
                value={research.content}
                onChange={(e) => setResearch(e.target.value, research.fileName)}
                placeholder="Paste your research here...

Example content:
# Market Research: Task Management Apps

## Market Size
- Global market valued at $4.2B in 2024
- Expected to grow 13.5% CAGR through 2030

## Key Competitors
- Todoist: Strong on simplicity, weak on collaboration
- Asana: Enterprise-focused, complex for individuals
- Notion: Feature-rich but overwhelming

## User Pain Points
- Too many clicks to create simple tasks
- Lack of smart prioritization
- Poor mobile experience

## Opportunities
- AI-powered task suggestions
- Natural language input
- Context-aware reminders"
                className="w-full h-[400px] p-4 bg-transparent text-[14px] text-zinc-300
                         placeholder-zinc-600 resize-none focus:outline-none font-mono"
              />

              {/* Hidden file input */}
              <input {...getInputProps()} />

              {/* Drop zone overlay - only visible during drag */}
              <div
                {...getRootProps()}
                className={`
                  absolute inset-0 flex flex-col items-center justify-center gap-4
                  transition-all duration-200
                  ${dragActive || isDragActive
                    ? 'bg-indigo-500/10 border-2 border-dashed border-indigo-500/50 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                  }
                `}
              >
                {(dragActive || isDragActive) && (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                      <FileUp className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-300 font-medium">Drop your file here</p>
                      <p className="text-zinc-500 text-sm">.md, .txt, or .pdf</p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 h-[400px] overflow-y-auto markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {research.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Bottom bar - Upload button */}
        {!hasContent && (
          <div className="px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/30">
            <button
              type="button"
              onClick={open}
              className="w-full flex items-center justify-center gap-2 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Click to upload or drag a file</span>
              <span className="text-zinc-700">(.md, .txt, .pdf)</span>
            </button>
          </div>
        )}
      </div>

      {/* Character count & proceed */}
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-zinc-600">
          {research.content.length.toLocaleString()} characters
          {research.content.length < 100 && research.content.length > 0 && (
            <span className="text-amber-500 ml-2">
              (minimum 100 characters recommended)
            </span>
          )}
        </div>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium
            transition-all duration-200
            ${canProceed
              ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          Analyze Research
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tips */}
      <div className="card p-4">
        <h3 className="text-[13px] font-medium text-zinc-300 mb-2">Tips for better results</h3>
        <ul className="space-y-1.5 text-[12px] text-zinc-500">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            Include market size, trends, and growth projections
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            List competitor strengths and weaknesses
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            Detail user pain points with specific examples
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            Mention any technical constraints or preferences
          </li>
        </ul>
      </div>
    </div>
  );
}

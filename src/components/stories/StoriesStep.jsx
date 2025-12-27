import { useState, useEffect } from 'react';
import {
  Download,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';

export default function StoriesStep() {
  const {
    prd,
    databaseSchema,
    apiEndpoints,
    componentTree,
    setCurrentStep,
    getAcceptedFeatures,
    storyFiles,
    setStoryFiles,
    setGeneratingStoryFiles,
  } = useAppStore();

  const [expandedStory, setExpandedStory] = useState(null);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  const generateStories = async () => {
    setGeneratingStoryFiles(true);
    setError(null);

    try {
      const acceptedFeatures = getAcceptedFeatures();
      const result = await aiService.generateStories(
        acceptedFeatures,
        prd.content,
        databaseSchema.content,
        apiEndpoints.content,
        componentTree.content
      );

      if (result.success) {
        setStoryFiles(result.stories || []);
      } else {
        setError(result.error || 'Failed to generate story files');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setGeneratingStoryFiles(false);
    }
  };

  const downloadStory = (story) => {
    const blob = new Blob([story.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = story.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllStories = () => {
    if (!storyFiles.files?.length) return;

    storyFiles.files.forEach((story, i) => {
      setTimeout(() => downloadStory(story), i * 100);
    });
  };

  const copyStory = async (story) => {
    try {
      await navigator.clipboard.writeText(story.content);
      setCopied(`story-${story.filename}`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasStories = storyFiles.files?.length > 0;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentStep('design')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Design Studio
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Step 7 of 8
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Story Files</h1>
              <p className="text-zinc-400">
                BMAD-style atomic story files for each feature with implementation tasks
              </p>
            </div>

            <button
              onClick={() => setCurrentStep('export')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              Continue to Final Export
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

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={generateStories}
            disabled={storyFiles.isGenerating}
            className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {storyFiles.isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating story files...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                {hasStories ? 'Regenerate Story Files' : 'Generate Story Files'}
              </>
            )}
          </button>

          {hasStories && (
            <button
              onClick={downloadAllStories}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download All
            </button>
          )}
        </div>

        {/* Loading State */}
        {storyFiles.isGenerating && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto mb-4" />
              <p className="text-zinc-400">Generating story files...</p>
              <p className="text-sm text-zinc-500 mt-1">This may take a minute</p>
            </div>
          </div>
        )}

        {/* Story Files List */}
        {!storyFiles.isGenerating && hasStories && (
          <div className="space-y-4">
            {storyFiles.files.map((story, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden"
              >
                {/* Story Header */}
                <button
                  onClick={() =>
                    setExpandedStory(expandedStory === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <div className="text-left">
                      <h3 className="font-medium text-white">{story.filename}</h3>
                      {story.feature && (
                        <p className="text-sm text-zinc-400">{story.feature}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyStory(story);
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {copied === `story-${story.filename}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadStory(story);
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-zinc-400" />
                    </button>
                    {expandedStory === index ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Story Content */}
                {expandedStory === index && (
                  <div className="px-6 py-4 border-t border-zinc-800/50">
                    <div className="bg-zinc-950/50 rounded-lg p-4 overflow-auto max-h-[600px]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-invert prose-sm max-w-none"
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="text-2xl font-bold text-white mb-4" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-lg font-medium text-white mt-4 mb-2" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="text-zinc-300 mb-3 leading-relaxed" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside text-zinc-300 mb-3 space-y-1" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside text-zinc-300 mb-3 space-y-1" {...props} />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code className="px-1.5 py-0.5 bg-zinc-800 text-indigo-300 rounded text-sm" {...props} />
                            ) : (
                              <code className="block p-3 bg-zinc-900 text-zinc-300 rounded-lg text-sm overflow-x-auto" {...props} />
                            ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-zinc-400 my-3" {...props} />
                          ),
                        }}
                      >
                        {story.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!storyFiles.isGenerating && !hasStories && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-16 h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No story files yet</h3>
            <p className="text-zinc-400 mb-6">
              Generate BMAD-style story files for each accepted feature
            </p>
            <button
              onClick={generateStories}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Generate Story Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Download,
  ArrowLeft,
  FolderOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Palette,
  BookOpen,
  Code,
  Package,
  Loader2,
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { generateWorkflowZip, formatFileSize, getExportSummary } from '../../utils/exportUtils';

export default function FinalExportStep() {
  const {
    research,
    prd,
    agentPrompts,
    designVariations,
    storyFiles,
    setCurrentStep,
  } = useAppStore();

  const [downloading, setDownloading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipResult, setZipResult] = useState(null);

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    setZipResult(null);

    try {
      const result = await generateWorkflowZip({
        research,
        prd,
        agentPrompts,
        designVariations,
        storyFiles,
      });

      setZipResult(result);

      // Clear success message after 5 seconds
      setTimeout(() => setZipResult(null), 5000);
    } catch (err) {
      console.error('ZIP generation error:', err);
      alert('Failed to generate ZIP file. Please try downloading files individually.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const downloadFile = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    setDownloading(true);

    try {
      let fileIndex = 0;

      // Download Research
      if (research.content) {
        setTimeout(() => {
          downloadFile(research.content, 'research.md', 'text/markdown');
        }, fileIndex++ * 100);
      }

      // Download PRD
      if (prd.content) {
        setTimeout(() => {
          downloadFile(prd.content, 'PRD.md', 'text/markdown');
        }, fileIndex++ * 100);
      }

      // Download Agent Prompts
      const promptFormats = [
        { id: 'claude', filename: 'CLAUDE.md' },
        { id: 'cursor', filename: '.cursorrules' },
        { id: 'gemini', filename: 'GEMINI.md' },
        { id: 'universal', filename: 'AGENTS.md' },
      ];

      promptFormats.forEach((format) => {
        if (agentPrompts[format.id]) {
          setTimeout(() => {
            downloadFile(agentPrompts[format.id], format.filename, 'text/markdown');
          }, fileIndex++ * 100);
        }
      });

      // Download Design Brief
      if (designVariations.designBrief) {
        setTimeout(() => {
          const content = JSON.stringify(designVariations.designBrief, null, 2);
          downloadFile(content, 'design-brief.json', 'application/json');
        }, fileIndex++ * 100);
      }

      // Download Homepage
      if (designVariations.homepage) {
        setTimeout(() => {
          downloadFile(designVariations.homepage.html, 'homepage.html', 'text/html');
        }, fileIndex++ * 100);
      }

      // Download Story Files
      if (storyFiles.files?.length) {
        storyFiles.files.forEach((story) => {
          setTimeout(() => {
            downloadFile(story.content, story.filename, 'text/markdown');
          }, fileIndex++ * 100);
        });
      }

      setTimeout(() => {
        setDownloading(false);
      }, fileIndex * 100 + 500);
    } catch (err) {
      console.error('Download error:', err);
      setDownloading(false);
    }
  };

  const exportSummary = [
    {
      category: 'Documentation',
      icon: FileText,
      items: [
        { name: 'Research', available: !!research.content },
        { name: 'PRD', available: !!prd.content },
      ],
    },
    {
      category: 'Agent Prompts',
      icon: Code,
      items: [
        { name: 'CLAUDE.md', available: !!agentPrompts.claude },
        { name: '.cursorrules', available: !!agentPrompts.cursor },
        { name: 'GEMINI.md', available: !!agentPrompts.gemini },
        { name: 'AGENTS.md', available: !!agentPrompts.universal },
      ],
    },
    {
      category: 'Design Assets',
      icon: Palette,
      items: [
        { name: 'Design Brief JSON', available: !!designVariations.designBrief },
        { name: 'Homepage HTML', available: !!designVariations.homepage },
      ],
    },
    {
      category: 'Story Files',
      icon: BookOpen,
      items: [
        {
          name: `${storyFiles.files?.length || 0} Story File${storyFiles.files?.length !== 1 ? 's' : ''}`,
          available: !!storyFiles.files?.length,
        },
      ],
    },
  ];

  const totalFiles = exportSummary.reduce((sum, cat) => {
    return sum + cat.items.filter((item) => item.available).length;
  }, 0);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentStep('stories')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Story Files
          </button>

          <div>
            <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
              <Download className="w-4 h-4 text-indigo-400" />
              Step 8 of 8
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Final Export</h1>
            <p className="text-zinc-400">
              Download all generated files and complete your workflow
            </p>
          </div>
        </div>

        {/* Export Summary */}
        <div className="mb-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              Export Summary
            </h2>
            <div className="text-sm">
              <span className="text-zinc-400">Total Files: </span>
              <span className="text-white font-semibold">{totalFiles}</span>
            </div>
          </div>

          <div className="space-y-6">
            {exportSummary.map((category) => {
              const Icon = category.icon;
              const availableCount = category.items.filter((item) => item.available).length;

              return (
                <div key={category.category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-medium text-white">{category.category}</h3>
                    <span className="text-xs text-zinc-500">
                      ({availableCount}/{category.items.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                    {category.items.map((item) => (
                      <div
                        key={item.name}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg
                          ${
                            item.available
                              ? 'bg-green-500/10 border border-green-500/20'
                              : 'bg-zinc-900/50 border border-zinc-800/50'
                          }
                        `}
                      >
                        {item.available ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            item.available ? 'text-green-300' : 'text-zinc-500'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Buttons */}
        {totalFiles > 0 ? (
          <div className="space-y-4">
            {/* Primary: ZIP Download */}
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="w-full px-6 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-medium shadow-lg shadow-indigo-500/20"
            >
              {downloadingZip ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating ZIP file...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Download All as ZIP (Organized)
                </>
              )}
            </button>

            {/* Success Message */}
            {zipResult && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-green-400 font-medium mb-1">ZIP Downloaded!</h3>
                  <p className="text-green-300 text-sm">
                    {zipResult.filename} ({formatFileSize(zipResult.size)}) - Organized into folders and ready to use
                  </p>
                </div>
              </div>
            )}

            {/* Secondary: Individual Downloads */}
            <details className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors text-sm text-zinc-400 hover:text-white flex items-center justify-between">
                <span>Or download files individually</span>
                <Download className="w-4 h-4" />
              </summary>
              <div className="p-4 border-t border-zinc-800/50">
                <button
                  onClick={handleDownloadAll}
                  disabled={downloading}
                  className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading {totalFiles} files...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download All Individually ({totalFiles} files)
                    </>
                  )}
                </button>
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  Downloads each file separately to your default download folder
                </p>
              </div>
            </details>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">No files to export</h3>
            <p className="text-zinc-400 mb-6">
              Generate content in previous steps to export files
            </p>
            <button
              onClick={() => setCurrentStep('research')}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              Start From Beginning
            </button>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentStep('prompts')}
            className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white rounded-lg transition-colors text-sm"
          >
            ← Agent Prompts
          </button>
          <button
            onClick={() => setCurrentStep('design')}
            className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white rounded-lg transition-colors text-sm"
          >
            ← Design Studio
          </button>
          <button
            onClick={() => setCurrentStep('stories')}
            className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white rounded-lg transition-colors text-sm"
          >
            ← Story Files
          </button>
          <button
            onClick={() => setCurrentStep('research')}
            className="px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white rounded-lg transition-colors text-sm"
          >
            🔄 New Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, Download, Upload, Sparkles } from 'lucide-react';
import useDesignStudioStore from '../stores/useDesignStudioStore';
import useAppStore from '../stores/useAppStore';
import { detectOldFormat, performMigration } from '../utils/designStudioMigration';

// Import Design Studio components (these will use the adapter hook)
import DesignStudioStep from '../components/design/DesignStudioStep';

/**
 * DesignStudioPage - Standalone Design Studio route
 *
 * Features:
 * - Separate from main flow
 * - Uses dedicated useDesignStudioStore
 * - Auto-migrates from old store format
 * - Can import context from main flow
 */
export default function DesignStudioPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  // Check for migration on mount
  useEffect(() => {
    const detection = detectOldFormat();
    if (detection.hasOldData) {
      const result = performMigration();
      setMigrationStatus(result);
      if (result.success && result.status === 'migrated') {
        console.log('[Design Studio] Migration completed:', result.message);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Subtle gradient orbs - different colors for Design Studio */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Design Studio Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to IdeaForge</span>
            </Link>

            <div className="h-6 w-px bg-zinc-700" />

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
                <Palette className="w-4 h-4 text-violet-400" />
              </div>
              <h1 className="text-lg font-semibold text-white">Design Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">
                Beta
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Import from PRD
            </button>

            <ExportButton />
          </div>
        </div>
      </header>

      {/* Migration Banner */}
      {migrationStatus?.status === 'migrated' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2">
          <p className="text-sm text-emerald-400 text-center">
            <Sparkles className="w-4 h-4 inline mr-2" />
            {migrationStatus.message}. Your design data has been migrated to the new system.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto p-8">
          <DesignStudioStep />
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <ImportContextModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}

/**
 * Export Button Component
 */
function ExportButton() {
  const exportDesignData = useDesignStudioStore((state) => state.exportDesignData);

  const handleExport = () => {
    const data = exportDesignData();
    console.log('[Design Studio] Export data:', data);

    // For now, just log. Later we can add proper export functionality
    alert('Design data exported to console. Check DevTools for the output.');
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
    >
      <Upload className="w-4 h-4" />
      Export Design
    </button>
  );
}

/**
 * Import Context Modal
 * Shows what data will be imported from the main flow
 */
function ImportContextModal({ onClose }) {
  const research = useAppStore((state) => state.research);
  const insights = useAppStore((state) => state.insights);
  const features = useAppStore((state) => state.features);
  const prd = useAppStore((state) => state.prd);
  const getAcceptedFeatures = useAppStore((state) => state.getAcceptedFeatures);

  const importContext = useDesignStudioStore((state) => state.importContext);

  const acceptedFeatures = getAcceptedFeatures();

  const hasData = research.content || insights.isAnalyzed || acceptedFeatures.length > 0 || prd.content;

  const handleImport = () => {
    importContext({
      research: research.content,
      insights: insights.isAnalyzed ? insights : null,
      features: acceptedFeatures,
      prd: prd.content,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Import from Main Flow</h2>

        {hasData ? (
          <>
            <p className="text-zinc-400 text-sm mb-6">
              The following data will be imported to provide context for design generation:
            </p>

            <div className="space-y-3 mb-6">
              <ImportItem
                label="Research"
                available={!!research.content}
                detail={research.content ? `${research.content.length} characters` : 'No research'}
              />
              <ImportItem
                label="Insights"
                available={insights.isAnalyzed}
                detail={insights.isAnalyzed ? 'Analyzed' : 'Not analyzed'}
              />
              <ImportItem
                label="Features"
                available={acceptedFeatures.length > 0}
                detail={`${acceptedFeatures.length} accepted features`}
              />
              <ImportItem
                label="PRD"
                available={!!prd.content}
                detail={prd.content ? 'Generated' : 'Not generated'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                Import Context
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-6">
              No data available to import. Complete some steps in the main flow first:
            </p>

            <ul className="text-sm text-zinc-500 space-y-2 mb-6">
              <li>• Add research content</li>
              <li>• Analyze research for insights</li>
              <li>• Generate and accept features</li>
              <li>• Generate a PRD</li>
            </ul>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <Link
                to="/"
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                Go to Main Flow
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Import Item Component
 */
function ImportItem({ label, available, detail }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
        <span className="text-sm text-white">{label}</span>
      </div>
      <span className="text-xs text-zinc-500">{detail}</span>
    </div>
  );
}

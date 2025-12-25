import { Lightbulb, RotateCcw, Zap } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { loadMockData } from '../../utils/mockData';

export default function Header() {
  const clearResearch = useAppStore((state) => state.clearResearch);
  const store = useAppStore();

  const handleLoadMockData = () => {
    loadMockData(store);
  };

  const showDevTools = import.meta.env.VITE_SHOW_USAGE_STATS === 'true';

  return (
    <header className="h-14 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[15px] text-zinc-100">IdeaForge</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Dev Mode: Load Mock Data */}
          {showDevTools && (
            <button
              onClick={handleLoadMockData}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px]
                       bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20
                       transition-colors"
              title="Load mock data for testing (Dev mode only)"
            >
              <Zap className="w-3.5 h-3.5" />
              Load Mock Data
            </button>
          )}

          <button
            onClick={clearResearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px]
                     text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50
                     transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>
    </header>
  );
}

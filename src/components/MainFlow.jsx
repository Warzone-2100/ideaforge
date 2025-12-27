import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import ResearchStep from './research/ResearchStep';
import AnalysisStep from './analysis/AnalysisStep';
import FeaturesStep from './features/FeaturesStep';
import PRDStep from './prd/PRDStep';
import PromptsStep from './prompts/PromptsStep';
import StoriesStep from './stories/StoriesStep';
import FinalExportStep from './export/FinalExportStep';
import UsageStatsPanel from './usage/UsageStatsPanel';
import useAppStore from '../stores/useAppStore';

/**
 * MainFlow - The primary IdeaForge workflow
 *
 * Steps: Research → Analysis → Features → PRD → Prompts → Stories → Export
 * Design Studio is now a separate route (/design-studio)
 */
export default function MainFlow() {
  const currentStep = useAppStore((state) => state.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 'research':
        return <ResearchStep />;
      case 'analysis':
        return <AnalysisStep />;
      case 'features':
        return <FeaturesStep />;
      case 'prd':
        return <PRDStep />;
      case 'prompts':
        return <PromptsStep />;
      case 'stories':
        return <StoriesStep />;
      case 'export':
        return <FinalExportStep />;
      default:
        return <ResearchStep />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Subtle gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Header />

      <div className="flex-1 flex relative z-10">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-8">
            {renderStep()}
          </div>
        </main>
      </div>

      {/* Usage Stats Panel (dev mode only) */}
      {import.meta.env.VITE_SHOW_USAGE_STATS === 'true' && <UsageStatsPanel />}
    </div>
  );
}

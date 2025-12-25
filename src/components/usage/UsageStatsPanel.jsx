import { useState } from 'react';
import useAppStore from '../../stores/useAppStore';

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toLocaleString('en-US');
};

// Helper function to format cost
const formatCost = (cost) => {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${(cost * 1000).toFixed(2)}K`;
  return `$${cost.toFixed(3)}`;
};

// Helper function to get tier color for a task
const getTierColor = (taskName) => {
  // SPEED tier (green) - gemini-flash-lite
  const speedTasks = ['analysis', 'refineFeatures', 'chatWithExport'];
  // MEDIUM tier (yellow) - claude-haiku, gemini-flash
  const mediumTasks = ['features', 'designBrief', 'designVariations'];
  // MAX BRAIN tier (red) - claude-sonnet
  const maxTasks = ['prd', 'storyFiles', 'export', 'expandHomepage'];

  if (speedTasks.includes(taskName)) return 'text-green-400';
  if (mediumTasks.includes(taskName)) return 'text-yellow-400';
  if (maxTasks.includes(taskName)) return 'text-red-400';
  return 'text-gray-400';
};

// Helper function to get tier badge
const getTierBadge = (taskName) => {
  const speedTasks = ['analysis', 'refineFeatures', 'chatWithExport'];
  const mediumTasks = ['features', 'designBrief', 'designVariations'];
  const maxTasks = ['prd', 'storyFiles', 'export', 'expandHomepage'];

  if (speedTasks.includes(taskName)) {
    return <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">⚡ SPEED</span>;
  }
  if (mediumTasks.includes(taskName)) {
    return <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">🧠 MEDIUM</span>;
  }
  if (maxTasks.includes(taskName)) {
    return <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">🚀 MAX</span>;
  }
  return null;
};

// Helper function to format task name
const formatTaskName = (taskName) => {
  const names = {
    analysis: 'Analysis',
    features: 'Features',
    refineFeatures: 'Refine Features',
    prd: 'PRD',
    storyFiles: 'Story Files',
    designBrief: 'Design Brief',
    designVariations: 'Design Variations',
    expandHomepage: 'Expand Homepage',
    chatWithExport: 'Export Chat',
    export: 'Export Prompt',
  };
  return names[taskName] || taskName;
};

// Helper function to export to CSV
const exportToCSV = (history) => {
  const headers = ['Timestamp', 'Task', 'Model', 'Tokens', 'Cost'];
  const rows = history.map(record => [
    new Date(record.timestamp).toLocaleString(),
    formatTaskName(record.task),
    record.model,
    record.tokens,
    record.cost.toFixed(6),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ideaforge-usage-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function UsageStatsPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { usageTracking, clearUsageTracking } = useAppStore();

  const { sessionTotal, byTask, history } = usageTracking;

  const handleClear = () => {
    clearUsageTracking();
    setShowClearConfirm(false);
  };

  const handleExport = () => {
    exportToCSV(history);
  };

  // Don't render if no usage data
  if (sessionTotal.requests === 0 && !isExpanded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed State */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-zinc-900/90 backdrop-blur-lg border border-zinc-800/50 rounded-xl px-4 py-3 shadow-2xl hover:bg-zinc-800/90 transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Session:</span>
              <span className="text-white font-medium">{sessionTotal.requests}</span>
              <span className="text-zinc-600">requests</span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-medium">{formatNumber(sessionTotal.tokens)}</span>
              <span className="text-zinc-600">tokens</span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-green-400 font-medium">{formatCost(sessionTotal.cost)}</span>
            </div>
            <svg
              className="w-4 h-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <h3 className="text-lg font-semibold text-white">Usage Statistics</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Session Total */}
            <div className="p-4 border-b border-zinc-800/50">
              <div className="text-sm text-zinc-400 mb-2">Session Total</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">Requests</div>
                  <div className="text-xl font-semibold text-white">{sessionTotal.requests}</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">Tokens</div>
                  <div className="text-xl font-semibold text-indigo-400">{formatNumber(sessionTotal.tokens)}</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">Cost</div>
                  <div className="text-xl font-semibold text-green-400">{formatCost(sessionTotal.cost)}</div>
                </div>
              </div>
            </div>

            {/* By-Task Breakdown */}
            <div className="p-4 border-b border-zinc-800/50">
              <div className="text-sm text-zinc-400 mb-3">By Task</div>
              <div className="space-y-2">
                {Object.entries(byTask)
                  .filter(([, stats]) => stats.requests > 0)
                  .sort((a, b) => b[1].cost - a[1].cost)
                  .map(([taskName, stats]) => (
                    <div
                      key={taskName}
                      className="bg-zinc-800/30 rounded-lg p-3 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getTierColor(taskName)}`}>
                            {formatTaskName(taskName)}
                          </span>
                          {getTierBadge(taskName)}
                        </div>
                        <span className="text-sm font-medium text-green-400">{formatCost(stats.cost)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>{stats.requests} req</span>
                        <span>{formatNumber(stats.tokens)} tokens</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div className="p-4">
                <div className="text-sm text-zinc-400 mb-3">Recent History ({history.length})</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="bg-zinc-800/30 rounded-lg p-3 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${getTierColor(record.task)}`}>
                          {formatTaskName(record.task)}
                        </span>
                        <span className="text-zinc-500">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="truncate max-w-[300px]">{record.model}</span>
                        <div className="flex items-center gap-3">
                          <span>{formatNumber(record.tokens)} tok</span>
                          <span className="text-green-400">{formatCost(record.cost)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 p-4 border-t border-zinc-800/50">
            {history.length > 0 && (
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors text-sm font-medium"
              >
                Export CSV
              </button>
            )}
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                Clear Stats
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

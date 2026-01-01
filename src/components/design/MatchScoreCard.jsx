import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MatchScoreCard({ score, breakdown, recommendation, compact = false }) {
  // Determine tier and color
  const getTier = (score) => {
    if (score >= 85) return { label: 'Excellent', color: '#10B981', bg: 'bg-emerald-500', icon: TrendingUp };
    if (score >= 70) return { label: 'Good', color: '#3B82F6', bg: 'bg-blue-500', icon: TrendingUp };
    if (score >= 55) return { label: 'Decent', color: '#F59E0B', bg: 'bg-amber-500', icon: Minus };
    return { label: 'Low', color: '#6B7280', bg: 'bg-zinc-500', icon: TrendingDown };
  };

  const tier = getTier(score);
  const TierIcon = tier.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: tier.color }}
          />
          <span className="text-sm font-medium" style={{ color: tier.color }}>
            {score}%
          </span>
        </div>
        <span className="text-xs text-zinc-500">{tier.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      {/* Score header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TierIcon className="w-5 h-5" style={{ color: tier.color }} />
          <span className="text-lg font-semibold text-white">{score}%</span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          {recommendation || tier.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${tier.bg} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-zinc-500 capitalize mb-0.5">{key}</div>
              <div className="text-zinc-300 font-medium">{value}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

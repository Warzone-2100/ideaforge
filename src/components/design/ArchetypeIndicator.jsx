import { Building2, Rocket, Crown, Palette } from 'lucide-react';

const ARCHETYPE_CONFIG = {
  'enterprise-technical': {
    name: 'Enterprise',
    icon: Building2,
    color: '#3B82F6',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  'creator-aspirational': {
    name: 'Creator',
    icon: Palette,
    color: '#EC4899',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
  'consumer-premium': {
    name: 'Premium',
    icon: Crown,
    color: '#A855F7',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  'startup-velocity': {
    name: 'Startup',
    icon: Rocket,
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
};

export default function ArchetypeIndicator({ archetypeId, size = 'md', showLabel = true }) {
  const config = ARCHETYPE_CONFIG[archetypeId];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span className="font-medium">{config.name}</span>}
    </div>
  );
}

export { ARCHETYPE_CONFIG };

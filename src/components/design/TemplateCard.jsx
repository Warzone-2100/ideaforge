import { useState } from 'react';
import { X, Check } from 'lucide-react';

const categoryColors = {
  dashboard: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  landing: 'bg-green-500/10 text-green-400 border-green-500/20',
  settings: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  profile: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  admin: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ecommerce: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  portfolio: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const formatTimeAgo = (isoTimestamp) => {
  if (!isoTimestamp) return '';

  const now = new Date();
  const uploaded = new Date(isoTimestamp);
  const secondsAgo = Math.floor((now - uploaded) / 1000);

  if (secondsAgo < 60) return 'Just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;

  return uploaded.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TemplateCard({ template, isSelected, onSelect, onDelete, isBuiltIn }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();

    if (window.confirm(`Delete "${template.name}"?\n\nThis template will be permanently removed from your library.`)) {
      onDelete(template.id);
    }
  };

  const handleSelect = () => {
    onSelect(template);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  };

  const categoryColor = categoryColors[template.category] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  const timeAgo = formatTimeAgo(template.uploadedAt);

  return (
    <div
      className={`
        relative w-[200px] h-[160px] rounded-xl overflow-hidden
        bg-zinc-900/50 border transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        ${isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
          : 'border-zinc-800/50 hover:border-zinc-700 shadow-sm'
        }
      `}
      onClick={handleSelect}
      onMouseEnter={() => {
        setIsHovering(true);
        setShowOverlay(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowOverlay(false);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select template ${template.name}`}
      aria-pressed={isSelected}
    >
      {/* Thumbnail Image */}
      <div className="relative w-full h-[100px] overflow-hidden bg-zinc-950/50">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          /* Placeholder for templates without thumbnails */
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-2xl font-display font-bold text-white/40 mb-1">
                {template.name.split('//')[0] || template.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-[8px] text-zinc-500 uppercase tracking-wider">
                {template.category}
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {/* Built-in Badge */}
          {isBuiltIn && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border backdrop-blur-sm bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              ⭐ BUILT-IN
            </span>
          )}
          {/* Category Badge */}
          <span className={`
            px-2 py-0.5 text-[10px] font-medium rounded-full border backdrop-blur-sm
            ${categoryColor}
          `}>
            {template.category}
          </span>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 z-10">
            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
            <button
              onClick={handleSelect}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Use Template
            </button>

            {/* Delete Button (only for user-uploaded templates) */}
            {!isBuiltIn && (
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                title="Delete template"
                aria-label="Delete template"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-3 space-y-1">
        <h4 className="text-sm font-medium text-zinc-100 truncate" title={template.name}>
          {template.name}
        </h4>

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-[10px]">
          {timeAgo && (
            <span className="text-zinc-500">
              {timeAgo}
            </span>
          )}

          {template.source === 'screenshot' && (
            <span className="text-zinc-600">
              AI Analyzed
            </span>
          )}

          {isBuiltIn && (
            <span className="text-zinc-600">
              Built-in
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

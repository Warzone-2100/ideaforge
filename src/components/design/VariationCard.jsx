import { useState } from 'react';

export default function VariationCard({ variation, isSelected, onSelect }) {
  const [imageError, setImageError] = useState(false);

  // Create a blob URL for the HTML content to preview in iframe
  const createPreviewURL = () => {
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${variation.css || ''}
        </style>
      </head>
      <body>
        ${variation.html || ''}
        <script>${variation.js || ''}</script>
      </body>
      </html>
    `;
    const blob = new Blob([fullHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  const [previewURL] = useState(createPreviewURL());

  // Get model display name
  const getModelName = (modelPath) => {
    const parts = modelPath.split('/');
    return parts[parts.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-200
        ${isSelected
          ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/20'
          : 'border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700'
        }
      `}
    >
      {/* Model Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-700/50">
          <span className="text-xs font-medium text-zinc-300">
            {getModelName(variation.model)}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="aspect-video rounded-t-xl overflow-hidden bg-white">
        {!imageError ? (
          <iframe
            src={previewURL}
            className="w-full h-full border-0 pointer-events-none"
            sandbox="allow-same-origin"
            title={`Preview of ${variation.description}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <p className="text-zinc-500">Preview unavailable</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
              {variation.componentType || 'Component'}
            </span>
            {variation._meta?.error && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                Error
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2">
            {variation.description || 'AI-generated UI component'}
          </p>
        </div>

        {/* Stats */}
        {variation._meta && !variation._meta.error && (
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{variation._meta.tokens?.toLocaleString() || 0} tokens</span>
            <span className="text-green-400">
              ${variation._meta.cost?.toFixed(3) || '0.000'}
            </span>
          </div>
        )}

        {/* Select Button */}
        <button
          onClick={() => onSelect(variation)}
          className={`
            w-full py-2 px-4 rounded-lg font-medium text-sm transition-all
            ${isSelected
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }
          `}
        >
          {isSelected ? '✓ Selected' : 'Select This Style'}
        </button>
      </div>
    </div>
  );
}

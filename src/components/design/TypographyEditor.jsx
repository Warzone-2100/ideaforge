import { useState } from 'react';
import { Type, ChevronDown, ChevronUp } from 'lucide-react';

const FONT_FAMILIES = [
  { value: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', label: 'Inter (Sans-serif)' },
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Charter, Georgia, serif', label: 'Charter (Serif)' },
  { value: '"SF Mono", Monaco, monospace', label: 'SF Mono (Monospace)' },
  { value: 'ui-monospace, monospace', label: 'UI Monospace' },
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semibold (600)' },
  { value: '700', label: 'Bold (700)' },
];

// Parse font scale object or string
function parseFontScale(scale) {
  if (typeof scale === 'object') {
    return scale;
  }
  // Handle string format like "xs: 12px, sm: 14px, base: 16px"
  if (typeof scale === 'string') {
    const parsed = {};
    scale.split(',').forEach((item) => {
      const [key, value] = item.split(':').map((s) => s.trim());
      if (key && value) {
        parsed[key] = value;
      }
    });
    return parsed;
  }
  return {};
}

// Convert font scale object back to string
function stringifyFontScale(scaleObj) {
  return Object.entries(scaleObj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

function FontSizeSlider({ label, value, onChange, min = 10, max = 48 }) {
  const numValue = parseInt(value) || 16;

  const handleChange = (e) => {
    const newValue = `${e.target.value}px`;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <span className="text-xs font-mono text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={numValue}
        onChange={handleChange}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
}

export default function TypographyEditor({ typography, onTypographyChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [scaleExpanded, setScaleExpanded] = useState(false);

  const fontFamily = typography['font-family']?.value || typography.fontFamily || 'Inter, sans-serif';
  const fontScale = parseFontScale(typography.scale || typography['font-scale']);
  const fontWeights = typography.weights || typography['font-weights'] || '400 for body, 500 for emphasis, 600 for headings';

  const handleFontFamilyChange = (e) => {
    onTypographyChange('font-family', { value: e.target.value, usage: 'Primary font stack' });
  };

  const handleScaleChange = (key, value) => {
    const newScale = { ...fontScale, [key]: value };
    onTypographyChange('scale', newScale);
  };

  const handleWeightToggle = (weight) => {
    // Parse current weights string and toggle weight
    const currentWeights = fontWeights.split(',').map((w) => w.trim());
    const weightStr = weight;

    let newWeights;
    if (currentWeights.some((w) => w.includes(weightStr))) {
      // Remove weight
      newWeights = currentWeights.filter((w) => !w.includes(weightStr));
    } else {
      // Add weight
      const weightLabel =
        weight === '400'
          ? '400 for body'
          : weight === '500'
          ? '500 for emphasis'
          : weight === '600'
          ? '600 for headings'
          : weight === '700'
          ? '700 for display'
          : `${weight}`;
      newWeights = [...currentWeights, weightLabel];
    }

    onTypographyChange('weights', newWeights.join(', '));
  };

  const isWeightActive = (weight) => {
    return fontWeights.includes(weight);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Typography</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Font Family */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={handleFontFamilyChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-600 mt-1 font-mono truncate">{fontFamily}</p>
          </div>

          {/* Font Preview */}
          <div className="p-3 bg-zinc-950/50 rounded-lg">
            <p className="text-sm text-white" style={{ fontFamily }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-xs text-zinc-500 mt-1" style={{ fontFamily }}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
            </p>
          </div>

          {/* Font Weights */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Font Weights
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_WEIGHTS.map((weight) => (
                <button
                  key={weight.value}
                  onClick={() => handleWeightToggle(weight.value)}
                  className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                    isWeightActive(weight.value)
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  }`}
                  style={{ fontWeight: weight.value }}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale */}
          <div>
            <button
              onClick={() => setScaleExpanded(!scaleExpanded)}
              className="w-full flex items-center justify-between mb-2"
            >
              <label className="text-xs font-medium text-zinc-400">
                Font Scale
              </label>
              {scaleExpanded ? (
                <ChevronUp className="w-3 h-3 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              )}
            </button>

            {scaleExpanded && (
              <div className="space-y-3 p-3 bg-zinc-950/50 rounded-lg">
                {Object.entries(fontScale).map(([key, value]) => (
                  <FontSizeSlider
                    key={key}
                    label={key}
                    value={value}
                    onChange={(newValue) => handleScaleChange(key, newValue)}
                  />
                ))}
              </div>
            )}

            {!scaleExpanded && (
              <p className="text-xs text-zinc-600 font-mono">
                {Object.entries(fontScale).length} size levels defined
              </p>
            )}
          </div>

          {/* Scale Preview */}
          {scaleExpanded && (
            <div className="p-3 bg-zinc-950/50 rounded-lg space-y-2">
              <p className="text-[10px] text-zinc-600 mb-2">Preview:</p>
              {Object.entries(fontScale).map(([key, value]) => (
                <p
                  key={key}
                  className="text-white"
                  style={{ fontSize: value, fontFamily }}
                >
                  {key}: {value}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

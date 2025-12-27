import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ChevronDown, ChevronUp, Palette } from 'lucide-react';

// Color category definitions
const COLOR_CATEGORIES = {
  background: {
    label: 'Background',
    description: 'Surface colors for backgrounds and containers',
  },
  foreground: {
    label: 'Foreground',
    description: 'Text and icon colors',
  },
  brand: {
    label: 'Brand',
    description: 'Primary brand colors and accents',
  },
  semantic: {
    label: 'Semantic',
    description: 'Status, feedback, and UI state colors',
  },
};

// Categorize colors based on their key names
function categorizeColors(colors) {
  const categorized = {
    background: {},
    foreground: {},
    brand: {},
    semantic: {},
  };

  Object.entries(colors).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('background') || lowerKey.includes('surface')) {
      categorized.background[key] = value;
    } else if (lowerKey.includes('foreground') || lowerKey.includes('text')) {
      categorized.foreground[key] = value;
    } else if (lowerKey.includes('primary') || lowerKey.includes('accent') || lowerKey.includes('brand')) {
      categorized.brand[key] = value;
    } else if (lowerKey.includes('error') || lowerKey.includes('success') || lowerKey.includes('warning') || lowerKey.includes('info')) {
      categorized.semantic[key] = value;
    } else {
      // Default to brand if no match
      categorized.brand[key] = value;
    }
  });

  return categorized;
}

function ColorTokenItem({ tokenKey, tokenData, onColorChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(tokenData.value);

  const handleHexInputChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onColorChange(tokenKey, value);
    }
  };

  const handlePickerChange = (color) => {
    setHexInput(color);
    onColorChange(tokenKey, color);
  };

  return (
    <div className="p-3 bg-zinc-950/50 rounded-lg">
      <div className="flex items-start gap-3">
        {/* Color Swatch (clickable to open picker) */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="relative w-12 h-12 rounded border-2 border-zinc-700 hover:border-indigo-500 transition-colors flex-shrink-0"
          style={{ backgroundColor: tokenData.value }}
          aria-label={`Pick color for ${tokenKey}`}
        >
          <Palette className="w-4 h-4 text-white/80 absolute inset-0 m-auto" />
        </button>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white capitalize">
              {tokenKey.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            {showPicker && (
              <button
                onClick={() => setShowPicker(false)}
                className="text-xs text-zinc-500 hover:text-zinc-400"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Hex Input */}
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder="#000000"
            className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
          />

          {/* Usage Description */}
          {tokenData.usage && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
              {tokenData.usage}
            </p>
          )}
        </div>
      </div>

      {/* Color Picker Dropdown */}
      {showPicker && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <HexColorPicker
            color={tokenData.value}
            onChange={handlePickerChange}
            style={{ width: '100%', height: '140px' }}
          />
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            Click the swatch or click here to close
          </p>
        </div>
      )}
    </div>
  );
}

function ColorCategory({ categoryKey, categoryData, colors, onColorChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const colorEntries = Object.entries(colors);
  if (colorEntries.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition-colors mb-2"
      >
        <div>
          <h3 className="text-sm font-semibold text-white text-left">
            {categoryData.label}
          </h3>
          <p className="text-xs text-zinc-500 text-left">
            {categoryData.description}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {colorEntries.map(([key, value]) => (
            <ColorTokenItem
              key={key}
              tokenKey={key}
              tokenData={value}
              onColorChange={onColorChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ColorTokenEditor({ colors, onColorChange }) {
  const categorizedColors = categorizeColors(colors);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Color Tokens</h3>
      </div>

      <p className="text-xs text-zinc-500 mb-4">
        Click color swatches to use the picker, or enter hex codes directly
      </p>

      {Object.entries(COLOR_CATEGORIES).map(([categoryKey, categoryData]) => (
        <ColorCategory
          key={categoryKey}
          categoryKey={categoryKey}
          categoryData={categoryData}
          colors={categorizedColors[categoryKey]}
          onColorChange={onColorChange}
        />
      ))}
    </div>
  );
}

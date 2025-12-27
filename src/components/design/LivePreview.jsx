import { Eye, AlertCircle, CheckCircle, Loader2, User } from 'lucide-react';

// Helper to safely get color values
function getColor(tokens, key, fallback = '#6366F1') {
  if (!tokens?.colors?.[key]?.value) return fallback;
  return tokens.colors[key].value;
}

// Helper to safely get spacing values
function getSpacing(tokens, level = 4) {
  if (!tokens?.spacing?.scale) return '16px';
  const scale = tokens.spacing.scale.split(',').map((s) => s.trim());
  return scale[level] || '16px';
}

// Helper to safely get border radius
function getRadius(tokens, size = 'md') {
  if (!tokens?.radius?.[size]) return '8px';
  const value = tokens.radius[size];
  return value.split(' ')[0]; // Extract just the size, ignore description
}

// Helper to safely get shadow
function getShadow(tokens, level = 'medium') {
  if (!tokens?.shadows?.[level]) return '0 4px 12px rgba(0,0,0,0.4)';
  const value = tokens.shadows[level];
  return value.split(' - ')[0]; // Extract shadow, ignore description
}

// Helper to safely get font family
function getFontFamily(tokens) {
  return tokens?.typography?.fontFamily || tokens?.typography?.['font-family']?.value || 'Inter, sans-serif';
}

// Helper to safely get font size
function getFontSize(tokens, size = 'base') {
  if (!tokens?.typography?.scale?.[size]) return '14px';
  return tokens.typography.scale[size].split('/')[0]; // Extract size, ignore line-height
}

// Diff detection helper
function hasColorChanged(originalTokens, currentTokens, key) {
  if (!originalTokens?.colors?.[key] || !currentTokens?.colors?.[key]) return false;
  return originalTokens.colors[key].value !== currentTokens.colors[key].value;
}

function ChangeBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded">
      Changed
    </span>
  );
}

export default function LivePreview({ tokens, originalTokens }) {
  if (!tokens) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-center h-full">
        <div className="text-center text-zinc-500">
          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No design tokens to preview</p>
        </div>
      </div>
    );
  }

  const colors = tokens.colors || {};
  const typography = tokens.typography || {};
  const spacing = tokens.spacing || {};
  const radius = tokens.radius || {};
  const shadows = tokens.shadows || {};

  const primaryChanged = hasColorChanged(originalTokens, tokens, 'primary');
  const backgroundChanged = hasColorChanged(originalTokens, tokens, 'background');
  const errorChanged = hasColorChanged(originalTokens, tokens, 'error');
  const successChanged = hasColorChanged(originalTokens, tokens, 'success');

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Live Preview</h3>
      </div>

      <p className="text-xs text-zinc-500 mb-4">
        See how your design tokens look in real components
      </p>

      <div className="space-y-4">
        {/* Buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-medium text-zinc-400">Buttons</h4>
            {primaryChanged && <ChangeBadge />}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              style={{
                backgroundColor: getColor(tokens, 'primary'),
                color: getColor(tokens, 'foreground', '#FFFFFF'),
                padding: `${getSpacing(tokens, 2)} ${getSpacing(tokens, 4)}`,
                borderRadius: getRadius(tokens, 'sm'),
                fontFamily: getFontFamily(tokens),
                fontSize: getFontSize(tokens, 'sm'),
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
              className="shadow-sm"
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: getColor(tokens, 'backgroundSubtle', '#18181B'),
                color: getColor(tokens, 'foreground', '#FFFFFF'),
                padding: `${getSpacing(tokens, 2)} ${getSpacing(tokens, 4)}`,
                borderRadius: getRadius(tokens, 'sm'),
                fontFamily: getFontFamily(tokens),
                fontSize: getFontSize(tokens, 'sm'),
                fontWeight: '500',
                border: `1px solid ${getColor(tokens, 'border', '#27272A')}`,
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              Secondary Button
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400">Input Field</h4>
          <input
            type="text"
            placeholder="Enter text..."
            style={{
              backgroundColor: `${getColor(tokens, 'background')}CC`,
              color: getColor(tokens, 'foreground'),
              border: `1px solid ${getColor(tokens, 'border', '#27272A')}`,
              borderRadius: getRadius(tokens, 'sm'),
              padding: `${getSpacing(tokens, 2)} ${getSpacing(tokens, 3)}`,
              fontFamily: getFontFamily(tokens),
              fontSize: getFontSize(tokens, 'sm'),
              width: '100%',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = getColor(tokens, 'primary');
              e.target.style.boxShadow = `0 0 0 1px ${getColor(tokens, 'primary')}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = getColor(tokens, 'border', '#27272A');
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Card with Shadow */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-medium text-zinc-400">Card</h4>
            {backgroundChanged && <ChangeBadge />}
          </div>
          <div
            style={{
              backgroundColor: getColor(tokens, 'backgroundSubtle', '#18181B'),
              border: `1px solid ${getColor(tokens, 'border', '#27272A')}`,
              borderRadius: getRadius(tokens, 'md'),
              padding: getSpacing(tokens, 4),
              boxShadow: getShadow(tokens, 'subtle'),
              fontFamily: getFontFamily(tokens),
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: getRadius(tokens, 'full'),
                  backgroundColor: getColor(tokens, 'primary'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User
                  className="w-5 h-5"
                  style={{ color: getColor(tokens, 'foreground', '#FFFFFF') }}
                />
              </div>
              <div>
                <h5
                  style={{
                    fontSize: getFontSize(tokens, 'base'),
                    fontWeight: '600',
                    color: getColor(tokens, 'foreground'),
                    marginBottom: '2px',
                  }}
                >
                  Card Title
                </h5>
                <p
                  style={{
                    fontSize: getFontSize(tokens, 'xs'),
                    color: getColor(tokens, 'foregroundMuted', '#71717A'),
                  }}
                >
                  Card description
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback States */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-medium text-zinc-400">Feedback States</h4>
            {(errorChanged || successChanged) && <ChangeBadge />}
          </div>

          {/* Success */}
          <div
            style={{
              backgroundColor: `${getColor(tokens, 'success', '#10B981')}10`,
              border: `1px solid ${getColor(tokens, 'success', '#10B981')}40`,
              borderRadius: getRadius(tokens, 'sm'),
              padding: `${getSpacing(tokens, 2)} ${getSpacing(tokens, 3)}`,
              fontFamily: getFontFamily(tokens),
              display: 'flex',
              alignItems: 'center',
              gap: getSpacing(tokens, 2),
            }}
          >
            <CheckCircle
              className="w-4 h-4"
              style={{ color: getColor(tokens, 'success', '#10B981') }}
            />
            <span
              style={{
                fontSize: getFontSize(tokens, 'xs'),
                color: getColor(tokens, 'success', '#10B981'),
              }}
            >
              Success message
            </span>
          </div>

          {/* Error */}
          <div
            style={{
              backgroundColor: `${getColor(tokens, 'error', '#EF4444')}10`,
              border: `1px solid ${getColor(tokens, 'error', '#EF4444')}40`,
              borderRadius: getRadius(tokens, 'sm'),
              padding: `${getSpacing(tokens, 2)} ${getSpacing(tokens, 3)}`,
              fontFamily: getFontFamily(tokens),
              display: 'flex',
              alignItems: 'center',
              gap: getSpacing(tokens, 2),
            }}
          >
            <AlertCircle
              className="w-4 h-4"
              style={{ color: getColor(tokens, 'error', '#EF4444') }}
            />
            <span
              style={{
                fontSize: getFontSize(tokens, 'xs'),
                color: getColor(tokens, 'error', '#EF4444'),
              }}
            >
              Error message
            </span>
          </div>

          {/* Loading */}
          <div
            style={{
              backgroundColor: `${getColor(tokens, 'primary')}10`,
              border: `1px solid ${getColor(tokens, 'primary')}40`,
              borderRadius: getRadius(tokens, 'sm'),
              padding: `${getSpacing(tokens, 2)} ${getSpacing(tokens, 3)}`,
              fontFamily: getFontFamily(tokens),
              display: 'flex',
              alignItems: 'center',
              gap: getSpacing(tokens, 2),
            }}
          >
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: getColor(tokens, 'primary') }}
            />
            <span
              style={{
                fontSize: getFontSize(tokens, 'xs'),
                color: getColor(tokens, 'primary'),
              }}
            >
              Loading...
            </span>
          </div>
        </div>

        {/* Typography Scale */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400">Typography Scale</h4>
          <div
            style={{
              fontFamily: getFontFamily(tokens),
              color: getColor(tokens, 'foreground'),
            }}
            className="space-y-2"
          >
            {tokens?.typography?.scale &&
              Object.entries(tokens.typography.scale).map(([key, value]) => (
                <p
                  key={key}
                  style={{
                    fontSize: value.split('/')[0],
                    lineHeight: value.split('/')[1] || '1.5',
                  }}
                >
                  {key}: The quick brown fox
                </p>
              ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400">Color Palette</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(colors).slice(0, 8).map(([key, data]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 rounded"
                style={{
                  backgroundColor: getColor(tokens, 'backgroundSubtle', '#18181B'),
                }}
              >
                <div
                  className="w-8 h-8 rounded border"
                  style={{
                    backgroundColor: data.value,
                    borderColor: getColor(tokens, 'border', '#27272A'),
                  }}
                />
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: getColor(tokens, 'foreground') }}
                  >
                    {key}
                  </p>
                  <p
                    className="text-[10px] font-mono"
                    style={{ color: getColor(tokens, 'foregroundMuted', '#71717A') }}
                  >
                    {data.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

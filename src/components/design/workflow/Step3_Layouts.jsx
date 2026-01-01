import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Rocket,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import { LAYOUT_TEMPLATES, PAGE_TYPE_INFO } from '../../../data/design/layoutTemplates';

// ============================================================================
// STEP 3: LAYOUTS
// ============================================================================
//
// User selects structural layouts for each page type:
//   - Landing Page
//   - Dashboard
//   - Settings
//   - Profile
//
// Layouts are structural only (skeleton) - design language is applied separately.
//
// ============================================================================

const PAGE_TYPE_ICONS = {
  landing: Rocket,
  dashboard: LayoutDashboard,
  settings: Settings,
  profile: User,
};

export default function Step3_Layouts() {
  const {
    layouts,
    setLayout,
    designLanguage,
    isLayoutsFinalized,
    finalizeLayouts,
    goToNextStep,
    goToPreviousStep,
    error,
  } = useDesignStudioStore();

  const [activePageType, setActivePageType] = useState('landing');

  const pageTypes = Object.keys(LAYOUT_TEMPLATES);
  const currentLayouts = LAYOUT_TEMPLATES[activePageType] || [];
  const selectedLayoutId = layouts[activePageType];
  const selectedLayout = currentLayouts.find(l => l.id === selectedLayoutId);

  const handleLayoutSelect = (layoutId) => {
    setLayout(activePageType, layoutId);
  };

  const handleFinalize = () => {
    finalizeLayouts();
    if (!error) {
      goToNextStep();
    }
  };

  // Count selected layouts
  const selectedCount = Object.values(layouts).filter(Boolean).length;

  return (
    <div className="flex h-full">
      {/* Page Type Sidebar */}
      <div className="w-56 border-r border-zinc-800/50 bg-zinc-900/30 flex flex-col">
        <div className="p-4 border-b border-zinc-800/50">
          <h3 className="text-sm font-semibold text-white">Page Types</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Select a layout for each page
          </p>
        </div>

        <div className="flex-1 p-2 space-y-1">
          {pageTypes.map((pageType) => {
            const Icon = PAGE_TYPE_ICONS[pageType];
            const info = PAGE_TYPE_INFO[pageType];
            const isActive = activePageType === pageType;
            const hasLayout = layouts[pageType] !== null;

            return (
              <button
                key={pageType}
                onClick={() => setActivePageType(pageType)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${isActive
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'hover:bg-zinc-800/50'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${hasLayout
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isActive
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-zinc-800/50 text-zinc-500'
                  }
                `}>
                  {hasLayout ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-sm font-medium
                    ${isActive ? 'text-white' : 'text-zinc-300'}
                  `}>
                    {info?.name || pageType}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {hasLayout ? 'Layout selected' : 'Not selected'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection Summary */}
        <div className="p-4 border-t border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-2">
            {selectedCount} of {pageTypes.length} pages configured
          </div>
          <div className="flex gap-1">
            {pageTypes.map((pt) => (
              <div
                key={pt}
                className={`
                  h-1 flex-1 rounded-full
                  ${layouts[pt] ? 'bg-emerald-500' : 'bg-zinc-700'}
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Layout Gallery */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50">
          <h2 className="text-xl font-bold text-white mb-1">
            {PAGE_TYPE_INFO[activePageType]?.name || activePageType} Layouts
          </h2>
          <p className="text-sm text-zinc-500">
            {PAGE_TYPE_INFO[activePageType]?.description || 'Choose a structural layout'}
          </p>
        </div>

        {/* Layouts Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {currentLayouts.map((layout) => {
              const isSelected = selectedLayoutId === layout.id;

              return (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout.id)}
                  className={`
                    relative p-4 rounded-xl border text-left transition-all duration-200
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/30'
                    }
                  `}
                >
                  {/* Wireframe Preview */}
                  <div
                    className="font-mono text-[8px] leading-tight p-3 rounded-lg mb-3 overflow-hidden"
                    style={{
                      backgroundColor: designLanguage.colors.background,
                      color: designLanguage.colors.textMuted,
                      border: `1px solid ${designLanguage.colors.border}`,
                    }}
                  >
                    <pre className="whitespace-pre overflow-hidden">
                      {layout.wireframe || `┌─────────────────┐
│                 │
│   ${layout.name.slice(0, 12).padEnd(12)}   │
│                 │
└─────────────────┘`}
                    </pre>
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-white mb-1">{layout.name}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">{layout.description}</p>

                  {/* Sections */}
                  {layout.sections && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {layout.sections.slice(0, 4).map((section) => (
                        <span
                          key={section}
                          className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded"
                        >
                          {section}
                        </span>
                      ))}
                      {layout.sections.length > 4 && (
                        <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-500 rounded">
                          +{layout.sections.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* No Layout Option */}
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <button
              onClick={() => handleLayoutSelect(null)}
              className={`
                w-full p-4 rounded-xl border text-left transition-colors
                ${selectedLayoutId === null
                  ? 'border-zinc-600 bg-zinc-800/50'
                  : 'border-zinc-800 hover:border-zinc-700'
                }
              `}
            >
              <span className="text-sm text-zinc-400">
                Skip this page type (no layout)
              </span>
            </button>
          </div>
        </div>

        {/* Selected Layout Preview */}
        {selectedLayout && (
          <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-sm font-medium text-white">
                  {selectedLayout.name}
                </span>
                <span className="text-sm text-zinc-500 ml-2">
                  selected for {PAGE_TYPE_INFO[activePageType]?.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Design Language
          </button>

          <button
            onClick={handleFinalize}
            disabled={selectedCount === 0}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
              ${selectedCount > 0
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
          >
            Continue to Generate
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

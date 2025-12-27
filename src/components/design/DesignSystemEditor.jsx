import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Palette, Loader2, Sparkles } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';
import DesignChatPanel from './DesignChatPanel';
import ColorTokenEditor from './ColorTokenEditor';
import TypographyEditor from './TypographyEditor';
import LivePreview from './LivePreview';

export default function DesignSystemEditor() {
  const {
    designVariations,
    toggleBriefEditor,
    setEditedDesignBrief,
    resetEditedBrief,
    getActiveDesignBrief,
  } = useAppStore();

  const { isEditingBrief, editedDesignBrief, designBrief } = designVariations;
  const activeDesignBrief = getActiveDesignBrief();

  // Local state for edited design tokens (before saving)
  const [localTokens, setLocalTokens] = useState(activeDesignBrief?.designTokens || null);
  const [hasChanges, setHasChanges] = useState(false);

  // Active tab for left panel
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'edit'

  // Update local tokens when design brief changes
  useEffect(() => {
    if (activeDesignBrief?.designTokens) {
      setLocalTokens(activeDesignBrief.designTokens);
    }
  }, [activeDesignBrief]);

  // Track if there are unsaved changes
  useEffect(() => {
    if (localTokens && activeDesignBrief?.designTokens) {
      const changed = JSON.stringify(localTokens) !== JSON.stringify(activeDesignBrief.designTokens);
      setHasChanges(changed);
    }
  }, [localTokens, activeDesignBrief]);

  const handleColorChange = (colorKey, newValue) => {
    setLocalTokens((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: {
          ...prev.colors[colorKey],
          value: newValue,
        },
      },
    }));
  };

  const handleTypographyChange = (key, newValue) => {
    setLocalTokens((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: newValue,
      },
    }));
  };

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleApplyChanges = () => {
    // Save edited tokens to Zustand store
    const updatedBrief = {
      ...activeDesignBrief,
      designTokens: localTokens,
    };
    setEditedDesignBrief(updatedBrief);
    setHasChanges(false);
  };

  const handleRegenerateDesignBrief = async () => {
    if (!window.confirm('Regenerate the full design brief to match your edited tokens? This will update visual identity, component patterns, and other sections.')) {
      return;
    }

    setIsRegenerating(true);
    try {
      // Apply current changes first
      const updatedBrief = {
        ...activeDesignBrief,
        designTokens: localTokens,
      };

      // Call AI to regenerate design brief based on edited tokens
      // Pass both the edited version and original to detect changes
      const result = await aiService.regenerateDesignBrief(updatedBrief, designBrief);

      if (result.success && result.designBrief) {
        setEditedDesignBrief(result.designBrief);
        setLocalTokens(result.designBrief.designTokens);
        setHasChanges(false);
        alert('Design brief regenerated successfully! All sections now match your edited tokens.');
      } else {
        throw new Error('Failed to regenerate design brief');
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      alert('Failed to regenerate design brief: ' + error.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all changes to AI-generated defaults?')) {
      resetEditedBrief();
      setLocalTokens(designBrief?.designTokens || null);
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Close anyway?')) {
        toggleBriefEditor();
      }
    } else {
      toggleBriefEditor();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges]);

  if (!isEditingBrief || !activeDesignBrief) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Palette className="w-5 h-5 text-indigo-400" />
              Refine Your Design System
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Chat with AI or manually edit design tokens
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Close (ESC)"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content - 2-Column Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Chat + Editors (60%) */}
          <div className="w-3/5 border-r border-zinc-800 flex flex-col">
            {/* Tabs */}
            <div className="border-b border-zinc-800 flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                💬 Chat with AI
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === 'edit'
                    ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                🎨 Manual Edit
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'chat' && <DesignChatPanel />}
              {activeTab === 'edit' && (
                <div className="p-6 space-y-8">
                  <ColorTokenEditor
                    colors={localTokens?.colors || {}}
                    onColorChange={handleColorChange}
                  />
                  <TypographyEditor
                    typography={localTokens?.typography || {}}
                    onTypographyChange={handleTypographyChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Preview (40%) */}
          <div className="w-2/5 flex flex-col bg-zinc-950/50">
            <div className="px-6 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-300">👁️ Live Preview</h3>
              <p className="text-xs text-zinc-500 mt-0.5">See your changes in real-time</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <LivePreview
                tokens={localTokens}
                originalTokens={designBrief?.designTokens}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-yellow-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleRegenerateDesignBrief}
              disabled={isRegenerating || (!hasChanges && !editedDesignBrief)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              title="Regenerate full design brief to match edited tokens"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Regenerate Brief
                </>
              )}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetToDefaults}
              disabled={!editedDesignBrief}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleApplyChanges}
              disabled={!hasChanges}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

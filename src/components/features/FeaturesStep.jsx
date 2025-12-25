import { useState, useEffect } from 'react';
import {
  LayoutList,
  ArrowRight,
  ArrowLeft,
  Plus,
  Loader2,
  RefreshCw,
  Check,
  X,
  Edit3,
  MessageSquare,
  Sparkles,
  GripVertical,
  Star,
  AlertCircle,
  User,
  CheckCircle2,
  AlertTriangle,
  Link,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { aiService } from '../../services/aiService';
import ChatRefinement from './ChatRefinement';

const priorityColors = {
  mvp: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const complexityColors = {
  small: 'text-emerald-400',
  medium: 'text-amber-400',
  large: 'text-red-400',
};

export default function FeaturesStep() {
  const {
    research,
    insights,
    features,
    setFeatures,
    updateFeature,
    addFeature,
    removeFeature,
    setFeaturesGenerating,
    setCurrentStep,
    canProceedToPRD,
  } = useAppStore();

  const [showChat, setShowChat] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const generateFeatures = async () => {
    setFeaturesGenerating(true);
    setError(null);

    try {
      const result = await aiService.generateFeatures(research.content, insights);
      if (result.success) {
        setFeatures(result.features.map((f, i) => ({
          id: crypto.randomUUID(),
          name: f.name,
          description: f.description,
          userStory: f.userStory || '',
          acceptanceCriteria: f.acceptanceCriteria || [],
          edgeCases: f.edgeCases || [],
          dependencies: f.dependencies || [],
          priority: f.priority || 'medium',
          status: 'pending', // 'pending' | 'accepted' | 'rejected'
          reasoning: f.reasoning,
          estimatedComplexity: f.estimatedComplexity || 'medium',
        })));
      } else {
        setError(result.error || 'Failed to generate features');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  // Auto-generate features on first visit
  useEffect(() => {
    if (features.items.length === 0 && !features.isGenerating && insights.isAnalyzed) {
      generateFeatures();
    }
  }, []);

  const handleAccept = (id) => {
    updateFeature(id, { status: 'accepted' });
  };

  const handleReject = (id) => {
    updateFeature(id, { status: 'rejected' });
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditValue(name);
  };

  const handleSaveEdit = (id) => {
    updateFeature(id, { name: editValue });
    setEditingId(null);
  };

  const handleAddFeature = () => {
    addFeature({
      name: 'New Feature',
      description: 'Describe this feature...',
      priority: 'medium',
      status: 'pending',
      reasoning: 'Manually added',
    });
  };

  const handleBack = () => {
    setCurrentStep('analysis');
  };

  const handleProceed = () => {
    if (canProceedToPRD()) {
      setCurrentStep('prd');
    }
  };

  const acceptedCount = features.items.filter((f) => f.status === 'accepted').length;
  const pendingCount = features.items.filter((f) => f.status === 'pending').length;
  const canProceed = canProceedToPRD();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-2">
            <LayoutList className="w-4 h-4 text-indigo-400" />
            Step 3 of 5
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
            Review Features
          </h1>
          <p className="text-zinc-500 text-[15px]">
            Accept, reject, or modify AI-suggested features. Chat to refine with AI assistance.
          </p>
        </div>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                     transition-colors ${
                       showChat
                         ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                         : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                     }`}
        >
          <MessageSquare className="w-4 h-4" />
          {showChat ? 'Hide Chat' : 'Chat Refinement'}
        </button>
      </div>

      <div className={`grid gap-6 ${showChat ? 'grid-cols-[1fr,400px]' : 'grid-cols-1'}`}>
        {/* Features list */}
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-zinc-500">
              {features.items.length} features
            </span>
            <span className="text-emerald-400">
              {acceptedCount} accepted
            </span>
            {pendingCount > 0 && (
              <span className="text-amber-400">
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Loading state */}
          {features.isGenerating && (
            <div className="card p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-zinc-400">Generating features from your insights...</p>
            </div>
          )}

          {/* Error state */}
          {error && !features.isGenerating && (
            <div className="card p-6 border-red-500/20 bg-red-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium">Generation Failed</p>
                  <p className="text-zinc-500 text-sm mt-1">{error}</p>
                  <button
                    onClick={generateFeatures}
                    className="mt-3 flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Features list */}
          {!features.isGenerating && features.items.length > 0 && (
            <div className="space-y-3">
              {features.items.map((feature) => {
                const isExpanded = expandedIds.has(feature.id);
                const hasDetails = feature.userStory ||
                  (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) ||
                  (feature.edgeCases && feature.edgeCases.length > 0) ||
                  (feature.dependencies && feature.dependencies.length > 0);

                return (
                  <div
                    key={feature.id}
                    className={`card p-4 transition-all duration-200 ${
                      feature.status === 'rejected'
                        ? 'opacity-50'
                        : feature.status === 'accepted'
                          ? 'border-emerald-500/30'
                          : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 cursor-grab text-zinc-600 hover:text-zinc-400">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {editingId === feature.id ? (
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveEdit(feature.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(feature.id)}
                              autoFocus
                              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[14px] text-zinc-200 focus:outline-none focus:border-indigo-500"
                            />
                          ) : (
                            <h3 className="text-[14px] font-medium text-zinc-200">
                              {feature.name}
                            </h3>
                          )}

                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityColors[feature.priority]}`}>
                            {feature.priority.toUpperCase()}
                          </span>

                          {feature.estimatedComplexity && (
                            <span className={`text-[10px] flex items-center gap-1 ${complexityColors[feature.estimatedComplexity] || 'text-zinc-500'}`}>
                              <Clock className="w-3 h-3" />
                              {feature.estimatedComplexity}
                            </span>
                          )}

                          {feature.status === 'accepted' && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>

                        <p className="text-[13px] text-zinc-500 mb-2">
                          {feature.description}
                        </p>

                        {feature.reasoning && (
                          <div className="flex items-start gap-1.5 text-[11px] text-zinc-600 mb-2">
                            <Sparkles className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span>{feature.reasoning}</span>
                          </div>
                        )}

                        {/* Expand/Collapse toggle */}
                        {hasDetails && (
                          <button
                            onClick={() => toggleExpand(feature.id)}
                            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </button>
                        )}

                        {/* Expanded details */}
                        {isExpanded && hasDetails && (
                          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3">
                            {/* User Story */}
                            {feature.userStory && (
                              <div className="bg-zinc-800/30 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 text-[11px] text-violet-400 font-medium mb-1.5">
                                  <User className="w-3 h-3" />
                                  User Story
                                </div>
                                <p className="text-[12px] text-zinc-400 italic">
                                  "{feature.userStory}"
                                </p>
                              </div>
                            )}

                            {/* Acceptance Criteria */}
                            {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
                              <div>
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mb-1.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Acceptance Criteria
                                </div>
                                <ul className="space-y-1">
                                  {feature.acceptanceCriteria.map((criterion, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400">
                                      <span className="text-emerald-500 mt-0.5">•</span>
                                      {criterion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Edge Cases */}
                            {feature.edgeCases && feature.edgeCases.length > 0 && (
                              <div>
                                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium mb-1.5">
                                  <AlertTriangle className="w-3 h-3" />
                                  Edge Cases
                                </div>
                                <ul className="space-y-1">
                                  {feature.edgeCases.map((edgeCase, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400">
                                      <span className="text-amber-500 mt-0.5">•</span>
                                      {edgeCase}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Dependencies */}
                            {feature.dependencies && feature.dependencies.length > 0 && (
                              <div>
                                <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-medium mb-1.5">
                                  <Link className="w-3 h-3" />
                                  Dependencies
                                </div>
                                <ul className="space-y-1">
                                  {feature.dependencies.map((dep, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400">
                                      <span className="text-sky-500 mt-0.5">→</span>
                                      {dep}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(feature.id, feature.name)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {feature.status !== 'accepted' && (
                          <button
                            onClick={() => handleAccept(feature.id)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleReject(feature.id)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title={feature.status === 'rejected' ? 'Remove' : 'Reject'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add feature button */}
              <button
                onClick={handleAddFeature}
                className="w-full p-4 card border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300
                         hover:border-zinc-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add custom feature
              </button>

              {/* Regenerate */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={generateFeatures}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] text-zinc-400
                           hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate all features
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        {showChat && <ChatRefinement />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                   text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </button>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium
            transition-all duration-200
            ${canProceed
              ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          Generate PRD
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

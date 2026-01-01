import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Lightbulb,
  Layers,
  ScrollText,
  Check,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import useAppStore from '../../../stores/useAppStore';

// ============================================================================
// STEP 1: IMPORT CONTEXT (REQUIRED)
// ============================================================================
//
// PRD context is the FOUNDATION for all design decisions.
// User MUST import context from main flow before proceeding.
//
// This ensures:
// - AI has product vision to inform design language
// - Features inform layout choices
// - Design is aligned with product goals
//
// ============================================================================

export default function Step1_ImportContext({ onNext }) {
  const { importedContext, importContext, goToNextStep } = useDesignStudioStore();

  // Get data from main app store
  const research = useAppStore((state) => state.research);
  const insights = useAppStore((state) => state.insights);
  const features = useAppStore((state) => state.features);
  const prd = useAppStore((state) => state.prd);
  const getAcceptedFeatures = useAppStore((state) => state.getAcceptedFeatures);

  const acceptedFeatures = getAcceptedFeatures();

  // Check what's available
  const hasResearch = !!research?.content;
  const hasInsights = insights?.isAnalyzed;
  const hasFeatures = acceptedFeatures.length > 0;
  const hasPRD = !!prd?.content;

  const hasAnyData = hasResearch || hasFeatures || hasPRD;

  // Calculate import quality
  const dataPoints = [hasResearch, hasInsights, hasFeatures, hasPRD];
  const availableCount = dataPoints.filter(Boolean).length;
  const qualityPercentage = Math.round((availableCount / 4) * 100);

  const handleImport = () => {
    importContext({
      research: research?.content || null,
      insights: hasInsights ? insights : null,
      features: acceptedFeatures,
      prd: prd?.content || null,
    });
  };

  const handleContinue = () => {
    if (onNext) {
      onNext();
    } else {
      goToNextStep();
    }
  };

  const handleReimport = () => {
    importContext({
      research: research?.content || null,
      insights: hasInsights ? insights : null,
      features: acceptedFeatures,
      prd: prd?.content || null,
    });
  };

  // Already imported - show summary and continue
  if (importedContext) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Context Imported
          </h1>
          <p className="text-zinc-400">
            Your PRD and product data are ready. The AI will use this to inform your design.
          </p>
        </div>

        {/* Imported Data Summary */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <DataItem
              icon={FileText}
              label="Research"
              value={importedContext.research ? `${importedContext.research.length.toLocaleString()} chars` : 'Not included'}
              available={!!importedContext.research}
            />
            <DataItem
              icon={Lightbulb}
              label="Insights"
              value={importedContext.insights ? 'Analyzed' : 'Not included'}
              available={!!importedContext.insights}
            />
            <DataItem
              icon={Layers}
              label="Features"
              value={`${importedContext.features?.length || 0} accepted`}
              available={importedContext.features?.length > 0}
            />
            <DataItem
              icon={ScrollText}
              label="PRD"
              value={importedContext.prd ? 'Generated' : 'Not included'}
              available={!!importedContext.prd}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Imported {new Date(importedContext.importedAt).toLocaleString()}
            </span>
            <button
              onClick={handleReimport}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Re-import latest
            </button>
          </div>
        </div>

        {/* How it's used */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-medium text-indigo-400 mb-2">How this will be used:</h3>
          <ul className="text-sm text-indigo-300/80 space-y-1">
            <li>• AI will analyze your product vision to suggest design tokens</li>
            <li>• Features inform what components and layouts you'll need</li>
            <li>• Target audience shapes color psychology and typography choices</li>
          </ul>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
          >
            Continue to Design Intent
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // No data available in main flow
  if (!hasAnyData) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            No PRD Context Available
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Design Studio needs your product context to create designs that align with your vision.
            Complete the main IdeaForge flow first.
          </p>
        </div>

        {/* What's needed */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-white mb-4">What you'll need:</h3>
          <div className="space-y-3">
            <RequirementItem
              icon={FileText}
              label="Research"
              description="Your product research dossier"
              required
            />
            <RequirementItem
              icon={Layers}
              label="Features"
              description="Accepted feature list"
              required
            />
            <RequirementItem
              icon={ScrollText}
              label="PRD"
              description="Generated PRD document"
              recommended
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
          >
            Go to Main Flow
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Has data - show import UI
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Import Your Product Context
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Your PRD and product data will guide the AI to create designs that match your vision,
          audience, and goals.
        </p>
      </div>

      {/* Available Data */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Available Data</h3>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${qualityPercentage}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500">{availableCount}/4</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DataItem
            icon={FileText}
            label="Research"
            value={hasResearch ? `${research.content.length.toLocaleString()} chars` : 'Not available'}
            available={hasResearch}
          />
          <DataItem
            icon={Lightbulb}
            label="Insights"
            value={hasInsights ? 'Analyzed' : 'Not analyzed'}
            available={hasInsights}
          />
          <DataItem
            icon={Layers}
            label="Features"
            value={hasFeatures ? `${acceptedFeatures.length} accepted` : 'None accepted'}
            available={hasFeatures}
          />
          <DataItem
            icon={ScrollText}
            label="PRD"
            value={hasPRD ? 'Generated' : 'Not generated'}
            available={hasPRD}
          />
        </div>
      </div>

      {/* Quality indicator */}
      {qualityPercentage < 75 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">
                More context = better designs
              </p>
              <p className="text-xs text-amber-400/70 mt-1">
                For best results, complete the PRD step in the main flow.
                The AI uses your product goals, audience, and features to inform design decisions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What will happen */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-8">
        <h3 className="text-sm font-medium text-indigo-400 mb-2">What happens next:</h3>
        <ul className="text-sm text-indigo-300/80 space-y-1">
          <li>• AI will extract design intent (archetype, audience, tone) from your PRD</li>
          <li>• Select a template that matches your design intent</li>
          <li>• Edit and refine the AI-generated content before exporting</li>
        </ul>
      </div>

      {/* Import Button */}
      <div className="flex justify-center">
        <button
          onClick={handleImport}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
        >
          Import Context & Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Data Item Component
function DataItem({ icon: Icon, label, value, available }) {
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg
      ${available ? 'bg-emerald-500/10' : 'bg-zinc-800/50'}
    `}>
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        ${available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}
      `}>
        {available ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>
      <div>
        <div className={`text-sm font-medium ${available ? 'text-white' : 'text-zinc-400'}`}>
          {label}
        </div>
        <div className="text-xs text-zinc-500">{value}</div>
      </div>
    </div>
  );
}

// Requirement Item Component
function RequirementItem({ icon: Icon, label, description, required, recommended }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-700/50">
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-zinc-500">{description}</div>
      </div>
      {required && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded">
          Required
        </span>
      )}
      {recommended && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-400 rounded">
          Recommended
        </span>
      )}
    </div>
  );
}

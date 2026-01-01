import { useEffect } from 'react';
import useDesignStudioStore from '../../../stores/useDesignStudioStore';
import WorkflowHeader from './WorkflowHeader';
import Step1_ImportContext from './Step1_ImportContext';
import Step2_DesignIntent from './Step2_DesignIntent';
import Step3_TemplateSelection from './Step3_TemplateSelection';
import Step4_ContentEditing from './Step4_ContentEditing';
import Step5_Export from './Step5_Export';

// ============================================================================
// DESIGN STUDIO WORKFLOW V3.0 (Intent-Driven Architecture)
// ============================================================================
//
// Main container for the 5-step design workflow:
//   1. CONTEXT    - Import PRD context (REQUIRED)
//   2. INTENT     - AI extracts design intent from PRD (archetype, audience, tone)
//   3. TEMPLATE   - Select and match templates based on intent
//   4. CONTENT    - Edit and refine generated content
//   5. EXPORT     - Export final design assets
//
// Key principle: PRD is ALWAYS the foundation. Design intent guides template selection.
//
// ============================================================================

export default function DesignStudioWorkflow() {
  const {
    currentStep,
    error,
    clearError,
  } = useDesignStudioStore();

  // Clear error when step changes
  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  // Navigation handlers for step components
  const handleGoToStep = (step) => {
    const { setCurrentStep, canProceedToStep } = useDesignStudioStore.getState();
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'context':
        return <Step1_ImportContext onNext={() => handleGoToStep('intent')} />;
      case 'intent':
        return (
          <Step2_DesignIntent
            onNext={() => handleGoToStep('template')}
            onBack={() => handleGoToStep('context')}
          />
        );
      case 'template':
        return (
          <Step3_TemplateSelection
            onNext={() => handleGoToStep('content')}
            onBack={() => handleGoToStep('intent')}
          />
        );
      case 'content':
        return (
          <Step4_ContentEditing
            onNext={() => handleGoToStep('export')}
            onBack={() => handleGoToStep('template')}
          />
        );
      case 'export':
        return (
          <Step5_Export
            onBack={() => handleGoToStep('content')}
          />
        );
      default:
        return <Step1_ImportContext onNext={() => handleGoToStep('intent')} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Workflow Header with Step Indicator */}
      <WorkflowHeader />

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  );
}

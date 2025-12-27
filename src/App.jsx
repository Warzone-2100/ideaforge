import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainFlow from './components/MainFlow';

// Lazy load Design Studio for better initial load performance
const DesignStudioPage = lazy(() => import('./pages/DesignStudioPage'));

/**
 * Loading fallback for lazy-loaded routes
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading Design Studio...</p>
      </div>
    </div>
  );
}

/**
 * App - Root component with routing
 *
 * Routes:
 * - / : Main flow (Research → Analysis → Features → PRD → Prompts → Stories → Export)
 * - /design-studio : Standalone Design Studio
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainFlow />} />
      <Route
        path="/design-studio"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <DesignStudioPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

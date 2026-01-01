import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import useAuthStore from './stores/useAuthStore'

/**
 * AuthInitializer - Initializes auth state on app load
 * Listens for auth state changes from Firebase
 */
function AuthInitializer({ children }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </BrowserRouter>
  </StrictMode>,
)

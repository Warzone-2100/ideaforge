import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// This component handles OAuth redirects if using redirect-based auth
// With Firebase popup auth, this is mainly for compatibility
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Firebase handles auth state via onAuthStateChanged in useAuthStore
    // This just redirects back to home after any redirect-based auth
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-zinc-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}

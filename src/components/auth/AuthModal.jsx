import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Loader2, AlertCircle, Check } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, error: authError, clearError } = useAuthStore();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setFullName('');
      setLocalError(null);
      setSuccessMessage(null);
      clearError();
    }
  }, [isOpen, mode, clearError]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setLocalError(error.message);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const { data, error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setLocalError(error.message);
        } else if (data?.user && !data?.session) {
          // Email confirmation required
          setSuccessMessage('Check your email to confirm your account!');
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setLocalError(error.message);
        } else {
          setSuccessMessage('Password reset email sent!');
        }
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setLocalError(error.message);
    }
    // Redirect happens automatically
  };

  if (!isOpen) return null;

  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{displayError}</p>
            </div>
          )}

          {/* Google Sign In */}
          {mode !== 'forgot' && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-zinc-900 text-zinc-500">or</span>
                </div>
              </div>
            </>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' && 'Signing in...'}
                  {mode === 'signup' && 'Creating account...'}
                  {mode === 'forgot' && 'Sending email...'}
                </>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
                >
                  Forgot password?
                </button>
                <p className="text-sm text-zinc-500">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-zinc-500">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

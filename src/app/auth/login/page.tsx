'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signInWithGoogle } from '@/lib/authHelpers';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const result = await signUp({ email, password, name });
        if (result.success) {
          setSuccess(result.message || 'Account created! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
          setName('');
        } else {
          setError(result.error || 'Sign up failed');
        }
      } else {
        const result = await signIn({ email, password });
        if (result.success) {
          router.push('/');
          router.refresh();
        } else {
          setError(result.error || 'Sign in failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google sign in failed');
        setLoading(false);
      }
      // If successful, user will be redirected to Google's OAuth page
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            BitTaxly
          </h1>
          <p className="text-lg" style={{ color: 'var(--on-surface-variant)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl border-2" style={{
            backgroundColor: 'rgba(217, 48, 37, 0.1)',
            borderColor: 'var(--error)',
            color: 'var(--error)',
          }}>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl border-2" style={{
            backgroundColor: 'rgba(30, 142, 62, 0.1)',
            borderColor: 'var(--success)',
            color: 'var(--success)',
          }}>
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 font-semibold transition-all duration-200 mb-6 hover:shadow-lg"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--on-surface)',
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Please wait...' : `Continue with Google`}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4" style={{ backgroundColor: 'var(--surface)', color: 'var(--on-surface-variant)' }}>
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'signup'}
                className="input-field w-full"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field w-full"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field w-full"
              placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
              minLength={12}
              disabled={loading}
            />
            {mode === 'signup' && (
              <p className="text-xs mt-2" style={{ color: 'var(--on-surface-variant)' }}>
                Minimum 12 characters with uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                Please wait...
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setSuccess('');
            }}
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
            disabled={loading}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {mode === 'login' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/auth/reset-password')}
              className="text-sm hover:underline"
              style={{ color: 'var(--on-surface-variant)' }}
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs" style={{ color: 'var(--on-surface-variant)' }}>
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline" style={{ color: 'var(--primary)' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="underline" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { startAuthentication } from '@simplewebauthn/browser';
import { authApi, profileApi, passkeyApi } from '../services';
import { useAuthStore } from '../stores/authStore';
import LayoutWrapper from '../layouts/LayoutWrapper';
import { Loader2, Fingerprint } from 'lucide-react';
import type { LoginDto } from '../types';
import { logger } from '../utils/logger';

export default function Login() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: async () => {
      handleLoginSuccess();
    },
  });

  const handleLoginSuccess = () => {
    setAuthenticated();
    profileApi
      .getMyProfile()
      .then((profileResponse) => {
        setProfile(profileResponse.data);
        navigate('/');
      })
      .catch((err: unknown) => {
        logger.error('Failed to fetch profile:', err);
        navigate('/'); // Go anyway
      });
  };

  const handlePasskeyLogin = async () => {
    if (!identifier) {
      setError('Please enter your email or username first.');
      return;
    }

    setPasskeyLoading(true);
    setError(null);

    try {
      // 1. Get options from server
      const optionsResponse = await passkeyApi.getLoginOptions(identifier);
      const options = optionsResponse.data;

      // 2. Start authentication in browser
      const authenticationResponse = await startAuthentication(options);

      // 3. Verify on server
      const verificationResponse = await passkeyApi.verifyLogin(
        identifier,
        authenticationResponse as unknown as Record<string, unknown>,
      );

      if (verificationResponse.data.verified) {
        handleLoginSuccess();
      } else {
        setError('Authentication failed');
      }
    } catch (err: unknown) {
      logger.error('Passkey authentication error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ identifier, password });
  };

  return (
    <LayoutWrapper showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl w-full max-w-md backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>

          <h1 className="text-4xl font-black text-center mb-2 tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
            CircleSfera
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Welcome back, creator.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email or username
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition text-white placeholder-gray-500 backdrop-blur-sm"
                placeholder="you@example.com or username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition text-white placeholder-gray-500 backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                title="Forgot password"
                className="text-sm text-purple-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {loginMutation.isError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {(
                  loginMutation.error as {
                    response?: { data?: { message?: string } };
                  }
                )?.response?.data?.message ||
                  'Invalid email, username or password'}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                data-testid="login-submit-button"
                disabled={loginMutation.isPending || passkeyLoading}
                className="w-full bg-white text-black py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  or
                </span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={loginMutation.isPending || passkeyLoading}
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm group"
              >
                {passkeyLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Sign in with Passkey</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link
              to="/accounts/emailsignup"
              className="text-white hover:text-purple-400 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </LayoutWrapper>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, profileApi } from '../services';
import { useAuthStore } from '../stores/authStore';
import LayoutWrapper from '../layouts/LayoutWrapper';
import { logger } from '../utils/logger';

export default function Register() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({ email, password, username, fullName }),
    onSuccess: async () => {
      setAuthenticated();
      // Fetch and store user profile after registration
      try {
        const profileResponse = await profileApi.getMyProfile();
        setProfile(profileResponse.data);
      } catch (error) {
        logger.error('Failed to fetch profile:', error);
      }
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <LayoutWrapper showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl w-full max-w-md backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
           <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>

          <h1 className="text-4xl font-black text-center mb-2 tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
            CircleSfera
          </h1>
          <p className="text-gray-400 text-center mb-8">Join the inner circle.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition text-white placeholder-gray-500 backdrop-blur-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition text-white placeholder-gray-500 backdrop-blur-sm"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition text-white placeholder-gray-500 backdrop-blur-sm"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition text-white placeholder-gray-500 backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>

            {registerMutation.isError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {(registerMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-white text-black py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 mt-2"
            >
              {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/accounts/login" className="text-white hover:text-purple-400 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </LayoutWrapper>
  );
}

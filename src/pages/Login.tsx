import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGuestItinerary } from '../contexts/GuestItineraryContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const { migrateGuestItinerariesToUser } = useGuestItinerary();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      setTimeout(async () => {
        if (user) {
          try {
            await migrateGuestItinerariesToUser(user.id);
          } catch (err) {
            console.error('Failed to migrate guest itineraries:', err);
          }
        }

        if (from === 'personalized') {
          navigate('/discovery');
        } else {
          navigate('/');
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-luxury-charcoal via-luxury-teal/20 to-luxury-orange/20">
      <div className="w-full max-w-md">
        <div className="card-luxury p-8 md:p-10 animate-scale-in">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/Fitinerary Logo 2.jpg"
              alt="Fitinerary"
              className="w-40 h-auto"
            />
          </div>

          <h2 className="text-3xl font-light text-center mb-2" style={{ letterSpacing: '-0.02em' }}>
            Welcome back
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to continue planning your adventures
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/forgot-password"
              className="block text-sm text-luxury-teal hover:text-luxury-orange transition-colors duration-300"
            >
              Forgot password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-luxury-teal hover:text-luxury-orange font-medium transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

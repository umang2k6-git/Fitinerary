import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
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
            Reset Password
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Enter your email and we'll send you a link to reset your password
          </p>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm">
                Check your email! We've sent you a password reset link.
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-luxury-teal hover:text-luxury-orange transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-luxury-teal hover:text-luxury-orange transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

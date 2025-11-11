import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      alert('Password updated successfully! You can now sign in with your new password.');
      navigate('/login');
    }
  };

  if (!validSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-luxury-charcoal via-luxury-teal/20 to-luxury-orange/20">
        <div className="w-full max-w-md">
          <div className="card-luxury p-8 md:p-10">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
              {error}
            </div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn-primary w-full"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Set New Password
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all duration-300"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all duration-300"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

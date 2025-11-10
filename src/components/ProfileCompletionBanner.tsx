import { useState, useEffect } from 'react';
import { X, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileDiscoveryForm from './ProfileDiscoveryForm';

export default function ProfileCompletionBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileCompletion();
  }, [user]);

  const checkProfileCompletion = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile:', error);
        setShowBanner(true);
      } else if (!data || !data.profile_completed) {
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  const handleComplete = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    checkProfileCompletion();
  };

  if (loading || !showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-luxury-teal to-teal-600 text-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-white/20 rounded-full">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Complete Your Profile for Better Suggestions</h3>
              <p className="text-white/90 mb-4">
                Tell us about your travel preferences to get personalized itinerary recommendations that match your style.
              </p>
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 bg-white text-luxury-teal font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showForm && <ProfileDiscoveryForm onClose={handleFormClose} />}
    </>
  );
}

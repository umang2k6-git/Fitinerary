import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, DollarSign, TrendingUp, Loader2, ArrowRight, Calendar, Users } from 'lucide-react';

interface Destination {
  name: string;
  country: string;
  state: string;
  description: string;
  estimatedBudget: number;
  bestFor: string[];
  distanceFromStart: string;
  matchScore: number;
}

interface ProfileData {
  start_city: string;
  trip_start_date: string;
  trip_end_date: string;
  travel_purpose: string;
  budget_max: number;
}

export default function PersonalizedDestinations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPersonalizedDestinations();
  }, [user]);

  const fetchPersonalizedDestinations = async () => {
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-personalized-destinations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch destinations');
      }

      const data = await response.json();
      setDestinations(data.destinations);
      setProfile(data.profile);
    } catch (err: any) {
      console.error('Error fetching destinations:', err);
      setError(err.message || 'Failed to load personalized destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDestination = (destination: Destination) => {
    navigate('/generate', {
      state: {
        destination: destination.name,
        tripBrief: destination.description,
        destinationImageUrl: null,
        useProfile: true,
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-luxury-teal animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Finding perfect destinations for you...</p>
          <p className="text-white/60 text-sm mt-2">Analyzing your preferences with AI</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Your Perfect Destinations
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8" style={{ lineHeight: '1.6' }}>
            Based on your preferences, we've curated these destinations just for you
          </p>

          {profile && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4" />
                <span>From {profile.start_city}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(profile.trip_start_date)} - {formatDate(profile.trip_end_date)}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Users className="w-4 h-4" />
                <span>{profile.travel_purpose}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <DollarSign className="w-4 h-4" />
                <span>Up to ₹{profile.budget_max.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              onClick={() => handleSelectDestination(destination)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-luxury-teal transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {destination.state}, {destination.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-luxury-teal/10 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-luxury-teal" />
                    <span className="text-luxury-teal font-semibold text-sm">{destination.matchScore}%</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3" style={{ lineHeight: '1.6' }}>
                  {destination.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-luxury-teal" />
                    <span className="font-semibold">₹{destination.estimatedBudget.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400">estimated</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-luxury-teal" />
                    <span>{destination.distanceFromStart} from {profile?.start_city}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">BEST FOR:</p>
                  <div className="flex flex-wrap gap-2">
                    {destination.bestFor.slice(0, 3).map((activity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full btn-primary flex items-center justify-center gap-2 group-hover:bg-luxury-teal group-hover:scale-105 transition-all"
                >
                  Create Itinerary
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

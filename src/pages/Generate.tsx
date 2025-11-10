import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGuestItinerary } from '../contexts/GuestItineraryContext';
import { supabase } from '../lib/supabase';
import { Sparkles, DollarSign, CheckCircle, RefreshCw } from 'lucide-react';
import SignupPrompt from '../components/SignupPrompt';
import TravelTriviaCard from '../components/TravelTriviaCard';

interface Tier {
  id: string;
  name: string;
  description: string;
  totalCost: number;
  accommodation: string;
  dining: string;
  days: any[];
}

export default function Generate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addGuestItinerary } = useGuestItinerary();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const { destination, tripBrief, destinationImageUrl, useProfile } = location.state || {};

  useEffect(() => {
    if (!destination) {
      navigate('/');
      return;
    }

    generateItinerary();
  }, []);

  const generateItinerary = async () => {
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      let authToken = null;
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token || null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/generate-itinerary`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            destination,
            tripBrief: tripBrief || 'A perfect weekend getaway',
            destinationImageUrl,
            isGuest: !user,
            useProfile: useProfile || false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.error || 'Failed to generate itinerary');
        }

        const data = await response.json();

        if (user) {
          setTiers(data.tiers || []);
        } else {
          const guestTiers = [];
          for (const tier of data.tiers) {
            const guestId = await addGuestItinerary({
              destination,
              destination_hero_image_url: destinationImageUrl,
              tier: tier.name,
              days_json: tier.days,
              total_cost: tier.totalCost,
            });
            guestTiers.push({ ...tier, id: guestId });
          }
          setTiers(guestTiers);
          setShowSignupPrompt(true);
        }
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          console.log('Request timed out after 60 seconds, using demo mode');
          await generateDemoItinerary();
        } else if (fetchError.message.includes('OpenAI API key')) {
          console.log('OpenAI API key not configured, using demo mode');
          await generateDemoItinerary();
        } else {
          throw fetchError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const generateDemoItinerary = async () => {
    const demoTiers = [
      {
        name: 'Budget',
        description: 'Smart spending, big experiences',
        totalCost: 8000,
        accommodation: 'Boutique guesthouses',
        dining: 'Local eateries & street food',
        days: [
          {
            day: 1,
            date: 'Saturday',
            activities: [
              {
                timeOfDay: 'Morning',
                time: '9:00 AM',
                name: 'Heritage Walk',
                venue: 'Old City District',
                location: 'Central Area',
                description: 'Explore historic landmarks and traditional architecture',
                duration: '2 hours',
                cost: 500
              },
              {
                timeOfDay: 'Afternoon',
                time: '1:00 PM',
                name: 'Local Market Experience',
                venue: 'Main Bazaar',
                location: 'Market District',
                description: 'Shop for handicrafts and enjoy street food',
                duration: '3 hours',
                cost: 1000
              },
              {
                timeOfDay: 'Evening',
                time: '7:00 PM',
                name: 'Sunset at Viewpoint',
                venue: 'City Viewpoint',
                location: 'Hill Station',
                description: 'Watch the sunset with panoramic city views',
                duration: '2 hours',
                cost: 300
              }
            ]
          },
          {
            day: 2,
            date: 'Sunday',
            activities: [
              {
                timeOfDay: 'Morning',
                time: '8:00 AM',
                name: 'Nature Trail',
                venue: 'City Park',
                location: 'Green District',
                description: 'Peaceful morning walk through gardens',
                duration: '2 hours',
                cost: 200
              },
              {
                timeOfDay: 'Afternoon',
                time: '12:00 PM',
                name: 'Cultural Museum',
                venue: 'Heritage Museum',
                location: 'Cultural Quarter',
                description: 'Learn about local history and art',
                duration: '2 hours',
                cost: 400
              },
              {
                timeOfDay: 'Evening',
                time: '6:00 PM',
                name: 'Farewell Dinner',
                venue: 'Local Restaurant',
                location: 'Downtown',
                description: 'Traditional cuisine at popular eatery',
                duration: '2 hours',
                cost: 800
              }
            ]
          }
        ]
      },
      {
        name: 'Balanced',
        description: 'Perfect mix of comfort and adventure',
        totalCost: 18000,
        accommodation: 'Mid-range hotels',
        dining: 'Mix of local and upscale restaurants',
        days: [
          {
            day: 1,
            date: 'Saturday',
            activities: [
              {
                timeOfDay: 'Morning',
                time: '9:00 AM',
                name: 'Guided City Tour',
                venue: 'Historic Center',
                location: 'Old Town',
                description: 'Private guide showing major attractions',
                duration: '3 hours',
                cost: 2000
              },
              {
                timeOfDay: 'Afternoon',
                time: '2:00 PM',
                name: 'Art Gallery Visit',
                venue: 'Contemporary Art Museum',
                location: 'Arts District',
                description: 'Curated collection of local and international art',
                duration: '2 hours',
                cost: 800
              },
              {
                timeOfDay: 'Evening',
                time: '7:30 PM',
                name: 'Fine Dining Experience',
                venue: 'Rooftop Restaurant',
                location: 'Downtown',
                description: 'Multi-cuisine dinner with city views',
                duration: '2 hours',
                cost: 3000
              }
            ]
          },
          {
            day: 2,
            date: 'Sunday',
            activities: [
              {
                timeOfDay: 'Morning',
                time: '8:00 AM',
                name: 'Adventure Activity',
                venue: 'Adventure Sports Center',
                location: 'Outskirts',
                description: 'Ziplining or rock climbing experience',
                duration: '3 hours',
                cost: 2500
              },
              {
                timeOfDay: 'Afternoon',
                time: '1:00 PM',
                name: 'Spa & Wellness',
                venue: 'Luxury Spa',
                location: 'Resort Area',
                description: 'Relaxing massage and treatments',
                duration: '2 hours',
                cost: 3000
              },
              {
                timeOfDay: 'Evening',
                time: '6:00 PM',
                name: 'Cultural Show',
                venue: 'Performing Arts Theater',
                location: 'Cultural Hub',
                description: 'Traditional dance and music performance',
                duration: '2 hours',
                cost: 1500
              }
            ]
          }
        ]
      },
      {
        name: 'Luxe',
        description: 'Premium experiences, zero compromise',
        totalCost: 45000,
        accommodation: '5-star hotels & resorts',
        dining: 'Michelin-recommended restaurants',
        days: [
          {
            day: 1,
            date: 'Saturday',
            activities: [
              {
                timeOfDay: 'Morning',
                time: '10:00 AM',
                name: 'Private Helicopter Tour',
                venue: 'Private Helipad',
                location: 'Luxury Resort',
                description: 'Aerial views of the entire region',
                duration: '1 hour',
                cost: 15000
              },
              {
                timeOfDay: 'Afternoon',
                time: '2:00 PM',
                name: 'VIP Shopping Experience',
                venue: 'Designer Boutiques',
                location: 'Premium Mall',
                description: 'Personal shopper and exclusive collections',
                duration: '3 hours',
                cost: 5000
              },
              {
                timeOfDay: 'Evening',
                time: '8:00 PM',
                name: 'Private Chef Dinner',
                venue: 'Villa Terrace',
                location: 'Luxury Villa',
                description: 'Exclusive dining with celebrity chef',
                duration: '3 hours',
                cost: 8000
              }
            ]
          },
          {
            day: 2,
            date: 'Sunday',
            activities: [
              {
                timeOfDay: 'Morning',
                time: '9:00 AM',
                name: 'Yacht Cruise',
                venue: 'Private Marina',
                location: 'Waterfront',
                description: 'Luxury yacht with champagne brunch',
                duration: '3 hours',
                cost: 12000
              },
              {
                timeOfDay: 'Afternoon',
                time: '3:00 PM',
                name: 'Premium Spa Retreat',
                venue: 'Five-Star Spa',
                location: 'Resort',
                description: 'Full body treatments with aromatherapy',
                duration: '3 hours',
                cost: 6000
              },
              {
                timeOfDay: 'Evening',
                time: '7:00 PM',
                name: 'Exclusive Wine Tasting',
                venue: 'Private Wine Cellar',
                location: 'Heritage Property',
                description: 'Rare vintages with sommelier',
                duration: '2 hours',
                cost: 4000
              }
            ]
          }
        ]
      }
    ];

    if (user) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const savedTiers = [];
      for (const tier of demoTiers) {
        const { data, error } = await supabase
          .from('itineraries')
          .insert({
            user_id: currentUser.id,
            destination,
            destination_hero_image_url: destinationImageUrl || null,
            trip_brief: tripBrief,
            tier: tier.name,
            days_json: tier.days,
            total_cost: tier.totalCost,
            duration_days: 2,
          })
          .select()
          .single();

        if (error) throw error;
        savedTiers.push({ ...tier, id: data.id });
      }

      setTiers(savedTiers);
    } else {
      const guestTiers = [];
      for (const tier of demoTiers) {
        const guestId = await addGuestItinerary({
          destination,
          destination_hero_image_url: destinationImageUrl,
          tier: tier.name,
          days_json: tier.days,
          total_cost: tier.totalCost,
        });
        guestTiers.push({ ...tier, id: guestId });
      }
      setTiers(guestTiers);
      setShowSignupPrompt(true);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Budget':
        return { color: 'from-emerald-500 to-emerald-600', icon: DollarSign };
      case 'Balanced':
        return { color: 'from-blue-500 to-blue-600', icon: CheckCircle };
      case 'Luxe':
        return { color: 'from-orange-500 to-orange-600', icon: Sparkles };
      default:
        return { color: 'from-gray-500 to-gray-600', icon: Sparkles };
    }
  };

  const handleTierClick = (tier: Tier) => {
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }
    navigate(`/itinerary/${tier.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center px-6">
        <div className="text-center max-w-4xl w-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-luxury-teal border-t-transparent mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-luxury-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-white text-xl font-light mb-2">Crafting your perfect plans...</p>
          <p className="text-white/60 mb-8">This takes about 30 seconds</p>

          <TravelTriviaCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-red-500/20 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-light text-white mb-4">Oops, something went wrong</h2>
          <p className="text-white/70 mb-8">{error}</p>
          <button onClick={generateItinerary} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Your Plans for {destination}
          </h1>
          <p className="text-xl text-white/70">
            Three ways to experience it
          </p>
          {!user && (
            <p className="text-luxury-teal mt-4">
              Create an account to save these itineraries
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier, index) => {
            const { color, icon: Icon } = getTierIcon(tier.name);

            return (
              <div
                key={tier.id}
                className="card-luxury p-8 group animate-scale-in cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => handleTierClick(tier)}
              >
                {destinationImageUrl && (
                  <div className="relative -mx-8 -mt-8 mb-6 h-48 overflow-hidden rounded-t-3xl">
                    <img
                      src={destinationImageUrl}
                      alt={destination}
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium">{tier.name}</h3>
                </div>

                <p className="text-gray-600 mb-6 text-lg">{tier.description}</p>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="text-xl font-semibold text-luxury-teal">
                      ₹{tier.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Accommodation</p>
                    <p className="text-gray-700">{tier.accommodation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dining</p>
                    <p className="text-gray-700">{tier.dining}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="text-gray-700">2 days</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTierClick(tier);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-medium transition-all duration-300 ease-luxury hover:shadow-glow-teal hover:scale-105 active:scale-98"
                >
                  {user ? 'See the Full Plan' : 'Sign Up to View Full Plan'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Start Fresh
          </button>
        </div>
      </div>

      {showSignupPrompt && !user && (
        <SignupPrompt onClose={() => setShowSignupPrompt(false)} />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Heart, Share2, Sparkles, MapPin, Clock, DollarSign, ChevronLeft } from 'lucide-react';

interface Activity {
  timeOfDay: string;
  time: string;
  name: string;
  venue: string;
  location: string;
  description: string;
  duration: string;
  cost: number;
  images?: string[];
}

interface Day {
  day: number;
  date: string;
  activities: Activity[];
}

interface Itinerary {
  id: string;
  destination: string;
  destination_hero_image_url: string;
  tier: string;
  days_json: Day[];
  total_cost: number;
  duration_days: number;
}

export default function ItineraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchItinerary();
  }, [id, user]);

  const fetchItinerary = async () => {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching itinerary:', error);
    } else {
      setItinerary(data);
      // Load images for all activities
      if (data?.days_json) {
        data.days_json.forEach((day: Day) => {
          day.activities.forEach((activity: Activity) => {
            loadActivityImages(activity, data.destination);
          });
        });
      }
    }
    setLoading(false);
  };

  const generateActivityHash = (activity: Activity, destination: string) => {
    return `${activity.name}-${activity.venue}-${activity.location}-${destination}`.toLowerCase().replace(/\s+/g, '-');
  };

  const loadActivityImages = async (activity: Activity, destination: string) => {
    const activityHash = generateActivityHash(activity, destination);

    // Check if already loading
    if (loadingImages[activityHash]) return;

    setLoadingImages(prev => ({ ...prev, [activityHash]: true }));

    try {
      // First check if images are cached in database
      const { data: cachedImages } = await supabase
        .from('activity_images')
        .select('image_urls')
        .eq('activity_hash', activityHash)
        .maybeSingle();

      if (cachedImages?.image_urls && Array.isArray(cachedImages.image_urls) && cachedImages.image_urls.length > 0) {
        // Use cached images
        updateActivityImages(activityHash, cachedImages.image_urls);
      } else {
        // Generate new images via edge function
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-activity-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              activityName: activity.name,
              venue: activity.venue,
              location: activity.location,
              description: activity.description
            }),
          }
        );

        if (response.ok) {
          const { images } = await response.json();

          if (images && images.length > 0) {
            // Cache images in database
            await supabase
              .from('activity_images')
              .insert({
                activity_hash: activityHash,
                image_urls: images
              });

            updateActivityImages(activityHash, images);
          }
        }
      }
    } catch (error) {
      console.error('Error loading activity images:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [activityHash]: false }));
    }
  };

  const updateActivityImages = (activityHash: string, images: string[]) => {
    setItinerary(prev => {
      if (!prev) return prev;

      const updatedDaysJson = prev.days_json.map((day: Day) => ({
        ...day,
        activities: day.activities.map((activity: Activity) => {
          const hash = generateActivityHash(activity, prev.destination);
          if (hash === activityHash) {
            return { ...activity, images };
          }
          return activity;
        })
      }));

      return { ...prev, days_json: updatedDaysJson };
    });
  };

  const getTimeOfDayColor = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'Morning':
        return 'border-amber-400 bg-amber-50';
      case 'Afternoon':
        return 'border-orange-400 bg-orange-50';
      case 'Evening':
        return 'border-purple-400 bg-purple-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'Morning':
        return '☀️';
      case 'Afternoon':
        return '🌤️';
      case 'Evening':
        return '🌙';
      default:
        return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-luxury-teal border-t-transparent"></div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">Itinerary not found</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-white">
      {itinerary.destination_hero_image_url && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={itinerary.destination_hero_image_url}
            alt={itinerary.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-3 rounded-full glass text-white hover:scale-110 transition-transform duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="inline-block px-4 py-2 rounded-full bg-luxury-teal text-white text-sm font-medium mb-4">
                {itinerary.tier}
              </div>
              <h1 className="text-5xl font-light text-white mb-4" style={{ letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0, 0, 0, 0.9)' }}>
                {itinerary.destination}
              </h1>
              <div className="flex items-center gap-6 text-white" style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.8)' }}>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>₹{itinerary.total_cost.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{itinerary.duration_days} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
            {itinerary.destination}
          </h1>
          <p className="text-lg text-gray-600">{itinerary.tier} Tier • {itinerary.duration_days} Day Itinerary</p>
        </div>

        <div className="flex justify-end gap-4 mb-12">
          <button
            onClick={() => setSaved(!saved)}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-medium transition-all duration-300 ${
              saved
                ? 'bg-red-50 text-red-600 border-2 border-red-600'
                : 'border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            {saved ? 'Saved' : 'Save This Plan'}
          </button>

          <button
            onClick={() => setShowConversation(!showConversation)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-medium flex items-center gap-2 hover:shadow-glow-teal transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Refine It
          </button>

          <button className="px-6 py-3 rounded-full border-2 border-luxury-orange text-luxury-orange font-medium flex items-center gap-2 hover:bg-luxury-orange hover:text-white transition-all duration-300">
            <Share2 className="w-5 h-5" />
            Export & Share
          </button>
        </div>

        <div className="space-y-12">
          {itinerary.days_json.map((day: Day) => (
            <div key={day.day} className="animate-fade-in-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-semibold">
                  Day {day.day}
                </div>
                <h2 className="text-2xl font-medium text-gray-800">{day.date}</h2>
              </div>

              <div className="space-y-6">
                {day.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl overflow-hidden border-l-4 transition-all duration-300 hover:scale-102 hover:shadow-lg ${getTimeOfDayColor(
                      activity.timeOfDay
                    )}`}
                  >
                    <div className="grid md:grid-cols-3 gap-4 p-6">
                      <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getTimeOfDayIcon(activity.timeOfDay)}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">
                                {activity.timeOfDay} • {activity.time}
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{activity.duration}</div>
                            <div className="text-lg font-semibold text-luxury-teal">
                              ₹{activity.cost}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-gray-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{activity.venue}</span>
                            <span className="text-gray-500">• {activity.location}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:col-span-1">
                        {activity.images && activity.images.length > 0 ? (
                          activity.images.slice(0, 2).map((imageUrl, imgIdx) => (
                            <div key={imgIdx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={imageUrl}
                                alt={imgIdx === 0 ? activity.venue : activity.name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="animate-pulse text-gray-400">
                                <Sparkles className="w-8 h-8" />
                              </div>
                            </div>
                            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="animate-pulse text-gray-400 animation-delay-150">
                                <Sparkles className="w-8 h-8" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showConversation && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-float z-50 animate-slide-in-right">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">Refine Your Plan</h3>
                <button
                  onClick={() => setShowConversation(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600">Tell me how you'd like to adjust this itinerary</p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                  <p className="text-sm text-gray-700">
                    Hey! What would you like to change about this plan?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-2 mb-3 flex-wrap">
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
                  More budget-friendly
                </button>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
                  Add hidden gems
                </button>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
                  Slower pace
                </button>
              </div>
              <textarea
                placeholder="How should we tweak this?"
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none resize-none"
                rows={3}
              />
              <button className="btn-primary w-full mt-3">
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

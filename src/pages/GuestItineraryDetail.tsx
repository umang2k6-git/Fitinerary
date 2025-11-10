import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuestItinerary } from '../contexts/GuestItineraryContext';
import { supabase } from '../lib/supabase';
import { Sparkles, MapPin, Clock, DollarSign, ChevronLeft, UserPlus } from 'lucide-react';
import ExportShareModal from '../components/ExportShareModal';

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

export default function GuestItineraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionId, guestItineraries } = useGuestItinerary();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sessionId) {
      fetchItinerary();
    }
  }, [id, sessionId, guestItineraries]);

  const fetchItinerary = async () => {
    if (!sessionId) {
      console.error('No session ID available');
      setLoading(false);
      return;
    }

    try {
      const localItinerary = guestItineraries.find(it => it.id === id);

      if (localItinerary) {
        setItinerary({
          id: localItinerary.id,
          destination: localItinerary.destination,
          destination_hero_image_url: localItinerary.destination_hero_image_url || '',
          tier: localItinerary.tier,
          days_json: localItinerary.days_json,
          total_cost: localItinerary.total_cost,
          duration_days: 2,
        });

        if (localItinerary.days_json) {
          localItinerary.days_json.forEach((day: Day) => {
            day.activities.forEach((activity: Activity) => {
              loadActivityImages(activity, localItinerary.destination);
            });
          });
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('guest_itineraries')
        .select('*')
        .eq('id', id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching guest itinerary:', error);
        setItinerary(null);
      } else if (data) {
        setItinerary({
          id: data.id,
          destination: data.destination,
          destination_hero_image_url: data.destination_hero_image_url || '',
          tier: data.tier,
          days_json: data.days_json,
          total_cost: data.total_cost,
          duration_days: data.duration_days,
        });

        if (data.days_json) {
          data.days_json.forEach((day: Day) => {
            day.activities.forEach((activity: Activity) => {
              loadActivityImages(activity, data.destination);
            });
          });
        }
      } else {
        setItinerary(null);
      }
    } catch (error) {
      console.error('Error in fetchItinerary:', error);
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  const generateActivityHash = (activity: Activity, destination: string) => {
    return `${activity.name}-${activity.venue}-${activity.location}-${destination}`.toLowerCase().replace(/\s+/g, '-');
  };

  const getActivityTypeForImage = (activity: Activity) => {
    const name = activity.name.toLowerCase();
    const venue = activity.venue.toLowerCase();
    const description = activity.description.toLowerCase();

    if (name.includes('museum') || venue.includes('museum') || name.includes('gallery')) {
      return 'museum';
    } else if (name.includes('food') || name.includes('dining') || name.includes('restaurant') || venue.includes('restaurant')) {
      return 'food';
    } else if (name.includes('nature') || name.includes('park') || name.includes('garden') || name.includes('beach')) {
      return 'nature';
    } else if (name.includes('market') || name.includes('shopping') || name.includes('bazaar')) {
      return 'market';
    } else if (name.includes('temple') || name.includes('church') || name.includes('palace') || description.includes('historic')) {
      return 'architecture';
    } else if (name.includes('spa') || name.includes('wellness') || name.includes('massage')) {
      return 'spa';
    } else if (name.includes('adventure') || name.includes('sports') || name.includes('hiking')) {
      return 'adventure';
    } else if (name.includes('cruise') || name.includes('yacht') || name.includes('boat')) {
      return 'cruise';
    }
    return 'travel';
  };

  const getPexelsPlaceholder = (activity: Activity): string[] => {
    const activityType = getActivityTypeForImage(activity);

    const imageMap: Record<string, string[]> = {
      museum: [
        'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      food: [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      nature: [
        'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      market: [
        'https://images.pexels.com/photos/2291599/pexels-photo-2291599.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1134982/pexels-photo-1134982.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      architecture: [
        'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1542495/pexels-photo-1542495.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      spa: [
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      adventure: [
        'https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      cruise: [
        'https://images.pexels.com/photos/1549024/pexels-photo-1549024.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/2166927/pexels-photo-2166927.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      travel: [
        'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=400'
      ]
    };

    return imageMap[activityType] || imageMap.travel;
  };

  const loadActivityImages = async (activity: Activity, destination: string) => {
    const activityHash = generateActivityHash(activity, destination);

    if (loadingImages[activityHash]) return;

    setLoadingImages(prev => ({ ...prev, [activityHash]: true }));

    try {
      const { data: cachedImages } = await supabase
        .from('activity_images')
        .select('image_urls')
        .eq('activity_hash', activityHash)
        .maybeSingle();

      if (cachedImages?.image_urls && Array.isArray(cachedImages.image_urls) && cachedImages.image_urls.length > 0) {
        updateActivityImages(activityHash, cachedImages.image_urls);
      } else {
        updateActivityImages(activityHash, getPexelsPlaceholder(activity));
      }
    } catch (error) {
      console.error('Error loading activity images:', error);
      updateActivityImages(activityHash, getPexelsPlaceholder(activity));
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
        return 'border-blue-400 bg-blue-50';
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
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center px-6">
        <div className="text-center text-white max-w-md">
          <p className="text-2xl font-light mb-4">Itinerary not found</p>
          <p className="text-white/70 mb-6">
            This itinerary may have expired (guest itineraries are saved for 7 days) or the link may be incorrect.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/quick-itinerary')} className="btn-secondary">
              Create New Itinerary
            </button>
            <button
              onClick={() => navigate('/signup', { state: { from: 'guest-itinerary' } })}
              className="btn-primary"
            >
              Sign Up to Save Forever
            </button>
          </div>
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-luxury-teal to-luxury-orange text-white">
          <div className="flex items-start gap-4">
            <UserPlus className="w-6 h-6 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Save this itinerary forever</h3>
              <p className="text-white/90 mb-4">
                Guest itineraries expire after 7 days. Create a free account to save this plan permanently and access it from any device.
              </p>
              <button
                onClick={() => navigate('/signup', { state: { from: 'guest-itinerary' } })}
                className="px-6 py-3 rounded-full bg-white text-luxury-teal font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
            {itinerary.destination}
          </h1>
          <p className="text-lg text-gray-600">{itinerary.tier} Tier • {itinerary.duration_days} Day Itinerary</p>
        </div>

        <div className="flex justify-end gap-4 mb-12">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-6 py-3 rounded-full border-2 border-luxury-orange text-luxury-orange font-medium flex items-center gap-2 hover:bg-luxury-orange hover:text-white transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
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

      {showExportModal && (
        <ExportShareModal
          itinerary={itinerary}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

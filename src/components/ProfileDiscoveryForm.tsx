import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import InterestTagSelector from './InterestTagSelector';
import CityAutocomplete from './CityAutocomplete';
import PackageCards from './PackageCards';

interface ProfileDiscoveryFormProps {
  onClose: () => void;
}

interface Package {
  packageName: string;
  tagline: string;
  tier: string;
  totalCost: number;
  costBreakdown: any;
  highlights: string[];
  accommodation: any;
  transportation: any;
  itinerary: any[];
}

export default function ProfileDiscoveryForm({ onClose }: ProfileDiscoveryFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPackages, setShowPackages] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [formData, setFormData] = useState({
    start_city: '',
    destination_city: '',
    trip_start_date: '',
    trip_end_date: '',
    travel_purpose: 'Solo' as 'Solo' | 'Couple' | 'Family',
    budget_min: 5000,
    budget_max: 100000,
    dining_preference: 'mix',
    accessibility_requirements: '',
    dietary_restrictions: '',
    preferred_activities: [] as string[],
    special_interests: [] as string[],
  });

  useEffect(() => {
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setFormData({
          start_city: data.start_city || '',
          destination_city: data.destination_city || '',
          trip_start_date: data.trip_start_date || '',
          trip_end_date: data.trip_end_date || '',
          travel_purpose: data.travel_purpose || 'Solo',
          budget_min: data.budget_min || 5000,
          budget_max: data.budget_max || 50000,
          dining_preference: data.dining_preference || 'mix',
          accessibility_requirements: data.accessibility_requirements || '',
          dietary_restrictions: data.dietary_restrictions || '',
          preferred_activities: data.preferred_activities || [],
          special_interests: data.special_interests || [],
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.start_city || !formData.destination_city) {
      alert('Please fill in both starting point and destination.');
      return;
    }

    if (!formData.trip_start_date || !formData.trip_end_date) {
      alert('Please select your trip dates.');
      return;
    }

    if (formData.budget_max <= 0) {
      alert('Please set a valid budget.');
      return;
    }

    if (formData.preferred_activities.length === 0) {
      alert('Please select at least one preferred activity.');
      return;
    }

    if (formData.special_interests.length === 0) {
      alert('Please select at least one special interest.');
      return;
    }

    setLoading(true);

    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Set minimum budget as a percentage of max budget
      const minBudget = Math.floor(formData.budget_max * 0.5);

      const profileData = {
        user_id: user.id,
        ...formData,
        budget_min: minBudget,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      console.log('Saving profile data:', profileData);

      if (existingProfile) {
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) {
          console.error('Database error:', error);
          throw new Error('Failed to save profile. Please try again.');
        }
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert(profileData);

        if (error) {
          console.error('Database error:', error);
          throw new Error('Failed to create profile. Please try again.');
        }
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-package-variations`;

      console.log('Calling API:', apiUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: 'Server error occurred' };
          }

          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.packages || data.packages.length === 0) {
          throw new Error('No packages were generated. Please try again.');
        }

        setPackages(data.packages);
        setShowPackages(true);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
        }

        if (fetchError.message.includes('fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }

        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error generating packages:', error);
      const errorMessage = error.message || 'Failed to generate travel packages. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => {
      if (prev.preferred_activities.includes(activity)) {
        return {
          ...prev,
          preferred_activities: prev.preferred_activities.filter(a => a !== activity)
        };
      } else {
        if (prev.preferred_activities.length >= 3) {
          return prev;
        }
        return {
          ...prev,
          preferred_activities: [...prev.preferred_activities, activity]
        };
      }
    });
  };

  const activityOptions = [
    'Sightseeing',
    'Adventure Sports',
    'Cultural Experiences',
    'Food & Dining',
    'Shopping',
    'Nightlife',
    'Nature & Outdoors',
    'Relaxation & Wellness',
    'Photography',
    'Historical Sites'
  ];

  const totalSteps = 2;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Travel Profile</h2>
              <p className="text-gray-600 mt-1">Step {currentStep} of {totalSteps}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            {[1, 2].map(step => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-luxury-teal' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CityAutocomplete
                  id="start_city"
                  name="start_city"
                  value={formData.start_city}
                  onChange={(value) => setFormData(prev => ({ ...prev, start_city: value }))}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  label="Starting Trip Point"
                  required
                />

                <CityAutocomplete
                  id="destination_city"
                  name="destination_city"
                  value={formData.destination_city}
                  onChange={(value) => setFormData(prev => ({ ...prev, destination_city: value }))}
                  placeholder="e.g., Goa, Shimla, Jaipur"
                  label="Travel Destination"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="trip_start_date" className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip Start Date *
                  </label>
                  <input
                    type="date"
                    id="trip_start_date"
                    name="trip_start_date"
                    value={formData.trip_start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="trip_end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip End Date *
                  </label>
                  <input
                    type="date"
                    id="trip_end_date"
                    name="trip_end_date"
                    value={formData.trip_end_date}
                    onChange={handleChange}
                    min={formData.trip_start_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="travel_purpose" className="block text-sm font-semibold text-gray-700 mb-2">
                  Traveling With *
                </label>
                <select
                  id="travel_purpose"
                  name="travel_purpose"
                  value={formData.travel_purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all bg-white"
                  required
                >
                  <option value="Solo">Solo</option>
                  <option value="Couple">Couple</option>
                  <option value="Family">Family</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget_max" className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Budget *
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-luxury-teal">
                      ₹{formData.budget_max.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {formData.budget_max === 0 ? 'No budget set' : formData.budget_max >= 1000000 ? '10 Lakhs' : `${(formData.budget_max / 100000).toFixed(1)} Lakhs`}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      id="budget_max"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_max: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="1000000"
                      step="10000"
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-luxury"
                      style={{
                        background: `linear-gradient(to right, #14B8A6 0%, #10B981 ${(formData.budget_max / 1000000) * 100}%, #E5E7EB ${(formData.budget_max / 1000000) * 100}%, #E5E7EB 100%)`
                      }}
                      required
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>₹0</span>
                    <span>₹2.5L</span>
                    <span>₹5L</span>
                    <span>₹7.5L</span>
                    <span>₹10L</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Your preferred maximum budget cap for weekend trips
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Travel Preferences</h3>

              <div>
                <label htmlFor="dining_preference" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dining Preference *
                </label>
                <select
                  id="dining_preference"
                  name="dining_preference"
                  value={formData.dining_preference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all bg-white"
                  required
                >
                  <option value="street-food">Street Food & Local Eateries</option>
                  <option value="mix">Mix of Local and Upscale</option>
                  <option value="fine-dining">Fine Dining & Upscale Restaurants</option>
                  <option value="authentic">Authentic Local Experiences</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Preferred Activities *
                  </label>
                  <span className={`text-sm font-semibold ${
                    formData.preferred_activities.length >= 3 ? 'text-luxury-teal' : 'text-gray-500'
                  }`}>
                    {formData.preferred_activities.length}/3
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Select up to 3 activities you enjoy most</p>
                <div className="grid grid-cols-2 gap-2">
                  {activityOptions.map(activity => {
                    const isSelected = formData.preferred_activities.includes(activity);
                    const isDisabled = !isSelected && formData.preferred_activities.length >= 3;

                    return (
                      <button
                        key={activity}
                        type="button"
                        onClick={() => handleActivityToggle(activity)}
                        disabled={isDisabled}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-luxury-teal text-white'
                            : isDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {activity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-8">Special Interests</h3>
                <p className="text-gray-600 mb-4">
                  Select the types of experiences you love. This helps us personalize your itineraries.
                </p>

                <InterestTagSelector
                  selectedTags={formData.special_interests}
                  onChange={(tags) => setFormData(prev => ({ ...prev, special_interests: tags }))}
                />
              </div>

              <div>
                <label htmlFor="dietary_restrictions" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  id="dietary_restrictions"
                  name="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={handleChange}
                  placeholder="e.g., Vegetarian, Vegan, Gluten-free, No allergies"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="accessibility_requirements" className="block text-sm font-semibold text-gray-700 mb-2">
                  Accessibility Requirements
                </label>
                <textarea
                  id="accessibility_requirements"
                  name="accessibility_requirements"
                  value={formData.accessibility_requirements}
                  onChange={handleChange}
                  placeholder="Any special needs or accessibility requirements"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentStep(prev => prev - 1);
                }}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentStep(prev => prev + 1);
                }}
                className="flex-1 bg-gradient-to-r from-luxury-teal to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-luxury-teal/90 hover:to-emerald-500/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-luxury-teal to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-luxury-teal/90 hover:to-emerald-500/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Your Perfect Itinerary...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search and Plan
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {showPackages && packages.length > 0 && (
        <PackageCards
          packages={packages}
          onClose={() => {
            setShowPackages(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}

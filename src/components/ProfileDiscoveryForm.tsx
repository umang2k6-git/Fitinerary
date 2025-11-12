import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CityAutocomplete from './CityAutocomplete';

interface ProfileDiscoveryFormProps {
  onClose: () => void;
}

export default function ProfileDiscoveryForm({ onClose }: ProfileDiscoveryFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    start_city: '',
    trip_start_date: '',
    trip_end_date: '',
    travel_purpose: 'Solo' as 'Solo' | 'Couple' | 'Family',
    budget_min: 5000,
    budget_max: 100000,
    accommodation_style: 'balanced',
    dining_preference: 'mix',
    travel_pace: 'moderate' as 'relaxed' | 'moderate' | 'packed',
    accessibility_requirements: '',
    dietary_restrictions: '',
    preferred_activities: [] as string[],
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
          trip_start_date: data.trip_start_date || '',
          trip_end_date: data.trip_end_date || '',
          travel_purpose: data.travel_purpose || 'Solo',
          budget_min: data.budget_min || 5000,
          budget_max: data.budget_max || 50000,
          accommodation_style: data.accommodation_style || 'balanced',
          dining_preference: data.dining_preference || 'mix',
          travel_pace: data.travel_pace || 'moderate',
          accessibility_requirements: data.accessibility_requirements || '',
          dietary_restrictions: data.dietary_restrictions || '',
          preferred_activities: data.preferred_activities || [],
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileData = {
        user_id: user.id,
        ...formData,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      if (existingProfile) {
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
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
    setFormData(prev => ({
      ...prev,
      preferred_activities: prev.preferred_activities.includes(activity)
        ? prev.preferred_activities.filter(a => a !== activity)
        : [...prev.preferred_activities, activity]
    }));
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl my-2 sm:my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Travel Profile</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Step {currentStep} of {totalSteps}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Basic Information</h3>

              <CityAutocomplete
                id="start_city"
                name="start_city"
                value={formData.start_city}
                onChange={(value) => setFormData(prev => ({ ...prev, start_city: value }))}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                label="Starting Trip Point"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all bg-white text-sm sm:text-base"
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
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="text-2xl sm:text-3xl font-bold text-luxury-teal">
                      ₹{formData.budget_max.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full w-fit">
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
                  <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 font-medium">
                    <span>₹0</span>
                    <span className="hidden sm:inline">₹2.5L</span>
                    <span>₹5L</span>
                    <span className="hidden sm:inline">₹7.5L</span>
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
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Travel Preferences</h3>

              <div>
                <label htmlFor="accommodation_style" className="block text-sm font-semibold text-gray-700 mb-2">
                  Accommodation Style *
                </label>
                <select
                  id="accommodation_style"
                  name="accommodation_style"
                  value={formData.accommodation_style}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all bg-white text-sm sm:text-base"
                  required
                >
                  <option value="budget">Budget</option>
                  <option value="balanced">Balanced</option>
                  <option value="luxe">Luxe</option>
                </select>
              </div>

              <div>
                <label htmlFor="dining_preference" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dining Preference *
                </label>
                <select
                  id="dining_preference"
                  name="dining_preference"
                  value={formData.dining_preference}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all bg-white text-sm sm:text-base"
                  required
                >
                  <option value="street-food">Street Food & Local Eateries</option>
                  <option value="mix">Mix of Local and Upscale</option>
                  <option value="fine-dining">Fine Dining & Upscale Restaurants</option>
                  <option value="authentic">Authentic Local Experiences</option>
                </select>
              </div>

              <div>
                <label htmlFor="travel_pace" className="block text-sm font-semibold text-gray-700 mb-2">
                  Travel Pace *
                </label>
                <select
                  id="travel_pace"
                  name="travel_pace"
                  value={formData.travel_pace}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all bg-white text-sm sm:text-base"
                  required
                >
                  <option value="relaxed">Relaxed (1-2 activities per day)</option>
                  <option value="moderate">Moderate (2-3 activities per day)</option>
                  <option value="packed">Packed (3+ activities per day)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preferred Activities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activityOptions.map(activity => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => handleActivityToggle(activity)}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        formData.preferred_activities.includes(activity)
                          ? 'bg-luxury-teal text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all resize-none text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentStep(prev => prev - 1);
                }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors"
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
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                Next
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Generating your Fitinerary...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Generate my Fitinerary</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Eye, Share2, Trash2, Search, MapPin, Calendar } from 'lucide-react';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';

interface Itinerary {
  id: string;
  destination: string;
  destination_hero_image_url: string;
  tier: string;
  total_cost: number;
  duration_days: number;
  created_at: string;
}

export default function MyItineraries() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchItineraries();
  }, [user]);

  const fetchItineraries = async () => {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching itineraries:', error);
    } else {
      setItineraries(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting itinerary:', error);
      alert('Failed to delete itinerary. Please try again.');
    } else {
      setItineraries(itineraries.filter((it) => it.id !== id));
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Budget':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Balanced':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Luxe':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredItineraries = itineraries.filter((it) => {
    const matchesSearch = it.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !filterTier || it.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-luxury-teal border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-light mb-6" style={{ letterSpacing: '-0.02em' }}>
            My Itineraries
          </h1>

          <ProfileCompletionBanner />

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:border-luxury-teal focus:ring-2 focus:ring-luxury-teal/20 outline-none transition-all duration-300"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterTier(null)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  !filterTier
                    ? 'bg-luxury-teal text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTier('Budget')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  filterTier === 'Budget'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                Budget
              </button>
              <button
                onClick={() => setFilterTier('Balanced')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  filterTier === 'Balanced'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => setFilterTier('Luxe')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  filterTier === 'Luxe'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                Luxe
              </button>
            </div>
          </div>
        </div>

        {filteredItineraries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">
              {searchTerm || filterTier ? 'No itineraries found' : 'Your next adventure awaits!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {searchTerm || filterTier
                ? 'Try adjusting your filters'
                : "You haven't created any itineraries yet"}
            </p>
            {!searchTerm && !filterTier && (
              <button onClick={() => navigate('/')} className="btn-primary">
                Plan Your First Trip
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItineraries.map((itinerary, index) => (
              <div
                key={itinerary.id}
                className="card-luxury overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      itinerary.destination_hero_image_url ||
                      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800'
                    }
                    alt={itinerary.destination}
                    className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(
                        itinerary.tier
                      )}`}
                    >
                      {itinerary.tier}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-semibold text-white mb-1" style={{ textShadow: '0 2px 15px rgba(0, 0, 0, 0.9)' }}>
                      {itinerary.destination}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(itinerary.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="font-semibold text-luxury-teal">
                      ₹{itinerary.total_cost.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                      className="flex-1 px-4 py-2 rounded-xl bg-luxury-teal text-white font-medium hover:bg-luxury-teal/90 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:border-luxury-orange hover:text-luxury-orange transition-all duration-300 hover:scale-105">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(itinerary.id)}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 transition-all duration-300 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

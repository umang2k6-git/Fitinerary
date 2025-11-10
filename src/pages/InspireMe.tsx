import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Sparkles } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  hero_image_url: string;
  tagline: string;
  region: string;
  description: string;
}

export default function InspireMe() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_featured', true)
      .limit(5);

    if (error) {
      console.error('Error fetching destinations:', error);
    } else {
      setDestinations(data || []);
    }
    setLoading(false);
  };

  const handleDestinationClick = (destination: Destination) => {
    navigate('/generate', {
      state: {
        destination: destination.name,
        destinationImageUrl: destination.hero_image_url,
        tripBrief: ''
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-luxury-teal border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Finding perfect destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-luxury-teal" />
            <h1 className="text-5xl md:text-6xl font-light text-white" style={{ letterSpacing: '-0.02em' }}>
              Get Inspired
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Handpicked weekend escapes waiting for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="group relative rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-400 ease-luxury hover:scale-105"
              style={{
                animationDelay: `${index * 200}ms`,
                boxShadow: hoveredCard === destination.id
                  ? '0 25px 70px rgba(0,0,0,0.35)'
                  : '0 20px 60px rgba(0,0,0,0.25)',
              }}
              onClick={() => handleDestinationClick(destination)}
              onMouseEnter={() => setHoveredCard(destination.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={destination.hero_image_url}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-all duration-400 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-luxury-teal" />
                    <span className="text-sm text-white" style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.8)' }}>{destination.region}</span>
                  </div>
                  <h3
                    className="text-3xl font-medium text-white mb-2"
                    style={{ letterSpacing: '-0.01em', textShadow: '0 2px 15px rgba(0, 0, 0, 0.8)' }}
                  >
                    {destination.name}
                  </h3>
                  <p className="text-lg text-white font-light" style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.8)' }}>
                    {destination.tagline}
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 border-2 border-luxury-teal opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-luxury-teal hover:text-luxury-orange font-medium text-lg transition-colors duration-300 relative group"
          >
            I'll choose my own adventure
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-luxury-orange group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

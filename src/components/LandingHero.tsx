import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';

export default function LandingHero() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [tripBrief, setTripBrief] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInspireMe = () => {
    navigate('/inspire-me');
  };

  const handleBuildPlans = () => {
    navigate('/generate', {
      state: { destination, tripBrief }
    });
  };

  const parallaxOffset = scrollY * 0.5;
  const scrollIndicatorOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          transform: `translate3d(0, ${parallaxOffset}px, 0)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />

      <div
        className="absolute top-8 left-8 right-8 md:top-12 md:left-12 md:right-12 animate-drift opacity-20 pointer-events-none"
      >
        <div className="w-64 h-64 rounded-full bg-luxury-teal/20 blur-3xl absolute top-0 right-0" />
        <div className="w-96 h-96 rounded-full bg-luxury-orange/20 blur-3xl absolute bottom-0 left-0" />
      </div>

      <div
        className={`relative z-10 min-h-screen flex items-center justify-center px-6 md:px-12 transition-opacity duration-1200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-4xl w-full text-center">
          <h1
            className={`text-5xl md:text-7xl font-light text-white mb-6 transition-all duration-600 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)' }}
          >
            Itineraries that fit you — not the crowd.
          </h1>

          <p
            className={`text-lg md:text-xl text-white mb-4 max-w-2xl mx-auto transition-all duration-600 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ lineHeight: '1.6', textShadow: '0 2px 15px rgba(0, 0, 0, 0.8)' }}
          >
            Tell us where you want to go and how you like to travel.
          </p>

          <p
            className={`text-lg md:text-xl text-white mb-12 max-w-2xl mx-auto transition-all duration-600 delay-400 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ lineHeight: '1.6', textShadow: '0 2px 15px rgba(0, 0, 0, 0.8)' }}
          >
            Fitinerary builds three personalized weekend plans — budget, balanced, or luxe — in under 30 seconds.
          </p>

          <div
            className={`space-y-6 max-w-xl mx-auto transition-all duration-600 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <input
              type="text"
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-luxury"
            />

            <textarea
              placeholder="e.g., art museums + street food, slow mornings, no crowds"
              value={tripBrief}
              onChange={(e) => setTripBrief(e.target.value)}
              rows={3}
              className="input-luxury resize-none"
            />

            {!destination ? (
              <button
                onClick={handleInspireMe}
                className="btn-secondary w-full group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Inspire Me
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-teal to-luxury-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ) : (
              <button
                onClick={handleBuildPlans}
                className="btn-primary w-full relative overflow-hidden group"
              >
                <span className="relative z-10">Build My Plans</span>
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-orange to-luxury-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300"
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <ChevronDown className="w-8 h-8 text-white animate-bounce" />
      </div>
    </div>
  );
}

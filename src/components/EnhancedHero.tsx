import { useState, useEffect } from 'react';
import { ChevronDown, Instagram, Facebook, Twitter } from 'lucide-react';

export default function EnhancedHero() {
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

  const parallaxOffset = scrollY * 0.5;
  const scrollIndicatorOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          transform: `translate3d(0, ${parallaxOffset}px, 0)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

      <div className="absolute inset-0 border-8 border-white/10 pointer-events-none" />

      <div
        className={`absolute left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
      >
        <a
          href="#"
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-luxury-teal hover:scale-110 transition-all duration-300"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-luxury-teal hover:scale-110 transition-all duration-300"
          aria-label="Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-luxury-teal hover:scale-110 transition-all duration-300"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5" />
        </a>
      </div>

      <div
        className={`relative z-10 min-h-screen flex items-center justify-center px-6 md:px-12 transition-opacity duration-1200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl w-full text-center">
          <div
            className={`mb-6 transition-all duration-800 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <p
              className="text-white text-xl md:text-2xl font-light tracking-wider mb-8"
              style={{ letterSpacing: '0.3em', textShadow: '0 4px 30px rgba(0, 0, 0, 0.9)' }}
            >
              IT'S TIME TO
            </p>
          </div>

          <div
            className={`relative inline-block transition-all duration-1000 delay-400 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h1
              className="text-8xl md:text-[12rem] lg:text-[14rem] font-bold text-white leading-none"
              style={{
                letterSpacing: '-0.02em',
                textShadow: '0 8px 40px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              TRAVEL
            </h1>
          </div>

          <div
            className={`mt-8 transition-all duration-800 delay-600 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <p className="text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.9), 0 2px 15px rgba(0, 0, 0, 0.8)' }}>
              Embrace the call of wanderlust. Pack your bags, set off on new horizons, and let the world be your guide. Safe travels!
            </p>
          </div>

          <div
            className={`mt-12 transition-all duration-800 delay-800 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <button className="px-10 py-4 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-semibold text-lg transition-all duration-300 hover:shadow-glow-teal hover:scale-110 hover:-translate-y-1 active:scale-100">
              See More
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300 z-10"
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <ChevronDown className="w-10 h-10 text-white animate-bounce" />
      </div>
    </div>
  );
}

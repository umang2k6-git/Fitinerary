import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ActionButtonsCard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePersonalizedClick = () => {
    if (user) {
      navigate('/discovery');
    } else {
      navigate('/login', { state: { from: 'personalized' } });
    }
  };

  return (
    <div className="glass-dark rounded-3xl p-8 shadow-float backdrop-blur-xl animate-fade-in-up">
      <h2 className="text-2xl font-light text-white mb-8" style={{ letterSpacing: '-0.02em' }}>
        Choose Your Journey
      </h2>

      <div className="space-y-6">
        <div className="group">
          <button
            onClick={handlePersonalizedClick}
            className="w-full text-left p-6 rounded-2xl bg-gradient-to-r from-luxury-teal to-luxury-orange transition-all duration-300 ease-luxury hover:shadow-glow-teal hover:scale-105 active:scale-98"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Build Your Dream Itinerary
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Personalized travel experiences based on your preferences
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-white/60 text-sm glass-dark rounded-full py-1">
              or
            </span>
          </div>
        </div>

        <div className="group">
          <button
            onClick={() => navigate('/quick-itinerary')}
            className="w-full text-left p-6 rounded-2xl border-2 border-white/30 glass-dark transition-all duration-300 ease-luxury hover:border-luxury-teal hover:shadow-glow-teal hover:scale-105 active:scale-98"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-luxury-orange/20 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-luxury-orange" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Get Instant Weekend Plans
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Three plans in 30 seconds. No signup required.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-white/60 text-xs text-center">
          Both options are free. Create an account to save your itineraries.
        </p>
      </div>
    </div>
  );
}

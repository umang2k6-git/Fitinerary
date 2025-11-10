import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProfileDiscoveryForm from '../components/ProfileDiscoveryForm';

export default function Discovery() {
  const navigate = useNavigate();

  const handleFormClose = () => {
    navigate('/inspire-me');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-charcoal via-gray-900 to-luxury-charcoal py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Let's Get to Know You
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto" style={{ lineHeight: '1.6' }}>
            Help us get to know your preferences better so that we can tailor-make your very own unique itinerary
          </p>
        </div>

        <ProfileDiscoveryForm onClose={handleFormClose} />
      </div>
    </div>
  );
}

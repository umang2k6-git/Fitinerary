import { useNavigate } from 'react-router-dom';
import { X, Check, Sparkles } from 'lucide-react';

interface SignupPromptProps {
  onClose: () => void;
}

export default function SignupPrompt({ onClose }: SignupPromptProps) {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const benefits = [
    'Save all your itineraries',
    'Get personalized recommendations',
    'Access your plans on any device',
    'Receive updates and special offers',
    'Never lose your travel ideas'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-scale-in">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-luxury-teal to-luxury-orange rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Love Your Itinerary?
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Create an account to save this itinerary and unlock personalized travel planning
          </p>

          <div className="space-y-3 mb-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-luxury-teal/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-luxury-teal" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignup}
              className="w-full btn-primary py-3 text-base"
            >
              Create Free Account
            </button>

            <button
              onClick={handleLogin}
              className="w-full btn-secondary py-3 text-base"
            >
              I Already Have an Account
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

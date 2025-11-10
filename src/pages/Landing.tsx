import { useState, useEffect } from 'react';
import EnhancedHero from '../components/EnhancedHero';
import DestinationCard from '../components/DestinationCard';
import ValueProposition from '../components/ValueProposition';
import ActionButtonsCard from '../components/ActionButtonsCard';

export default function Landing() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const destinations = [
    {
      imageUrl: 'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: '10 Must-Visit Hidden Gems',
      location: 'Various Locations',
      description: 'Venture off the beaten path to discover hidden gems and secret spots that only locals know about.',
      category: 'Adventure',
      angle: -1,
    },
    {
      imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Immersive Cultural Experiences',
      location: 'Asia & Europe',
      description: 'Dive deep into vibrant cultures with authentic local experiences and traditions.',
      category: 'Cultural',
      angle: 0,
    },
    {
      imageUrl: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'From Dreams to Reality',
      location: 'Mediterranean',
      description: 'Explore expert tips and hidden gems to make the most of your dream vacation.',
      category: 'Luxury',
      angle: 1,
    },
  ];

  return (
    <div className="relative">
      <EnhancedHero />

      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-luxury-charcoal mb-6" style={{ letterSpacing: '-0.02em' }}>
              Explore Dream Destinations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover unfamiliar territories, embrace diverse cultures and breathtaking landscapes while pursuing destinations that captivate your heart.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {destinations.map((destination, index) => (
              <DestinationCard key={index} {...destination} />
            ))}
          </div>
        </div>
      </section>

      <ValueProposition />

      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light text-luxury-charcoal mb-6" style={{ letterSpacing: '-0.02em' }}>
              Start Your Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
              Whether you want deeply personalized plans or instant inspiration, we've got you covered.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ActionButtonsCard />
          </div>
        </div>
      </section>
    </div>
  );
}

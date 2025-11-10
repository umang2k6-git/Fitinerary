import { Plane, Building2, Compass, Lightbulb } from 'lucide-react';

interface Feature {
  icon: typeof Plane;
  title: string;
  description: string;
  color: string;
}

export default function ValueProposition() {
  const features: Feature[] = [
    {
      icon: Plane,
      title: 'Seamless Flight Booking',
      description: 'Find and book the best flights with competitive prices and flexible scheduling options.',
      color: 'bg-luxury-teal',
    },
    {
      icon: Building2,
      title: 'Curated Accommodations',
      description: 'Discover handpicked hotels and stays that match your style and budget perfectly.',
      color: 'bg-luxury-orange',
    },
    {
      icon: Compass,
      title: 'Immersive Cultural Experiences',
      description: 'Dive deep into local cultures with authentic experiences and hidden gems only locals know.',
      color: 'bg-luxury-teal',
    },
    {
      icon: Lightbulb,
      title: 'Expert Travel Tips',
      description: 'Get insider knowledge and recommendations from seasoned travelers and local experts.',
      color: 'bg-luxury-orange',
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-luxury-charcoal mb-6" style={{ letterSpacing: '-0.02em' }}>
            Why We Are The Best
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We combine cutting-edge technology with personalized service to create unforgettable travel experiences tailored just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group text-center transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className="mb-6 inline-flex">
                  <div
                    className={`${feature.color} rounded-full p-6 transition-all duration-500 group-hover:shadow-glow-teal group-hover:scale-110`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-luxury-charcoal mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-light text-luxury-charcoal" style={{ letterSpacing: '-0.02em' }}>
              About Travel
            </h3>
            <p className="text-gray-600 leading-relaxed">
              It encourages exploration of unfamiliar territories, embracing diverse cultures and landscapes, while pursuing the desired destination that captivates the heart and ignites a sense of wonder.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you're seeking adventure, relaxation, or cultural immersion, we craft personalized itineraries that transform your travel dreams into reality. Our expert team ensures every detail is perfectly planned so you can focus on making memories.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-luxury-teal" />
                <span className="text-gray-700 font-medium">Personalized Service</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-luxury-orange" />
                <span className="text-gray-700 font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-luxury-teal" />
                <span className="text-gray-700 font-medium">Best Price Guarantee</span>
              </div>
            </div>
          </div>

          <div className="relative h-96 rounded-3xl overflow-hidden shadow-luxury">
            <img
              src="https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Travel destination"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

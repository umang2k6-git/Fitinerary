import EnhancedHero from '../components/EnhancedHero';
import ValueProposition from '../components/ValueProposition';
import ActionButtonsCard from '../components/ActionButtonsCard';
import TestimonialsMarquee from '../components/TestimonialsMarquee';
import VisitCounter from '../components/VisitCounter';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="relative">
      <EnhancedHero />

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

      <TestimonialsMarquee />

      <VisitCounter />

      <Footer />
    </div>
  );
}

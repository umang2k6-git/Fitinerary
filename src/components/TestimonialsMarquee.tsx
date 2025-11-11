import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  text: string;
  image: string;
}

export default function TestimonialsMarquee() {
  const testimonials: Testimonial[] = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      text: "Fitinerary made planning my Goa trip so easy! The personalized suggestions were spot on and I discovered hidden gems I would have never found on my own.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Rahul Verma",
      location: "Delhi",
      text: "Best travel planning app I've used! The AI understood exactly what I wanted - adventure activities mixed with local culture. My Manali trip was unforgettable!",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Anjali Patel",
      location: "Bangalore",
      text: "I was skeptical at first, but Fitinerary exceeded all expectations. The budget breakdown was transparent and the itinerary perfectly balanced relaxation with exploration.",
      image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Vikram Singh",
      location: "Jaipur",
      text: "Saved me hours of research! The three-tier options (budget, balanced, luxe) made it easy to choose. Went with balanced and had an amazing weekend in Udaipur.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Meera Reddy",
      location: "Hyderabad",
      text: "As a solo female traveler, I appreciated the safety tips and well-researched recommendations. The Pondicherry itinerary was perfect - peaceful and authentic!",
      image: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Arjun Kapoor",
      location: "Pune",
      text: "Fitinerary understands what young travelers want. The street food suggestions alone made my trip worth it! Will definitely use this for all my future travels.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="bg-gradient-to-r from-luxury-teal to-luxury-orange py-12 overflow-hidden">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-light text-white" style={{ letterSpacing: '-0.02em' }}>
          What Our Travelers Say
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-luxury-teal to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-luxury-orange to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:pause-marquee">
          {allTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-96 mx-4 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-luxury-charcoal">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

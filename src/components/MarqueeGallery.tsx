import { useEffect, useRef } from 'react';

interface MarqueeItem {
  type: 'destination' | 'testimonial' | 'monument';
  imageUrl: string;
  title?: string;
  testimonial?: {
    name: string;
    rating: number;
    quote: string;
  };
}

const marqueeItems: MarqueeItem[] = [
  {
    type: 'destination',
    imageUrl: 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Taj Mahal, India'
  },
  {
    type: 'testimonial',
    imageUrl: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg?auto=compress&cs=tinysrgb&w=800',
    testimonial: {
      name: 'Sarah Chen',
      rating: 5,
      quote: 'The perfect blend of adventure and relaxation!'
    }
  },
  {
    type: 'monument',
    imageUrl: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Eiffel Tower, Paris'
  },
  {
    type: 'destination',
    imageUrl: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Santorini, Greece'
  },
  {
    type: 'testimonial',
    imageUrl: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=800',
    testimonial: {
      name: 'Michael Rodriguez',
      rating: 5,
      quote: 'Every detail was perfectly planned. Amazing experience!'
    }
  },
  {
    type: 'monument',
    imageUrl: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Colosseum, Rome'
  },
  {
    type: 'destination',
    imageUrl: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Swiss Alps'
  },
  {
    type: 'testimonial',
    imageUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800',
    testimonial: {
      name: 'Priya Sharma',
      rating: 5,
      quote: 'Personalized to perfection. Highly recommend!'
    }
  },
  {
    type: 'monument',
    imageUrl: 'https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Golden Gate Bridge'
  },
  {
    type: 'destination',
    imageUrl: 'https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Bali, Indonesia'
  },
  {
    type: 'testimonial',
    imageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800',
    testimonial: {
      name: 'James Wilson',
      rating: 5,
      quote: 'Best travel planning app ever. So easy to use!'
    }
  },
  {
    type: 'monument',
    imageUrl: 'https://images.pexels.com/photos/259967/pexels-photo-259967.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Machu Picchu, Peru'
  }
];

export default function MarqueeGallery() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeElement = marqueeRef.current;
    if (!marqueeElement) return;

    let animationFrame: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;

      if (scrollPosition >= marqueeElement.scrollWidth / 2) {
        scrollPosition = 0;
      }

      marqueeElement.style.transform = `translateX(-${scrollPosition}px)`;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-4 h-4 fill-luxury-gold"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

      <div
        ref={marqueeRef}
        className="flex gap-6 will-change-transform"
        style={{ width: 'fit-content' }}
      >
        {[...marqueeItems, ...marqueeItems].map((item, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-80 h-64 rounded-2xl overflow-hidden shadow-luxury group"
          >
            <img
              src={item.imageUrl}
              alt={item.title || item.testimonial?.name || 'Gallery item'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {item.type === 'testimonial' && item.testimonial ? (
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {renderStars(item.testimonial.rating)}
                <p className="text-sm mt-2 mb-3 italic line-clamp-2">
                  "{item.testimonial.quote}"
                </p>
                <p className="text-xs font-medium text-luxury-teal">
                  {item.testimonial.name}
                </p>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-lg font-medium">
                  {item.title}
                </h3>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  imageUrl: string;
  title: string;
  location: string;
  description: string;
  category: string;
  angle?: number;
}

export default function DestinationCard({
  imageUrl,
  title,
  location,
  description,
  category,
  angle = 0,
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative h-96 rounded-2xl overflow-hidden shadow-luxury transition-all duration-500 hover:shadow-float hover:scale-105"
      style={{ transform: `rotate(${angle}deg)` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500" />

      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-luxury-teal text-white">
          {category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-2 text-luxury-teal text-sm">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>

        <h3 className="text-2xl font-semibold mb-3">{title}</h3>

        <div
          className={`transition-all duration-500 ${
            isHovered ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            {description}
          </p>

          <button className="inline-flex items-center gap-2 text-luxury-teal font-medium text-sm group-hover:gap-3 transition-all duration-300">
            Explore
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

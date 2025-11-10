import { useState, useEffect } from 'react';
import { Landmark, Building2, Lightbulb, User, Globe, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TriviaItem {
  id: string;
  category: string;
  title: string;
  fact: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'landmarks':
      return Landmark;
    case 'cities':
      return Building2;
    case 'travel_tips':
      return Lightbulb;
    case 'famous_travelers':
      return User;
    case 'cultural_facts':
      return Globe;
    default:
      return Sparkles;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'landmarks':
      return 'from-blue-500 to-blue-600';
    case 'cities':
      return 'from-purple-500 to-purple-600';
    case 'travel_tips':
      return 'from-green-500 to-green-600';
    case 'famous_travelers':
      return 'from-orange-500 to-orange-600';
    case 'cultural_facts':
      return 'from-teal-500 to-teal-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const formatCategoryName = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function TravelTriviaCard() {
  const [triviaList, setTriviaList] = useState<TriviaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrivia();
  }, []);

  useEffect(() => {
    if (triviaList.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % triviaList.length);
        setIsVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [triviaList.length]);

  const fetchTrivia = async () => {
    try {
      const { data, error } = await supabase
        .from('travel_trivia')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setTriviaList(shuffled);
      }
    } catch (error) {
      console.error('Error fetching trivia:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || triviaList.length === 0) {
    return null;
  }

  const currentTrivia = triviaList[currentIndex];
  const Icon = getCategoryIcon(currentTrivia.category);
  const colorClass = getCategoryColor(currentTrivia.category);

  return (
    <div
      className={`max-w-2xl mx-auto mt-8 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${colorClass} flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-luxury-teal uppercase tracking-wide">
                Did You Know?
              </span>
              <span className="text-xs text-white/60">
                {formatCategoryName(currentTrivia.category)}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {currentTrivia.title}
            </h3>
            <p className="text-white/80 leading-relaxed">
              {currentTrivia.fact}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {triviaList.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-luxury-teal'
                  : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

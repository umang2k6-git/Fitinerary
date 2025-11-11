import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export default function VisitCounter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`;
        const headers = {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setVisitCount(data.visit_count);
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackVisit();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="py-16 flex justify-center">
      <div className="glass-light rounded-3xl px-8 py-6 border border-white/20 hover:border-luxury-teal/40 transition-all duration-500 hover:scale-105 hover:shadow-glow-teal">
        <div className="flex items-center gap-4">
          <Eye className="w-6 h-6 text-luxury-teal" />
          <div>
            <p className="text-white/70 text-sm font-medium">Total Site Visits</p>
            <p className="text-white text-3xl font-bold mt-1">
              {isLoading ? (
                <span className="inline-block animate-pulse">---</span>
              ) : (
                <span className="bg-gradient-to-r from-luxury-teal to-luxury-orange bg-clip-text text-transparent">
                  {visitCount !== null ? formatNumber(visitCount) : '0'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

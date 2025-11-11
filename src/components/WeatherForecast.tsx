import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudDrizzle, Wind, Droplets, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WeatherData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  condition: string;
  description: string;
  icon: string;
  precipitationProbability: number;
  humidity: number;
  windSpeed: number;
}

interface WeatherForecastProps {
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
}

export default function WeatherForecast({ destination, country, startDate, endDate }: WeatherForecastProps) {
  const [forecasts, setForecasts] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeatherForecast();
  }, [destination, startDate, endDate]);

  const fetchWeatherForecast = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to view weather forecasts');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-weather-forecast`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination,
            country,
            startDate,
            endDate,
          }),
        }
      );

      if (!response.ok) {
        console.error('Weather API error status:', response.status);

        if (response.status === 401) {
          throw new Error('Session expired. Please refresh the page.');
        } else if (response.status >= 500) {
          throw new Error('Weather service temporarily unavailable');
        }

        throw new Error('Failed to fetch weather forecast');
      }

      const data = await response.json();
      setForecasts(data.forecasts || []);
    } catch (err: any) {
      console.error('Error fetching weather:', err);

      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Unable to connect. Please check your internet connection.');
      } else {
        setError(err.message || 'Unable to load weather forecast');
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();

    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    } else if (lowerCondition.includes('drizzle')) {
      return <CloudDrizzle className="w-8 h-8 text-blue-400" />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="w-8 h-8 text-amber-500" />;
    }

    return <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-gray-700">Loading weather forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <p className="text-amber-800 text-sm">{error}</p>
      </div>
    );
  }

  if (!forecasts || forecasts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Weather Forecast</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Plan your activities around the weather in {destination}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {forecasts.map((forecast, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {formatDate(forecast.date)}
              </p>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(forecast.condition)}
              </div>
              <p className="text-xs text-gray-600 mb-2">{forecast.description}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">High</span>
                <span className="font-semibold text-red-600">{forecast.temperatureMax}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Low</span>
                <span className="font-semibold text-blue-600">{forecast.temperatureMin}°C</span>
              </div>

              <div className="pt-2 border-t border-gray-200 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    <span>Rain</span>
                  </div>
                  <span>{forecast.precipitationProbability}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>Humidity</span>
                  </div>
                  <span>{forecast.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    <span>Wind</span>
                  </div>
                  <span>{forecast.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {forecasts.some(f => f.precipitationProbability > 70) && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> High chance of rain expected. Consider bringing an umbrella or rain jacket.
          </p>
        </div>
      )}

      {forecasts.some(f => f.temperatureMax > 35) && (
        <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-xl">
          <p className="text-sm text-orange-800">
            <strong>Tip:</strong> High temperatures expected. Stay hydrated and use sun protection.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind,
  Droplets,
} from 'lucide-react';

interface WeatherData {
  temperature?: number;
  description?: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
}

interface WeatherWidgetProps {
  weather: WeatherData | null;
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Local Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No weather data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const getWeatherIcon = (description: string = '') => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('shower')) {
      return <CloudRain className="h-12 w-12 text-blue-500" />;
    } else if (desc.includes('drizzle')) {
      return <CloudDrizzle className="h-12 w-12 text-blue-400" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="h-12 w-12 text-blue-300" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="h-12 w-12 text-gray-400" />;
    } else if (desc.includes('clear') || desc.includes('sunny')) {
      return <Sun className="h-12 w-12 text-yellow-500" />;
    } else {
      return <CloudSun className="h-12 w-12 text-orange-400" />;
    }
  };

  const getBackgroundGradient = (description: string = '') => {
    const desc = description.toLowerCase();
    if (desc.includes('rain')) {
      return 'bg-gradient-to-br from-blue-50 to-blue-100';
    } else if (desc.includes('cloud')) {
      return 'bg-gradient-to-br from-gray-50 to-gray-100';
    } else if (desc.includes('clear') || desc.includes('sunny')) {
      return 'bg-gradient-to-br from-orange-50 to-yellow-50';
    } else {
      return 'bg-gradient-to-br from-blue-50 to-purple-50';
    }
  };

  return (
    <Card className={`${getBackgroundGradient(weather.description)} shadow-sm`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          Local Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-5xl font-bold text-foreground">
              {weather.temperature || '--'}°
              <span className="text-2xl text-muted-foreground">F</span>
            </div>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {weather.description || 'No data'}
            </p>
          </div>
          <div className="mt-2">
            {getWeatherIcon(weather.description || '')}
          </div>
        </div>

        {/* Additional Weather Info */}
        {(weather.humidity || weather.windSpeed || weather.feelsLike) && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/50">
            {weather.feelsLike && (
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/50 p-1.5">
                  <Sun className="h-3 w-3 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feels like</p>
                  <p className="text-sm font-medium">{weather.feelsLike}°F</p>
                </div>
              </div>
            )}
            {weather.humidity && (
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/50 p-1.5">
                  <Droplets className="h-3 w-3 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="text-sm font-medium">{weather.humidity}%</p>
                </div>
              </div>
            )}
            {weather.windSpeed && (
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/50 p-1.5">
                  <Wind className="h-3 w-3 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="text-sm font-medium">{weather.windSpeed} mph</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

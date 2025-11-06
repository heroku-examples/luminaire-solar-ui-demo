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
  Sunrise,
  Sunset,
  CloudOff,
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

// Helper function to calculate solar-relevant data based on weather
function getSolarData(weather: WeatherData | null) {
  if (!weather) return null;

  const description = weather.description?.toLowerCase() || '';

  // Mock UV Index based on conditions (0-11+ scale)
  let uvIndex = 5;
  if (description.includes('clear') || description.includes('sunny')) {
    uvIndex = 8;
  } else if (description.includes('cloud')) {
    uvIndex = 4;
  } else if (description.includes('rain') || description.includes('storm')) {
    uvIndex = 2;
  }

  // Mock cloud cover percentage
  let cloudCover = 30;
  if (description.includes('clear') || description.includes('sunny')) {
    cloudCover = 10;
  } else if (
    description.includes('partly') ||
    description.includes('scattered')
  ) {
    cloudCover = 50;
  } else if (
    description.includes('cloud') ||
    description.includes('overcast')
  ) {
    cloudCover = 85;
  } else if (description.includes('rain')) {
    cloudCover = 95;
  }

  // Mock sunrise/sunset (these would come from API in production)
  const now = new Date();
  const sunrise = new Date(now);
  sunrise.setHours(6, 30, 0);
  const sunset = new Date(now);
  sunset.setHours(19, 15, 0);

  // Calculate solar efficiency estimate (0-100%)
  const tempFactor = weather.temperature
    ? Math.max(0, 100 - Math.abs(77 - weather.temperature) * 2)
    : 85;
  const cloudFactor = 100 - cloudCover;
  const solarEfficiency = Math.round(tempFactor * 0.3 + cloudFactor * 0.7);

  return {
    uvIndex,
    cloudCover,
    sunrise: sunrise.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    sunset: sunset.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    solarEfficiency,
  };
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-gray-500" />
            Local Weather
          </CardTitle>
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

  const getUVColor = (uvIndex: number) => {
    if (uvIndex <= 2) return { bg: 'bg-green-500', text: 'Low' };
    if (uvIndex <= 5) return { bg: 'bg-yellow-500', text: 'Moderate' };
    if (uvIndex <= 7) return { bg: 'bg-orange-500', text: 'High' };
    if (uvIndex <= 10) return { bg: 'bg-red-500', text: 'Very High' };
    return { bg: 'bg-purple-600', text: 'Extreme' };
  };

  const solarData = getSolarData(weather);
  const uvColor = solarData ? getUVColor(solarData.uvIndex) : null;

  return (
    <Card className="shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-gray-600" />
          Local Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Temperature and Icon */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-900">
                {weather.temperature || '--'}°
                <span className="text-xl text-gray-500">F</span>
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {weather.description || 'No data'}
              </p>
            </div>
            <div>{getWeatherIcon(weather.description || '')}</div>
          </div>

          {/* Solar Production Estimate */}
          {solarData && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-yellow-900">
                  Solar Conditions
                </span>
                <span className="text-lg font-bold text-yellow-900">
                  {solarData.solarEfficiency}%
                </span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${solarData.solarEfficiency}%` }}
                />
              </div>
              <p className="text-xs text-yellow-800 mt-1">
                {solarData.solarEfficiency >= 80
                  ? 'Excellent for production'
                  : solarData.solarEfficiency >= 60
                    ? 'Good production expected'
                    : solarData.solarEfficiency >= 40
                      ? 'Moderate production'
                      : 'Reduced production expected'}
              </p>
            </div>
          )}

          {/* Solar Metrics Grid */}
          {solarData && (
            <div className="grid grid-cols-2 gap-2">
              {/* UV Index */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun className="h-3.5 w-3.5 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">UV Index</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`${uvColor?.bg} w-8 h-8 rounded-md flex items-center justify-center`}
                  >
                    <span className="text-sm font-bold text-white">
                      {solarData.uvIndex}
                    </span>
                  </div>
                  <span className="text-xs text-gray-700">{uvColor?.text}</span>
                </div>
              </div>

              {/* Cloud Cover */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <CloudOff className="h-3.5 w-3.5 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">
                    Cloud Cover
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {solarData.cloudCover}%
                </p>
              </div>

              {/* Sunrise */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sunrise className="h-3.5 w-3.5 text-orange-500" />
                  <p className="text-xs text-gray-600 font-medium">Sunrise</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {solarData.sunrise}
                </p>
              </div>

              {/* Sunset */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sunset className="h-3.5 w-3.5 text-purple-500" />
                  <p className="text-xs text-gray-600 font-medium">Sunset</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {solarData.sunset}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Weather Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-gray-200">
          {weather.humidity && (
            <div className="text-center">
              <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="text-sm font-semibold text-gray-900">
                {weather.humidity}%
              </p>
            </div>
          )}
          {weather.windSpeed && (
            <div className="text-center">
              <Wind className="h-4 w-4 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Wind</p>
              <p className="text-sm font-semibold text-gray-900">
                {weather.windSpeed} mph
              </p>
            </div>
          )}
          {weather.feelsLike && (
            <div className="text-center">
              <Sun className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Feels like</p>
              <p className="text-sm font-semibold text-gray-900">
                {weather.feelsLike}°
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

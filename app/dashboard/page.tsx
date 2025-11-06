'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Battery,
  Zap,
  TrendingUp,
  Home,
  Cpu,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Assistant } from '@/components/ui/assistant';
import { EnergyForecast } from '@/components/ui/energy-forecast';
import { WeatherWidget } from '@/components/ui/weather-widget';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function DashboardPage() {
  const {
    user,
    authorization,
    systems,
    setSystems,
    system,
    setSystem,
    metricsSummary,
    setMetricsSummary,
    forecast,
    setForecast,
  } = useStore();
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !authorization) return;

    const fetchSystems = async () => {
      const systemsData = await api.getSystemsByUser(authorization);
      setSystems(systemsData);
    };

    if (systems.length === 0) {
      fetchSystems();
    }
  }, [user, authorization, systems.length, setSystems]);

  useEffect(() => {
    if (!selectedSystemId || !authorization) return;

    const fetchSystemData = async () => {
      setLoading(true);
      try {
        const [systemDetails, systemForecast, summary, weather, activity] =
          await Promise.all([
            api.getSystemDetails(selectedSystemId, authorization),
            api.getForecast(selectedSystemId, authorization),
            api.getMetricsSummary(
              selectedSystemId,
              new Date().toISOString().split('T')[0],
              authorization
            ),
            api.getSystemWeather(selectedSystemId, authorization),
            api.getActivityHistory(selectedSystemId, authorization),
          ]);

        // Add weather and activity to system details
        const enrichedSystem = {
          ...systemDetails,
          weather,
          activityHistory: activity,
        };

        setSystem(enrichedSystem);
        setForecast(systemForecast);
        setMetricsSummary(summary);
      } catch (error) {
        console.error('Error fetching system data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
  }, [
    selectedSystemId,
    authorization,
    setSystem,
    setForecast,
    setMetricsSummary,
  ]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to view your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-28 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold py-6">Solar System Dashboard</h1>

      {/* System Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
            Select Your Solar System
          </CardTitle>
          <CardDescription>
            A system represents a solar panel installation at a specific
            location. Choose one to view its performance data and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={setSelectedSystemId}
            value={selectedSystemId || undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select a system --" />
            </SelectTrigger>
            <SelectContent>
              {systems.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-purple-600" />
                    <span>
                      {s.address}, {s.city}, {s.state}, {s.zip}, {s.country}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSystemId && !loading && (
        <>
          {/* 7 Day Performance Forecast */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              7 Day Performance Forecast
            </h2>
            <EnergyForecast forecast={forecast} systemId={selectedSystemId} />
          </div>

          {/* Current System Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Current System Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              {/* Current Energy Performance - Calculator Style */}
              <Card className="lg:col-span-3 shadow-sm flex flex-col">
                <CardHeader className="pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Current Energy Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6 flex-1 flex items-stretch">
                  <div className="grid md:grid-cols-3 gap-4 w-full">
                    {/* Daily */}
                    <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex flex-col justify-between">
                      <p className="text-sm text-blue-900 font-medium">Daily</p>

                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-3xl font-bold text-blue-900">
                          {metricsSummary?.daily?.total_energy_produced?.toFixed(
                            2
                          ) || '0.00'}{' '}
                          kWh
                        </p>
                        <p className="text-xs text-blue-700 mb-3">Produced</p>
                        <p className="text-2xl font-semibold text-blue-800">
                          {metricsSummary?.daily?.total_energy_consumed?.toFixed(
                            2
                          ) || '0.00'}{' '}
                          kWh
                        </p>
                        <p className="text-xs text-blue-700">Consumed</p>
                      </div>

                      {(() => {
                        const produced =
                          metricsSummary?.daily?.total_energy_produced || 0;
                        const consumed =
                          metricsSummary?.daily?.total_energy_consumed || 0;
                        const net = produced - consumed;
                        const isPositive = net >= 0;

                        return (
                          <div
                            className={`pt-3 border-t border-blue-300 flex items-center gap-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}
                          >
                            {isPositive ? (
                              <ArrowUp className="h-5 w-5" />
                            ) : (
                              <ArrowDown className="h-5 w-5" />
                            )}
                            <div>
                              <p className="text-base font-bold">
                                {Math.abs(net).toFixed(2)} kWh
                              </p>
                              <p className="text-xs">
                                {isPositive ? 'Net savings' : 'Net deficit'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Weekly */}
                    <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 flex flex-col justify-between">
                      <p className="text-sm text-purple-900 font-medium">
                        Weekly
                      </p>

                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-3xl font-bold text-purple-900">
                          {metricsSummary?.weekly?.total_energy_produced?.toFixed(
                            2
                          ) || '0.00'}{' '}
                          kWh
                        </p>
                        <p className="text-xs text-purple-700 mb-3">Produced</p>
                        <p className="text-2xl font-semibold text-purple-800">
                          {metricsSummary?.weekly?.total_energy_consumed?.toFixed(
                            2
                          ) || '0.00'}{' '}
                          kWh
                        </p>
                        <p className="text-xs text-purple-700">Consumed</p>
                      </div>

                      {(() => {
                        const produced =
                          metricsSummary?.weekly?.total_energy_produced || 0;
                        const consumed =
                          metricsSummary?.weekly?.total_energy_consumed || 0;
                        const net = produced - consumed;
                        const isPositive = net >= 0;

                        return (
                          <div
                            className={`pt-3 border-t border-purple-300 flex items-center gap-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}
                          >
                            {isPositive ? (
                              <ArrowUp className="h-5 w-5" />
                            ) : (
                              <ArrowDown className="h-5 w-5" />
                            )}
                            <div>
                              <p className="text-base font-bold">
                                {Math.abs(net).toFixed(2)} kWh
                              </p>
                              <p className="text-xs">
                                {isPositive ? 'Net savings' : 'Net deficit'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Monthly */}
                    <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex flex-col justify-between">
                      <p className="text-sm text-green-900 font-medium">
                        Monthly
                      </p>

                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-3xl font-bold text-green-900">
                          {metricsSummary?.monthly?.total_energy_produced?.toFixed(
                            2
                          ) || '0.00'}{' '}
                          kWh
                        </p>
                        <p className="text-xs text-green-700 mb-3">Produced</p>
                        <p className="text-2xl font-semibold text-green-800">
                          {metricsSummary?.monthly?.total_energy_consumed?.toFixed(
                            2
                          ) || '0.00'}{' '}
                          kWh
                        </p>
                        <p className="text-xs text-green-700">Consumed</p>
                      </div>

                      {(() => {
                        const produced =
                          metricsSummary?.monthly?.total_energy_produced || 0;
                        const consumed =
                          metricsSummary?.monthly?.total_energy_consumed || 0;
                        const net = produced - consumed;
                        const isPositive = net >= 0;

                        return (
                          <div
                            className={`pt-3 border-t border-green-300 flex items-center gap-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}
                          >
                            {isPositive ? (
                              <ArrowUp className="h-5 w-5" />
                            ) : (
                              <ArrowDown className="h-5 w-5" />
                            )}
                            <div>
                              <p className="text-base font-bold">
                                {Math.abs(net).toFixed(2)} kWh
                              </p>
                              <p className="text-xs">
                                {isPositive ? 'Net savings' : 'Net deficit'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Card */}
              <WeatherWidget weather={system?.weather || null} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* 30 Day Performance History */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <CardTitle>30 Day Performance History</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Produced</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Consumed</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-0">
                  {system?.activityHistory?.pastMonth &&
                  system.activityHistory.pastMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={[...system.activityHistory.pastMonth].reverse()}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                          domain={[0, 'auto']}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString();
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total_energy_produced"
                          name="Produced (kWh)"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ fill: '#22c55e', r: 4 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="total_energy_consumed"
                          name="Consumed (kWh)"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      {system?.activityHistory
                        ? 'No data points available'
                        : 'Loading...'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Components & Battery Storage */}
              <div className="space-y-4">
                {/* System Components Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-purple-600" />
                      System Components
                    </CardTitle>
                    <CardDescription>Installed hardware status</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <TooltipProvider>
                      <div className="space-y-3">
                        {system?.components?.map(
                          (
                            c: {
                              name: string;
                              active: boolean;
                              product_id?: string;
                            },
                            idx: number
                          ) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="shrink-0">
                                    {c.active ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {c.active
                                      ? 'Active and operational'
                                      : 'Inactive or offline'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Link
                                href={
                                  c.product_id
                                    ? `/products/${c.product_id}`
                                    : '/products'
                                }
                                className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                              >
                                {c.name}
                              </Link>
                            </div>
                          )
                        )}
                      </div>
                    </TooltipProvider>
                  </CardContent>
                </Card>

                {/* Battery Storage Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Battery
                        className={`h-5 w-5 ${
                          (system?.battery_storage || 0) > 60
                            ? 'text-green-600'
                            : (system?.battery_storage || 0) > 30
                              ? 'text-orange-500'
                              : 'text-red-500'
                        }`}
                      />
                      Battery Storage
                    </CardTitle>
                    <CardDescription>Current charge level</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {system?.battery_storage || 0}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          of total capacity
                        </p>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                            (system?.battery_storage || 0) > 60
                              ? 'bg-linear-to-r from-green-500 to-green-600'
                              : (system?.battery_storage || 0) > 30
                                ? 'bg-linear-to-r from-orange-400 to-orange-500'
                                : 'bg-linear-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${system?.battery_storage || 0}%` }}
                        />
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            (system?.battery_storage || 0) > 60
                              ? 'bg-green-500'
                              : (system?.battery_storage || 0) > 30
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                          }`}
                        />
                        <span className="text-gray-600">
                          {(system?.battery_storage || 0) > 60
                            ? 'Good charge level'
                            : (system?.battery_storage || 0) > 30
                              ? 'Moderate charge level'
                              : 'Low charge level'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {loading && <LoadingOverlay message="Loading your solar system data" />}

      {/* Floating Assistant Button - Only show when system is selected */}
      {selectedSystemId && <Assistant />}
    </div>
  );
}

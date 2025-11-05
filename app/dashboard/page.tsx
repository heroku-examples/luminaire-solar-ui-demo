'use client';

import { useState, useEffect } from 'react';
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
  Tooltip,
} from 'recharts';
import { Battery, Zap, TrendingUp, Home } from 'lucide-react';
import { Assistant } from '@/components/ui/assistant';
import { EnergyForecast } from '@/components/ui/energy-forecast';
import { WeatherWidget } from '@/components/ui/weather-widget';

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
  const [performanceTimeFrame, setPerformanceTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
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
      <h1 className="text-3xl font-bold py-6">Solar Panel Activity</h1>
      
      {/* System Selector */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          System Location
        </span>
        <Select
          onValueChange={setSelectedSystemId}
          value={selectedSystemId || undefined}
        >
          <SelectTrigger className="w-full max-w-2xl">
            <SelectValue placeholder="-- Select a system --" />
          </SelectTrigger>
          <SelectContent>
            {systems.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{s.address}, {s.city}, {s.state}, {s.zip}, {s.country}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSystemId && !loading && (
        <>
          {/* 7 Day Performance Forecast */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              7 Day Performance Forecast
            </h2>
            <EnergyForecast
              forecast={forecast}
              systemId={selectedSystemId}
            />
          </div>

          {/* Current System Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Current System Information
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              {/* Performance Card */}
              <Card className="lg:col-span-3 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <CardTitle>Performance</CardTitle>
                    </div>
                    <div className="inline-flex items-center rounded-lg border bg-muted p-1">
                      <button
                        onClick={() => setPerformanceTimeFrame('daily')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          performanceTimeFrame === 'daily'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setPerformanceTimeFrame('weekly')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          performanceTimeFrame === 'weekly'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Last 7 Days
                      </button>
                      <button
                        onClick={() => setPerformanceTimeFrame('monthly')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          performanceTimeFrame === 'monthly'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Last 30 Days
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Energy Output
                      </p>
                      <p className="text-2xl font-bold">
                        {metricsSummary?.[performanceTimeFrame]?.total_energy_produced?.toLocaleString() || 0}{' '}
                        <span className="text-sm font-normal text-muted-foreground">kWh</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Energy Usage
                      </p>
                      <p className="text-2xl font-bold">
                        {metricsSummary?.[performanceTimeFrame]?.total_energy_consumed?.toLocaleString() || 0}{' '}
                        <span className="text-sm font-normal text-muted-foreground">kWh</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Energy Savings
                      </p>
                      <p className={`text-2xl font-bold ${
                        ((metricsSummary?.[performanceTimeFrame]?.total_energy_produced || 0) -
                         (metricsSummary?.[performanceTimeFrame]?.total_energy_consumed || 0)) < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {(
                          (metricsSummary?.[performanceTimeFrame]?.total_energy_produced || 0) -
                          (metricsSummary?.[performanceTimeFrame]?.total_energy_consumed || 0)
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        <span className="text-sm font-normal text-muted-foreground">kWh</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Battery Storage Card */}
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Battery Storage
                  </CardTitle>
                  <Battery className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{system?.battery_storage || 0}%</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    of total capacity
                  </p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${system?.battery_storage || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* 30 Day Performance History */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <CardTitle>30 Day Performance History</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Output</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Usage</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {system?.activityHistory?.pastMonth && system.activityHistory.pastMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={system.activityHistory.pastMonth}
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
                        <Tooltip
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
                          name="Output (kWh)"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ fill: '#22c55e', r: 4 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="total_energy_consumed"
                          name="Usage (kWh)"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      {system?.activityHistory ? 'No data points available' : 'Loading...'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Components & Weather */}
              <div className="space-y-4">
                {/* System Components Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      System Components
                    </CardTitle>
                    <CardDescription>Installed hardware status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {system?.components?.map((c: { name: string; active: boolean }, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              c.active ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="text-sm">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Card */}
                <WeatherWidget weather={system?.weather || null} />
              </div>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">
            Loading system data...
          </div>
        </div>
      )}

      {/* Floating Assistant Button */}
      <Assistant />
    </div>
  );
}

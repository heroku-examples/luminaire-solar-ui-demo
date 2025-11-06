'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { MetricsSummary } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormulaBlock } from '@/components/ui/code-block';
import { LoadingCard } from '@/components/ui/loading-overlay';
import { formatCurrency } from '@/lib/format';
import {
  Home,
  DollarSign,
  Zap,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function SolarCalculatorPage() {
  const router = useRouter();
  const { user, authorization, systems, setSystems } = useStore();
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [metricsSummary, setMetricsSummary] = useState<MetricsSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // User inputs
  const [electricityRate, setElectricityRate] = useState(0.12);
  const [systemSize, setSystemSize] = useState(7.0);
  const [systemCost, setSystemCost] = useState(21000);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch systems
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

  // Fetch system metrics
  useEffect(() => {
    if (!selectedSystemId || !authorization) return;

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const summary = await api.getMetricsSummary(
          selectedSystemId,
          new Date().toISOString().split('T')[0],
          authorization
        );
        setMetricsSummary(summary);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedSystemId, authorization]);

  if (!user) {
    return null;
  }

  // Calculate values
  const dailyProduced = metricsSummary?.daily?.total_energy_produced || 0;
  const dailyConsumed = metricsSummary?.daily?.total_energy_consumed || 0;
  const weeklyProduced = metricsSummary?.weekly?.total_energy_produced || 0;
  const weeklyConsumed = metricsSummary?.weekly?.total_energy_consumed || 0;
  const monthlyProduced = metricsSummary?.monthly?.total_energy_produced || 0;
  const monthlyConsumed = metricsSummary?.monthly?.total_energy_consumed || 0;

  const solarOffset =
    dailyConsumed > 0 ? (dailyProduced / dailyConsumed) * 100 : 0;
  const dailySavings = dailyProduced * electricityRate;
  const weeklySavings = weeklyProduced * electricityRate;
  const monthlySavings = monthlyProduced * electricityRate;
  const annualSavings = monthlySavings * 12;

  const paybackPeriod =
    systemCost > 0 && annualSavings > 0 ? systemCost / annualSavings : 0;
  const savings25Year = annualSavings * 25 - systemCost;
  const roi = systemCost > 0 ? (savings25Year / systemCost) * 100 : 0;

  const dailyNet = dailyProduced - dailyConsumed;
  const weeklyNet = weeklyProduced - weeklyConsumed;
  const monthlyNet = monthlyProduced - monthlyConsumed;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-28">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Solar Energy Calculator</h1>
          <p className="text-xl text-gray-600">
            Real-Time Analysis of Your Solar Performance
          </p>
        </div>

        {/* System Selector */}
        <Card>
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
              location. Choose one to analyze its performance and savings.
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
                        {s.address}, {s.city}, {s.state}, {s.zip}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!selectedSystemId ? (
          <Card className="bg-blue-50 border-2 border-blue-200">
            <CardContent className="p-6 text-center">
              <p className="text-blue-900">
                Please select a system above to see your personalized
                calculations
              </p>
            </CardContent>
          </Card>
        ) : loading ? (
          <LoadingCard message="Loading your system metrics" />
        ) : (
          <>
            {/* Configuration Inputs - Sticky */}
            <div className="sticky top-0 z-50 pt-4 pb-4 bg-white">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Calculator Settings
                  </CardTitle>
                  <CardDescription>
                    Adjust these values to customize your calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="electricity-rate">
                        Electricity Rate ($/kWh)
                      </Label>
                      <Input
                        id="electricity-rate"
                        type="number"
                        step="0.01"
                        value={electricityRate}
                        onChange={(e) => {
                          const val =
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value);
                          setElectricityRate(isNaN(val) ? 0 : val);
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="system-size">System Size (kW)</Label>
                      <Input
                        id="system-size"
                        type="number"
                        step="0.1"
                        value={systemSize}
                        onChange={(e) => {
                          const val =
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value);
                          setSystemSize(isNaN(val) ? 0 : val);
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="system-cost">Total System Cost ($)</Label>
                      <Input
                        id="system-cost"
                        type="number"
                        step="100"
                        value={systemCost}
                        onChange={(e) => {
                          const val =
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value);
                          setSystemCost(isNaN(val) ? 0 : val);
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Energy Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  1. Current Energy Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      Daily
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {dailyProduced.toFixed(2)} kWh
                    </p>
                    <p className="text-xs text-blue-700 mt-1">Produced</p>
                    <p className="text-xl font-semibold text-blue-800 mt-2">
                      {dailyConsumed.toFixed(2)} kWh
                    </p>
                    <p className="text-xs text-blue-700">Consumed</p>

                    {(() => {
                      const net = dailyNet;
                      const isPositive = net >= 0;

                      return (
                        <div
                          className={`mt-3 pt-3 border-t border-blue-300 flex items-center gap-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">
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
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900 font-medium mb-2">
                      Weekly
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {weeklyProduced.toFixed(2)} kWh
                    </p>
                    <p className="text-xs text-purple-700 mt-1">Produced</p>
                    <p className="text-xl font-semibold text-purple-800 mt-2">
                      {weeklyConsumed.toFixed(2)} kWh
                    </p>
                    <p className="text-xs text-purple-700">Consumed</p>

                    {(() => {
                      const net = weeklyNet;
                      const isPositive = net >= 0;

                      return (
                        <div
                          className={`mt-3 pt-3 border-t border-purple-300 flex items-center gap-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">
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
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 font-medium mb-2">
                      Monthly
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {monthlyProduced.toFixed(2)} kWh
                    </p>
                    <p className="text-xs text-green-700 mt-1">Produced</p>
                    <p className="text-xl font-semibold text-green-800 mt-2">
                      {monthlyConsumed.toFixed(2)} kWh
                    </p>
                    <p className="text-xs text-green-700">Consumed</p>

                    {(() => {
                      const net = monthlyNet;
                      const isPositive = net >= 0;

                      return (
                        <div
                          className={`mt-3 pt-3 border-t border-green-300 flex items-center gap-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">
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

            {/* Solar Offset Percentage */}
            <Card>
              <CardHeader>
                <CardTitle>2. Solar Offset Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormulaBlock
                  formulas={[
                    'Solar Offset % = (Solar Production / Total Energy Needs) × 100',
                  ]}
                />
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                  <p className="text-sm text-green-800 mb-2">
                    Your Solar Offset:
                  </p>
                  <p className="text-4xl font-bold text-green-900">
                    {solarOffset.toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {solarOffset >= 100
                      ? '🎉 Your system produces more than you consume!'
                      : solarOffset >= 80
                        ? '✓ Excellent coverage of your energy needs'
                        : solarOffset >= 50
                          ? '✓ Good solar coverage'
                          : 'Consider expanding your system for better coverage'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Savings */}
            <FormulaBlock
              title="3. Financial Savings Calculation"
              formulas={[
                'Daily Savings = Solar Production (kWh) × Local Electricity Rate',
                'Weekly Savings = Weekly Production × Electricity Rate',
                'Monthly Savings = Monthly Production × Electricity Rate',
                'Annual Savings = Monthly Savings × 12 months',
              ]}
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-700 mb-1">Daily Savings</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(dailySavings)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <p className="text-xs text-purple-700 mb-1">Weekly Savings</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(weeklySavings)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-700 mb-1">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(monthlySavings)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-700 mb-1">Annual Projection</p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(annualSavings)}
                </p>
              </div>
            </div>

            {/* Net Energy Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>4. Net Energy Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormulaBlock
                  formulas={[
                    'Net Energy = Total Solar Production - Total Energy Consumed',
                  ]}
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <div
                    className={`rounded-lg p-4 border-2 ${
                      dailyNet >= 0
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        dailyNet >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      Daily Net Energy
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        dailyNet >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {dailyNet >= 0 ? '+' : ''}
                      {dailyNet.toFixed(2)} kWh
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        dailyNet >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {dailyNet >= 0 ? 'Excess' : 'Grid Dependent'}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-4 border-2 ${
                      weeklyNet >= 0
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        weeklyNet >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      Weekly Net Energy
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        weeklyNet >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {weeklyNet >= 0 ? '+' : ''}
                      {weeklyNet.toFixed(2)} kWh
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        weeklyNet >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {weeklyNet >= 0 ? 'Excess' : 'Grid Dependent'}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-4 border-2 ${
                      monthlyNet >= 0
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        monthlyNet >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      Monthly Net Energy
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        monthlyNet >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {monthlyNet >= 0 ? '+' : ''}
                      {monthlyNet.toFixed(2)} kWh
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {monthlyNet >= 0 ? 'Excess' : 'Grid Dependent'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  5. Return on Investment (ROI)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormulaBlock
                  formulas={[
                    'Payback Period = Total System Cost / Annual Savings',
                    '25-Year Savings = (Annual Savings × 25 years) - System Cost',
                    'ROI % = ((25-Year Savings) / System Cost) × 100',
                  ]}
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-6">
                    <p className="text-sm text-amber-800 mb-2">
                      Payback Period
                    </p>
                    <p className="text-3xl font-bold text-amber-900">
                      {paybackPeriod > 0 ? paybackPeriod.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">years</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6">
                    <p className="text-sm text-green-800 mb-2">
                      25-Year Savings
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {savings25Year > 0 ? formatCurrency(savings25Year) : '$0'}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      total net savings
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-6">
                    <p className="text-sm text-blue-800 mb-2">ROI</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {roi > 0 ? roi.toFixed(0) : '0'}%
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      return on investment
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    {paybackPeriod > 0 && paybackPeriod < 12
                      ? `✓ Excellent payback period! Your system will pay for itself in ${paybackPeriod.toFixed(1)} years.`
                      : paybackPeriod >= 12 && paybackPeriod < 20
                        ? `Good investment with a ${paybackPeriod.toFixed(1)} year payback period.`
                        : 'Adjust your settings or system cost to see estimated ROI.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your Solar Performance Summary
                    </h3>
                    <p className="text-gray-700">
                      These calculations are based on your actual system data
                      and the settings you've configured above. Chat with our AI
                      assistant on your dashboard for deeper insights and
                      personalized recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

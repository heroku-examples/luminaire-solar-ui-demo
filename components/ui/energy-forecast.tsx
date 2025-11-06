'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { DollarSign, Zap } from 'lucide-react';

interface ForecastItem {
  date: string;
  irradiation: number;
}

interface EnergyForecastProps {
  forecast?: ForecastItem[] | null;
  systemId?: string;
  className?: string;
}

/*
  Energy forecast component that includes 7-day efficiency forecast, and
  AI agent analysis of system performance with respect to the 7-day
  efficiency forecast.
*/
export function EnergyForecast({
  forecast,
  systemId,
  className,
}: EnergyForecastProps) {
  return (
    <div className={className}>
      <div className="grid grid-flow-col grid-cols-2 gap-4">
        <MiaAnalysis forecast={forecast} systemId={systemId} />
        <EfficiencyForecast forecast={forecast} />
      </div>
    </div>
  );
}

interface AnalysisData {
  efficiency: string;
  analysis: string;
  averageIrradiation: number;
}

// AI Analysis Component
function MiaAnalysis({
  forecast,
  systemId,
}: {
  forecast?: ForecastItem[] | null;
  systemId?: string;
}) {
  if (!forecast) return <div></div>;

  const { authorization } = useStore();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processStream = async (stream: ReadableStream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
      // Use a regex to match all complete JSON objects in the result.
      const jsonMatches = result.match(/{[\s\S]*?}/g);
      let analysisObj = null;
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          try {
            const parsed = JSON.parse(jsonStr);
            // Look for the JSON object with the required keys.
            if (
              Object.prototype.hasOwnProperty.call(parsed, 'efficiency') &&
              Object.prototype.hasOwnProperty.call(parsed, 'analysis') &&
              Object.prototype.hasOwnProperty.call(parsed, 'averageIrradiation')
            ) {
              analysisObj = parsed;
              break;
            }
          } catch (_e) {
            // Ignore parse errors and continue
          }
        }
      }
      if (analysisObj) {
        setAnalysisData(analysisObj);
      } else {
        console.warn('No valid analysis object found in the stream.');
      }
    } catch (error) {
      console.error('Error processing stream:', error);
    } finally {
      reader.releaseLock();
    }
  };

  // Trigger the analysis when forecast changes.
  useEffect(() => {
    if (!forecast || !authorization || !systemId) return;

    async function runAnalysis() {
      if (!authorization || !systemId) return; // Type guard for TypeScript

      setAnalysisData(null);
      setError(null);

      try {
        const response = await api.generateForecastAnalysis(
          systemId,
          forecast as ForecastItem[],
          authorization
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Analysis service temporarily unavailable');
          }
          throw new Error(`Unable to analyze forecast (${response.status})`);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await processStream(response.body!);
      } catch (error) {
        let errorMessage = 'Failed to connect to analysis service';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error instanceof TypeError) {
          errorMessage = 'Network connection failed';
        }
        console.error('AI analysis error:', error);
        setError(errorMessage);
      }
    }

    runAnalysis();
  }, [forecast, systemId, authorization]);

  return (
    <AnalysisDisplay
      analysis={{ source: 'Heroku AI', agentAnalysis: analysisData }}
      error={error}
    />
  );
}

// Analysis Display Component
function AnalysisDisplay({
  analysis,
  error,
}: {
  analysis: { source: string; agentAnalysis: AnalysisData | null };
  error?: string | null;
}) {
  const { source, agentAnalysis } = analysis;

  function generateAnalysisColor(efficiency: string, opacity: number) {
    let color = 'white';
    const lcEfficiency = efficiency.toLowerCase();
    if (lcEfficiency === 'excellent') {
      color = `rgba(3, 182, 101, ${opacity ?? 1})`;
    } else if (lcEfficiency === 'fair') {
      color = `rgba(250, 159, 71, ${opacity ?? 1})`;
    } else if (lcEfficiency === 'very low') {
      color = `rgba(214, 65, 65, ${opacity ?? 1})`;
    }
    return color;
  }

  return (
    <div className="col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="w-full flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold leading-none tracking-tight text-gray-900">
          7 day predicted energy savings
        </h3>
      </div>
      {error ? (
        <div className="flex flex-col items-center justify-center px-3 py-2 bg-red-50 border border-red-300 rounded-md text-center">
          <div className="shrink-0 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center mb-2">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      ) : !agentAnalysis ? (
        <div className="flex flex-col items-center justify-center px-3 py-2 animate-pulse">
          <div className="shrink-0 h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center mb-2">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-700 font-medium text-center">
            Predicting your system&apos;s efficiency...
          </p>
        </div>
      ) : (
        <div
          className="px-3 py-2 rounded-md border-2"
          style={{
            borderColor: generateAnalysisColor(agentAnalysis.efficiency, 0.3),
            backgroundColor: generateAnalysisColor(
              agentAnalysis.efficiency,
              0.1
            ),
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
              style={{
                background: generateAnalysisColor(agentAnalysis.efficiency, 1),
              }}
            >
              <span className="text-white font-bold">✓</span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{
                color: generateAnalysisColor(agentAnalysis.efficiency, 1),
              }}
            >
              {agentAnalysis.efficiency}
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-snug">
            {agentAnalysis.analysis}
          </p>
        </div>
      )}
      <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-600 italic">powered by {source}</p>
        <Image
          src="/mia-icon.png"
          alt="Mia AI"
          width={14}
          height={14}
          className="inline-block"
        />
      </div>
    </div>
  );
}

// Efficiency Forecast Component (7 day bars)
function EfficiencyForecast({
  forecast,
}: {
  forecast?: ForecastItem[] | null;
}) {
  if (!forecast) return null;

  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  return (
    <div className="col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold leading-none tracking-tight text-gray-900">
          7 day solar production forecast
        </h3>
      </div>
      <div className="grid grid-flow-col grid-cols-[auto-fill] overflow-x-auto">
        {forecast.map((day) => {
          const date = new Date(day.date);
          const dayOfWeekNumber = date.getDay();

          // calculate the height of the progress bar
          const cappedIrradiation = Math.min(day.irradiation || 0, 6);
          const efficiencyPercentage = cappedIrradiation / 6;
          const barHeight = 2; // height of the full bar in rem
          const fillHeight = Math.max(barHeight * efficiencyPercentage, 0.2);
          let color;
          if (cappedIrradiation >= 4) {
            color = '#03B665';
          } else if (cappedIrradiation >= 2) {
            color = '#FA9F47';
          } else {
            color = '#D64141';
          }

          return (
            <div
              key={`forecast-${day.date}`}
              className="flex justify-center border-r border-gray-200 px-5 last:border-none"
            >
              <div className="w-2/5" style={{ minWidth: `${barHeight}rem` }}>
                <div
                  className="bg-gray-100 relative rounded-md"
                  style={{ height: `${barHeight}rem` }}
                >
                  <div
                    className={`w-full bg-black absolute bottom-0 left-0 right-0 ${
                      cappedIrradiation === 6 ? 'rounded-md' : 'rounded-b-md'
                    }`}
                    style={{
                      height: `${fillHeight}rem`,
                      background: color,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-900 font-semibold text-center pt-1 capitalize">
                  {dayOfWeek[dayOfWeekNumber]}
                </p>
                <p className="text-xs text-gray-700 text-center font-medium">
                  {day.irradiation?.toFixed(1) || '0.0'}
                </p>
                <p className="text-[10px] text-gray-600 text-center">kWh/m²</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-700 mt-3 text-center font-medium">
        Solar irradiation measures energy from the sun in kilowatt-hours per
        square meter
      </p>
    </div>
  );
}

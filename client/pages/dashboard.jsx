import { useState, useEffect } from 'react';

import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import TooltipIcon from '../components/icons/TooltipIcon';
import { EnergyStats } from '@/components/ui/EnergyStats.jsx';
import { EnergyForecast } from '../components/ui/EnergyForecast';

export function getMeta(ctx) {
  return {
    title: `${title} - Dashboard`,
  };
}

export default function Dashboard() {
  const { snapshot, state, actions } = useRouteContext();
  const [system, setSystem] = useState(null);
  const [performanceTimeFrame, setPerformanceTimeFrame] = useState('daily');
  const [activityData, setActivityData] = useState(null);

  const handlePerformanceTimeFrameChange = (option) => {
    setPerformanceTimeFrame(option);
  };

  const handleSetSystem = (value) => {
    setSystem(value);
  };

  useEffect(() => {
    async function fetchForecast() {
      if (!system) return;
      await actions.getForecastBySystem(state, system);
    }
    fetchForecast();
  }, [system]);

  // if (!state.user) {
  //   throw new Error('Unauthorized');
  // }

  // Get systems by user
  useEffect(() => {
    async function fetchSystems() {
      if (!state.user) return;
      await actions.getSystemsByUser(state);
    }
    fetchSystems();
  }, [state]);

  useEffect(() => {
    async function fetchSystemDetails() {
      if (!system) return;
      await actions.getSystemDetailsBySystem(state, system);
      await actions.getSystemWeatherBySystem(state, system);
      await actions.getActivityHistoryBySystem(state, system);
    }
    fetchSystemDetails();
  }, [system]);

  // Get metrics by system
  useEffect(() => {
    async function fetchMetrics() {
      if (!system) return;
      await actions.getMetricsSummaryBySystem(
        state,
        system,
        new Date().toISOString().split('T')[0]
      );
      setPerformanceTimeFrame('daily');
    }
    fetchMetrics();
  }, [system]);

  return (
    <div className="pb-28">
      <h1 className="text-h3 font-semibold py-6">Solar Panel Activity</h1>
      <div className="flex items-center w-full">
        <p className="capitalize mr-4 text-h5 font-semibold text-dark-grey">
          System Location
        </p>
        <div className="relative flex-grow">
          <select
            className="w-full appearance-none pl-3 pr-8 my-2 relative"
            onChange={(value, _option) => {
              const systemId = value.target.selectedOptions[0].value;
              handleSetSystem(systemId);
            }}
            defaultValue={'null'}
          >
            <option disabled value="null">
              {' '}
              -- Select a system --{' '}
            </option>
            {snapshot.systems.map((s) => {
              return (
                <option value={s.id} key={`dashboard-list-${s.id}`}>
                  {`🏡 ${s.address}, ${s.city}, ${s.state}, ${s.zip}, ${s.country}`}
                </option>
              );
            })}
          </select>
          <div className="absolute top-2.5 right-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="black"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="black"
              className="h-5 w-5 absolute top-0 right-0 translate-y-1/4 text-slate-700 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          </div>
        </div>
      </div>
      {system && (
        <>
          <h2 className="text-dark-grey font-bold text-md mt-8">
            7 Day Performance Forecast
          </h2>
          <EnergyForecast
            forecast={snapshot.forecast}
            systemId={system}
            className="mt-4"
          />
          <h2 className="text-dark-grey text-md font-bold mt-8">
            Current System Information
          </h2>
          <div className="grid grid-flow-row grid-cols-4 gap-x-6 gap-y-3 mt-3">
            <LargeMetricsCard
              title={'Performance'}
              metrics={snapshot?.metricsSummary}
              timeFrame={performanceTimeFrame}
              handleTimeFrameChange={handlePerformanceTimeFrameChange}
            />
            <MetricCard
              title="Battery Storage"
              value={snapshot?.system?.battery_storage}
              unit={'%'}
              tooltip="Percentage of total capacity."
            />
            <ActivityHistoryCard
              activityHistory={snapshot?.system?.activityHistory}
            />
            <SystemComponentsCard
              components={snapshot?.system?.components}
              tooltip="List of installed components"
            />
            <WeatherCard
              weather={snapshot?.system?.weather}
              tooltip="Based on your general location."
            />
          </div>
        </>
      )}
    </div>
  );
}

const TooltipComponent = ({ children }) => {
  return (
    <div className="relative">
      <TooltipIcon />
      <div className="peer absolute top-0 left-0 w-full h-full cursor-pointer"></div>
      <div className="invisible peer-hover:visible peer-hover:z-10 absolute top-0 left-0 -translate-x-3/4 -translate-y-[125%] bg-dark-grey text-lightest-grey py-0.5 px-2 rounded-md text-nowrap drop-shadow-md">
        {children}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, unit, tooltip, inverseProgress }) => {
  if (value === null || value === undefined) return <></>;
  /* progress indicator color determined by percentage breakpoints */
  let bp = inverseProgress ? 100 - value : value; // inverse colours
  let progressColor = '#D64141';
  if (bp > 66) {
    progressColor = '#03B665';
  } else if (bp > 33) {
    progressColor = '#FA9F47';
  }

  const fillWidth = Math.min((value / 100) * 11, 11); // width of filled bar in rems; 11 rem max width
  return (
    <div className="col-span-1 ">
      <div className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex justify-between">
          <h2 className="text-h5 text-dark-grey font-semibold">{title}</h2>
          <TooltipComponent>{tooltip}</TooltipComponent>
        </div>
        <p className="text-h3 mt-4 font-semibold">
          {value} {unit}
        </p>
        {unit === '%' && (
          <div className="bg-light-grey w-44 h-2 rounded-full mt-4">
            <div
              className="h-2 rounded-full"
              style={{
                backgroundColor: progressColor,
                width: `${fillWidth}rem`,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

const LargeMetricsCard = ({
  title,
  metrics,
  timeFrame,
  handleTimeFrameChange,
  selectOptions,
}) => {
  //default if no options provided
  const defaultOptions = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'Last 7 Days' },
    { value: 'monthly', label: 'Last 30 Days' },
  ];

  const effectiveOptions = selectOptions || defaultOptions;

  if (!metrics) return <></>;
  return (
    <div className="col-span-3">
      <div className="w-full h-full p-6 flex gap-3 justify-between bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex flex-col justify-start gap-5 relative">
          <p className="font-bold text-dark-grey text-h5">{title}</p>
          <div className="flex items-center rounded-md border border-light-grey cursor-pointer">
            <select
              value={timeFrame}
              onChange={(e) => handleTimeFrameChange(e.target.value)}
              className="h-9 bg-transparent p-1 appearance-none focus:outline-none"
            >
              {effectiveOptions.map((option, idx) => (
                <option className="" key={`option-${idx}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="black"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="black"
              className="h-5 w-5 text-slate-700 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          </div>
        </div>
        <div className="w-52 flex flex-col justify-start gap-5">
          <p className="text-dark-grey">Total Energy Output</p>
          <p className="text-3xl font-semibold whitespace-nowrap">
            {metrics?.[timeFrame]?.total_energy_produced.toLocaleString(
              'en-US'
            )}{' '}
            kWh
          </p>
        </div>
        <div className="w-52 flex flex-col justify-start gap-5">
          <p className="text-dark-grey">Total Energy Usage</p>
          <p className="text-3xl font-semibold whitespace-nowrap">
            {metrics?.[timeFrame]?.total_energy_consumed.toLocaleString(
              'en-US'
            )}{' '}
            kWh
          </p>
        </div>
        <div className="w-52 flex flex-col justify-start gap-5">
          <p className="text-dark-grey">Total Energy Savings</p>
          <p className="text-3xl font-semibold whitespace-nowrap">
            {(
              metrics?.[timeFrame]?.total_energy_produced -
              metrics?.[timeFrame]?.total_energy_consumed
            ).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            kWh
          </p>
        </div>
      </div>
    </div>
  );
};

const WeatherCard = ({ weather, tooltip }) => {
  if (!weather) return <></>;
  return (
    <div className="col-span-1">
      <div className="w-full h-40 p-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Local Weather</h2>
          <TooltipComponent>{tooltip}</TooltipComponent>
        </div>
        <p className="text-4xl mt-4 font-semibold">
          {weather.temperature}&deg; <span className="text-dark-grey">F</span>
        </p>
        <p className="text-sm mt-2 capitalize">{weather.description}</p>
      </div>
    </div>
  );
};

const ActivityHistoryCard = ({ activityHistory }) => {
  if (!activityHistory) return <></>;
  return (
    <div className="col-span-2">
      <div className="w-full min-h-[400px] px-6 pt-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex justify-between">
          <h2 className="text-h5 font-semibold capitalize text-dark-grey">
            30 Day Performance History
          </h2>
          <div className="flex gap-3 items-center">
            <div className="flex gap-1 items-center">
              <span className="text-[#82ca9d] text-lg font-bold mb-1">o</span>
              <p>Output</p>
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-[#8884d8] text-lg font-bold mb-1">o</span>
              <p>Usage</p>
            </div>
          </div>
        </div>
        <div className="-mx-6">
          {activityHistory && (
            <ResponsiveContainer width="100%" height={400} className="mt-6">
              <LineChart
                width={500}
                height={400}
                data={activityHistory.pastMonth}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Line
                  type="linear"
                  dataKey="total_energy_produced"
                  stroke="#82ca9d"
                  strokeWidth={4}
                />
                <Line
                  type="linear"
                  dataKey="total_energy_consumed"
                  stroke="#8884d8"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

const SystemComponentsCard = ({ components, tooltip }) => {
  if (!components) return <></>;
  return (
    <div className="col-span-1">
      <div className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-h5 font-semibold text-dark-grey">
            System Components
          </h2>
          <TooltipComponent>{tooltip}</TooltipComponent>
        </div>
        <div>
          {components?.map((c, idx) => {
            return (
              <div
                className="flex items-center gap-2 mt-4"
                key={`component-${idx}`}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: c.active ? '#03B665' : '#D64141' }}
                ></div>
                <p className="text-md text-dark-grey">{c.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

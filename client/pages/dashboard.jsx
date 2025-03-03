import { useState, useEffect, forwardRef, PureComponent } from 'react';

import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { EnergyStats } from '@/components/ui/EnergyStats.jsx';
import {
  Select,
  Grid,
  Container,
  Flex,
  Tooltip,
  Progress,
} from '@mantine/core';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import TooltipIcon from '../components/icons/TooltipIcon';

export function getMeta(ctx) {
  return {
    title: `${title} - Dashboard`,
  };
}

export default function Dashboard() {
  const { snapshot, state, actions } = useRouteContext();
  const [system, setSystem] = useState(null);
  const [activityData, setActivityData] = useState(null);

  const handleSetSystem = (value) => {
    setSystem(value);
  };

  // if (!state.user) {
  //   throw new Error('Unauthorized');
  // }

  /**
   * Fetches all statistics for the root page of the dashboard
   */
  const fetchActivity = () => {
    // mock fetch; TODO real fetch
    const res = {
      output: {
        today: {
          value: 1200,
          unit: 'kWh',
        },
      },
      usage: {
        today: {
          value: 95,
          unit: '%',
        },
      },
      batteryStorage: {
        value: 48,
        unit: '%',
      },
      weather: {
        value: 89,
        unit: 'F',
        description: 'Clear Skies',
      },
      activityHistory: {
        data: [
          {
            name: 'Sept',
            uv: 2780,
            pv: 3908,
            amt: 2000,
          },
          {
            name: 'Oct',
            uv: 1890,
            pv: 4800,
            amt: 2181,
          },
          {
            name: 'Nov',
            uv: 2390,
            pv: 3800,
            amt: 2500,
          },
          {
            name: 'Dec',
            uv: 3490,
            pv: 4300,
            amt: 2100,
          },
        ],
      },
    };
    return res;
  };

  // Get systems by user
  useEffect(() => {
    async function fetchSystems() {
      if (!state.user) return;
      await actions.getSystemsByUser(state);
    }
    fetchSystems();
  }, [state]);

  // Get metrics by system
  useEffect(() => {
    async function fetchMetrics() {
      if (!system) return;
      await actions.getMetricsSummaryBySystem(
        state,
        system,
        new Date().toISOString().split('T')[0]
      );
    }
    fetchMetrics();
  }, [system]);

  useEffect(() => {
    const data = fetchActivity();
    setActivityData(data);
  }, []);

  return (
    <div className="pb-28">
      <h1 className="text-h3 font-semibold py-6">Solar Panel Activity</h1>
      {/* <Select
        data={snapshot.systems.map((s) => ({
          value: s.id,
          label: `🏡 ${s.address}, ${s.city}, ${s.state}, ${s.zip}, ${s.country}`,
        }))}
        placeholder="Select a system installation"
        onChange={(value, _option) => {
          handleSetSystem(value);
        }}
      /> */}
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

      {activityData && (
        <div className="grid grid-flow-row grid-cols-4 gap-x-6 gap-y-3 mt-3">
          <MetricCard
            title="Today's Output"
            value={activityData.output.today.value}
            unit={activityData.output.today.unit}
            tooltip="Total output of your system."
          />
          <MetricCard
            title="Today's Usage"
            value={activityData.usage.today.value}
            unit={activityData.usage.today.unit}
            tooltip="Total usage of your system."
          />
          <MetricCard
            title="Battery Storage"
            value={activityData.batteryStorage.value}
            unit={activityData.batteryStorage.unit}
            tooltip="Percentage of total capacity."
          />
          <WeatherCard
            value={activityData.weather.value}
            unit={activityData.weather.unit}
            description={activityData.weather.description}
            tooltip="Based on your general location."
          />
          <ActivityHistoryCard activityHistory={activityData.activityHistory} />
          <SystemComponentsCard />
        </div>
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

const MetricCard = ({ title, value, unit, tooltip }) => {
  /* progress indicator color determined by percentage breakpoints */
  let progressColor = '#D64141';
  if (value > 66) {
    progressColor = '#03B665';
  } else if (value > 33) {
    progressColor = '#FA9F47';
  }

  const fillWidth = (value / 100) * 11; // width of filled bar in rems

  return (
    <div className="col-span-1 min-w-[318px]">
      <div className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex justify-between">
          <h2 className="text-h5 text-dark-grey font-semibold">{title}</h2>
          <TooltipComponent>{tooltip}</TooltipComponent>
        </div>
        <p className="text-h3 mt-4 font-semibold">
          {value} {unit}
        </p>
        {unit === '%' && (
          // <Progress value={value} color={progressColor} className="mt-4" />
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

const WeatherCard = ({ value, unit, description, tooltip }) => {
  return (
    <div className="col-span-1">
      <div className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Local Weather</h2>
          <TooltipComponent>{tooltip}</TooltipComponent>
        </div>
        <p className="text-4xl mt-4 font-semibold">
          {value} &deg;{unit}
        </p>
        <p className="text-sm mt-2">{description}</p>
      </div>
    </div>
  );
};

const ActivityHistoryCard = ({ activityHistory }) => {
  return (
    <div className="col-span-2">
      <div className="w-full min-h-[400px] px-6 pt-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <h2 className="text-h5 font-semibold capitalize text-dark-grey">
          30 Day Performance History
        </h2>
        <div className="-mx-6">
          <ResponsiveContainer width="100%" height={400} className="mt-6">
            <LineChart
              width={500}
              height={400}
              data={activityHistory.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="linear"
                dataKey="pv"
                stroke="#8884d8"
                strokeWidth={4}
              />
              <Line
                type="linear"
                dataKey="uv"
                stroke="#82ca9d"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SystemComponentsCard = () => {
  return (
    <div className="col-span-1">
      <div className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold">System Components</h2>
      </div>
    </div>
  );
};

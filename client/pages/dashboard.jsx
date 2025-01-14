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
  // const { snapshot, state, actions } = useRouteContext();

  // if (!state.user) {
  //   throw new Error('Unauthorized');
  // }

  const [activityData, setActivityData] = useState(null);

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

  useEffect(() => {
    const data = fetchActivity();
    setActivityData(data);
  }, []);

  return (
    <>
      <h1 className="text-4xl my-6">Solar Panel Activity</h1>
      {activityData && (
        <Grid columns={4} className="max-w-[1300px]">
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
        </Grid>
      )}
      {/* First row of four small cards */}
      {/* Second row Activity History and System Components */}
    </>
  );
}

const TooltipComponent = forwardRef((props, ref) => (
  <div ref={ref} {...props}>
    <TooltipIcon />
  </div>
));

const MetricCard = ({ title, value, unit, tooltip }) => {
  /* progress indicator color determined by percentage breakpoints */
  let progressColor = '#D64141';
  if (value > 66) {
    progressColor = '#03B665';
  } else if (value > 33) {
    progressColor = '#FA9F47';
  }

  return (
    <Grid.Col span={1}>
      <Container className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl drop-shadow-md">
        <Flex justify="space-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Tooltip label={tooltip}>
            <TooltipComponent />
          </Tooltip>
        </Flex>
        <p className="text-4xl mt-4 font-semibold">
          {value} {unit}
        </p>
        {unit === '%' && (
          <Progress value={value} color={progressColor} className="mt-4" />
        )}
      </Container>
    </Grid.Col>
  );
};

const WeatherCard = ({ value, unit, description, tooltip }) => {
  return (
    <Grid.Col span={1}>
      <Container className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl drop-shadow-md">
        <Flex justify="space-between">
          <h2 className="text-lg font-semibold">Local Weather</h2>
          <Tooltip label={tooltip}>
            <TooltipComponent />
          </Tooltip>
        </Flex>
        <p className="text-4xl mt-4 font-semibold">
          {value} &deg;{unit}
        </p>
        <p className="text-sm mt-2">{description}</p>
      </Container>
    </Grid.Col>
  );
};

const ActivityHistoryCard = ({ activityHistory }) => {
  return (
    <Grid.Col span={3}>
      <Container className="w-full min-h-[400px] p-6 bg-white border-solid border-2 border-gray-200 rounded-xl drop-shadow-md">
        <h2 className="text-lg font-semibold">Activity History</h2>
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
            <Line type="linear" dataKey="pv" stroke="#8884d8" strokeWidth={4} />
            <Line type="linear" dataKey="uv" stroke="#82ca9d" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </Container>
    </Grid.Col>
  );
};

const SystemComponentsCard = () => {
  return (
    <Grid.Col span={1}>
      <Container className="w-full h-full p-6 bg-white border-solid border-2 border-gray-200 rounded-xl drop-shadow-md">
        <h2 className="text-lg font-semibold">System Components</h2>
      </Container>
    </Grid.Col>
  );
};

export const layout = 'dashboard';

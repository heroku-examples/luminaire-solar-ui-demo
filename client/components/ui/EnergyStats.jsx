import { Group, SimpleGrid, Paper, Card, Text } from '@mantine/core';
import { IconHomeBolt, IconHomeEco } from '@tabler/icons-react';
import classes from '@/components/ui/EnergyStats.module.css';

function formatNumber(number) {
  return new Intl.NumberFormat().format(+number.toFixed(2));
}

export function EnergyStats({ metricsSummary }) {
  if (!metricsSummary) {
    return (
      <Card withBorder mt={10}>
        Please select system installation
      </Card>
    );
  }

  const daily = metricsSummary.daily[0];
  const weekly = metricsSummary.weekly[0];
  const monthly = metricsSummary.monthly[0];

  const data = [
    {
      title: 'Daily Energy Produced',
      value: `${formatNumber(daily.total_energy_produced)} kWh`,
      icon: 'bolt',
    },
    {
      title: 'Weekly Energy Produced',
      value: `${formatNumber(weekly.total_energy_produced)} kWh`,
      icon: 'bolt',
    },
    {
      title: 'Monthly Energy Produced',
      value: `${formatNumber(monthly.total_energy_produced)} kWh`,
      icon: 'bolt',
    },
    {
      title: 'Daily Energy Consumed',
      value: `${formatNumber(daily.total_energy_consumed)} kWh`,
      icon: 'bolt',
    },
    {
      title: 'Weekly Energy Consumed',
      value: `${formatNumber(weekly.total_energy_consumed)} kWh`,
      icon: 'bolt',
    },
    {
      title: 'Monthly Energy Consumed',
      value: `${formatNumber(monthly.total_energy_consumed)} kWh`,
      icon: 'bolt',
    },
    {
      title: 'Daily Energy Savings',
      value: `${formatNumber(daily.total_energy_produced - daily.total_energy_consumed)} kWh`,
      percentage: formatNumber(
        ((daily.total_energy_produced - daily.total_energy_consumed) /
          daily.total_energy_produced) *
          100
      ),
      icon: 'eco',
    },
    {
      title: 'Weekly Energy Savings',
      value: `${formatNumber(weekly.total_energy_produced - weekly.total_energy_consumed)} kWh`,
      percentage: formatNumber(
        ((weekly.total_energy_produced - weekly.total_energy_consumed) /
          weekly.total_energy_produced) *
          100
      ),
      icon: 'eco',
    },
    {
      title: 'Monthly Energy Savings',
      value: `${formatNumber(monthly.total_energy_produced - monthly.total_energy_consumed)} kWh`,
      percentage: formatNumber(
        ((monthly.total_energy_produced - monthly.total_energy_consumed) /
          monthly.total_energy_produced) *
          100
      ),
      icon: 'eco',
    },
  ];

  return (
    <SimpleGrid cols={3} breakpoints={{ 768: 1 }} pt={20}>
      {data.map((item, index) => (
        <Paper key={index} withBorder p="md" radius="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed" className={classes.title}>
              {item.title}
            </Text>
            {item.icon == 'bolt' ? (
              <IconHomeBolt size="1.4rem" className={classes.icon} />
            ) : (
              <IconHomeEco size="1.4rem" className={classes.icon} />
            )}
          </Group>

          <Group align="flex-end" justify="space-between" gap="xs" mt={20}>
            <Text className={classes.value}>{item.value}</Text>
            {item.percentage && (
              <Text
                c={item.percentage > 0 ? 'teal' : 'red'}
                fz="xl"
                fw={500}
                className={classes.diff}
              >
                <Group>{item.percentage}%</Group>
              </Text>
            )}
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

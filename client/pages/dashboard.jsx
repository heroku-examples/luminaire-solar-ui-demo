import { useState, useEffect } from 'react';
import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { EnergyStats } from '@/components/ui/EnergyStats.jsx';
import { Select } from '@mantine/core';

export function getMeta(ctx) {
  return {
    title: `${title} - Dashboard`,
  };
}

export default function Dashboard() {
  const { snapshot, state, actions } = useRouteContext();

  if (!state.user) {
    throw new Error('Unauthorized');
  }

  const [system, setSystem] = useState(null);

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

  return (
    <>
      <Select
        data={snapshot.systems.map((s) => ({
          value: s.id,
          label: `🏡 ${s.address}, ${s.city}, ${s.state}, ${s.zip}, ${s.country}`,
        }))}
        placeholder="Select a system installation"
        onChange={(value, _option) => {
          setSystem(value);
        }}
      />
      <EnergyStats metricsSummary={snapshot.metricsSummary} />
    </>
  );
}

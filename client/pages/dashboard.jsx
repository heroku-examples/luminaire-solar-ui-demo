import { useState, useEffect, useContext } from 'react';
import { useRouteContext } from '/:core.jsx';
import { title } from '@/theme.js';
import { EnergyStats } from '@/components/ui/EnergyStats.jsx';
import { Select } from '@mantine/core';
import { MetadataContext } from '../components/ui/Chat/helpers/metadataContext';

export function getMeta(ctx) {
  return {
    title: `${title} - Dashboard`,
  };
}

export default function Dashboard() {
  const { snapshot, state, actions } = useRouteContext();
  const { setMetadata } = useContext(MetadataContext);

  if (!state.user) {
    throw new Error('Unauthorized');
  }

  const [system, setSystem] = useState(null);

  /**
   * Handler for setting chosen system.
   * Updates metadata context to provide awareness on current system being viewed.
   */
  const handleSetSystem = (value) => {
    setSystem(value);
    setMetadata((prev) => ({ ...prev, systemId: value }));
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

  return (
    <>
      <Select
        data={snapshot.systems.map((s) => ({
          value: s.id,
          label: `🏡 ${s.address}, ${s.city}, ${s.state}, ${s.zip}, ${s.country}`,
        }))}
        placeholder="Select a system installation"
        onChange={(value, _option) => {
          handleSetSystem(value);
        }}
      />
      <EnergyStats metricsSummary={snapshot.metricsSummary} />
    </>
  );
}

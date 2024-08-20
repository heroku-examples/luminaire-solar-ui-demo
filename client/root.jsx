import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Router, AppRoute } from '/:core.jsx';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme.js';

export default function Root({ url, routes, head, ctxHydration, routeMap }) {
  return (
    <MantineProvider theme={theme}>
      <Suspense>
        <Router location={url}>
          <Routes>
            {routes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <AppRoute
                    head={head}
                    ctxHydration={ctxHydration}
                    ctx={routeMap[path]}
                  >
                    <Component />
                  </AppRoute>
                }
              />
            ))}
          </Routes>
        </Router>
      </Suspense>
    </MantineProvider>
  );
}

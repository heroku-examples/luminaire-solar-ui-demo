import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/ui/Footer';
import { ErrorBoundary } from 'react-error-boundary';
import {
  Container,
  AppShell,
  Burger,
  Group,
  Stack,
  Button,
} from '@mantine/core';
import BootstrapMessaging from '@/components/ui/Chat/BootstrapMessaging';
import { useDisclosure } from '@mantine/hooks';
import FullLogo from '../components/icons/Logo';
import DashboardIcon from '../components/icons/DashboardIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import ReportsIcon from '../components/icons/ReportsIcon';
import PlayIcon from '../components/icons/PlayIcon';

export default function Default({ children }) {
  function fallbackRender({ error, resetErrorBoundary }) {
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    );
  }
  const [opened, { toggle }] = useDisclosure();

  const navbarElements = [
    {
      route: '/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon(),
    },
    {
      route: '/dashboard/settings',
      label: 'Settings',
      icon: SettingsIcon(),
    },
    {
      route: '/dashboard/reports',
      label: 'Reports',
      icon: ReportsIcon(),
    },
    {
      route: '/dashboard/shop',
      label: 'Shop',
      icon: PlayIcon(),
    },
  ];

  return (
    <Suspense>
      <Container fluid>
        <ErrorBoundary
          fallbackRender={fallbackRender}
          onReset={(details) => {
            // log the error to the server
            console.log(details);
          }}
        >
          <AppShell
            header={{ height: 60 }}
            navbar={{
              width: 400,
              breakpoint: 'sm',
              collapsed: { mobile: !opened },
            }}
            padding="md"
            className=""
          >
            <AppShell.Header className="h-full flex items-center px-8 gap-8 mx-auto">
              <Burger
                opened={opened}
                onClick={toggle}
                // hiddenFrom="sm"
                size="sm"
              />
              <FullLogo />
            </AppShell.Header>
            <AppShell.Navbar
              p="md"
              styles={{ navbar: { backgroundColor: '#A997BF' } }}
            >
              <Stack className="pl-12 my-6">
                {navbarElements.map((element) => {
                  return (
                    <NavbarButton
                      key={element.route}
                      label={element.label}
                      icon={element.icon}
                      route={element.route}
                    />
                  );
                })}
              </Stack>
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
          </AppShell>
        </ErrorBoundary>
      </Container>
    </Suspense>
  );
}

const NavbarButton = ({ route, label, icon }) => {
  return (
    <Link to={route} className="flex w-full">
      <Button
        variant="subtle"
        leftSection={icon}
        rightSection={label}
        justify="left"
        color="black"
        fullWidth
      />
    </Link>
  );
};

import { Link } from 'react-router-dom';
import { Group, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSun } from '@tabler/icons-react';
import { Login } from '@/components/ui/Login.jsx';
import { Profile } from '@/components/ui/Profile.jsx';
import { Cart } from '@/components/ui/Cart.jsx';
import classes from './Header.module.css';
import { useRouteContext } from '/:core.jsx';

const links = [
  { link: '/', label: 'Home' },
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/products', label: 'Products' },
];

export function Header() {
  const { state } = useRouteContext();
  const [opened, { toggle }] = useDisclosure(false);

  const loggedIn = state.user && state.user.username != null;

  const items = links.map((link) => {
    if (link.label === 'Dashboard' && !loggedIn) return null;
    const className = classes.link + ' nav-link';
    return (
      <Link key={link.label} to={link.link} className={className}>
        {link.label}
      </Link>
    );
  });

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
          <IconSun color="orange" />
          Lumina Solar
        </Group>

        <Group gap={5} className={classes.links} visibleFrom="sm">
          {items}
        </Group>

        <Group className={classes.links} visibleFrom="sm">
          <Cart />
          {state.user ? <Profile /> : <Login />}
        </Group>
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { Group } from '@mantine/core';
import { IconSun } from '@tabler/icons-react';
import { Login } from '@/components/ui/Login.jsx';
import { Profile } from '@/components/ui/Profile.jsx';
import { Cart } from '@/components/ui/Cart.jsx';
import { title } from '@/theme.js';
import classes from './Header.module.css';
import { useRouteContext } from '/:core.jsx';
import ChevronArrow from '../icons/ChevonArrow';
import SearchIcon from '../icons/SearchIcon';
import FullLogo from '../icons/Logo';

const links = [
  {
    link: '/residential-solutions',
    label: (
      <div className={classes.linkItem}>
        <p>Residential Solutions</p>
        <ChevronArrow />
      </div>
    ),
  },
  {
    link: '/commercial-solutions',
    label: (
      <div className={classes.linkItem}>
        <p>Commercial Solutions</p>
        <ChevronArrow />
      </div>
    ),
  },
  { link: '/about', label: 'About' },
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/contact', label: 'Contact' },
];

export function Header() {
  const { state } = useRouteContext();
  const loggedIn = state.user && state.user.username != null;

  const items = links.map((link) => {
    if (link.label === 'Dashboard' && !loggedIn) return null;
    const className = classes.link + ' nav-link';
    return (
      <Link key={link.link} to={link.link} className={className}>
        {link.label}
      </Link>
    );
  });

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Link to="/demo" className="nav-link">
          <Group>
            <FullLogo />
          </Group>
        </Link>
        <Group gap={5} className={classes.links} visibleFrom="sm">
          {items}
        </Group>

        <Group className={classes.links} visibleFrom="sm">
          <SearchIcon />
          <Cart />
          {loggedIn ? <Profile /> : <Login />}
        </Group>
      </div>
    </header>
  );
}

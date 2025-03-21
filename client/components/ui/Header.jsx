import { Link } from 'react-router-dom';
import { Login } from '@/components/ui/Login.jsx';
import { Profile } from '@/components/ui/Profile.jsx';
import { Cart } from '@/components/ui/Cart.jsx';
import classes from './Header.module.css';
import { useRouteContext } from '/:core.jsx';
import ChevronArrow from '../icons/ChevonArrow';
import SearchIcon from '../icons/SearchIcon';
import FullLogo from '../icons/Logo';
import { useLocation } from 'react-router-dom';

export function Header() {
  const { state } = useRouteContext();
  const { pathname } = useLocation();

  const loggedIn = state.user && state.user.username != null;

  const links = [
    {
      link: '/products',
      label: (
        <div className={classes.linkItem}>
          <p>Products</p>
          <ChevronArrow />
        </div>
      ),
    },
    { link: '/about', label: 'About' },
    { link: '/dashboard', label: 'My Dashboard' },
  ];

  const items = links.map((link) => {
    if (link.label === 'Dashboard' && !loggedIn) return null;
    const className = classes.link + ' nav-link';
    return (
      <Link
        key={link.link}
        to={link.link}
        className={`${className} text-dark-grey font-medium`}
        style={{ padding: 0 }}
      >
        <div
          className={`text-dark-grey font-bold ${pathname === link.link ? 'border-b-2 border-purple-40' : ''}`}
        >
          {link.label}
        </div>
      </Link>
    );
  });

  return (
    <header className="z-20 w-full h-16 bg-white fixed top-0 border-b-[1px] border-light-grey">
      <div className="px-12 py-4 flex justify-between items-center">
        <div className="flex flex-row">
          <Link to="/" className="nav-link" style={{ padding: 0 }}>
            <FullLogo />
          </Link>
          <div className="flex flex-row items-center ml-10 gap-8">{items}</div>
        </div>

        <div className="flex flex-row items-center gap-x-6">
          <Cart />
          {loggedIn ? <Profile /> : <Login />}
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoginDialog } from '@/components/ui/login-dialog';
import { CartSheet } from '@/components/ui/cart-sheet';
import Logo from '@/components/icons/logo';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useStore();
  const loggedIn = user && user.username != null;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/solar-calculator', label: 'Calculator', requiresAuth: true },
    { href: '/dashboard', label: 'My Dashboard', requiresAuth: true },
  ];

  const visibleLinks = links.filter(
    (link) => !link.requiresAuth || (link.requiresAuth && loggedIn)
  );

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
  };

  return (
    <header className="z-20 w-full h-16 bg-white fixed top-0 border-b">
      <div className="px-12 h-full flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/demo" className="flex items-center">
            <Logo />
          </Link>
          <nav className="flex items-center ml-10 gap-2">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 font-medium text-sm
                    transition-all duration-300 ease-out
                    rounded-lg
                    ${
                      isActive
                        ? 'text-purple-600'
                        : 'text-gray-600 hover:text-purple-600'
                    }
                    hover:bg-purple-50
                    before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2
                    before:w-0 before:h-0.5 before:bg-purple-600
                    before:transition-all before:duration-300 before:ease-out
                    ${isActive ? 'before:w-8' : 'hover:before:w-8'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <CartSheet />

          {loggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name} {user.last_name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </header>
  );
}

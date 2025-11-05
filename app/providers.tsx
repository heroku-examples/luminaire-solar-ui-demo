'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

const AppContext = createContext<ReturnType<typeof useStore> | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const store = useStore();
  const { setUser, setAuthorization } = store;

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const profile = await api.getProfile();
        if (profile) {
          setUser(profile.user);
          setAuthorization(profile.authorization);
        }
      } catch {
        console.log('No active session');
      }
    };

    checkSession();
  }, [setUser, setAuthorization]);

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within Providers');
  }
  return context;
}

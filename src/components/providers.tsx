
'use client';

import { DataProvider } from '@/context/DataContext';
import { AuthProvider } from 'reactfire';
import { auth } from '@/lib/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider sdk={auth}>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  );
}

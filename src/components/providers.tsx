'use client';

import { DataProvider } from '@/app/data-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return <DataProvider>{children}</DataProvider>;
}

// src/app/providers.tsx (This file provides React Query client)
// This can remain as is, assuming FarmEasy is the primary part needing React Query.
// If CyberHertz also needs React Query, this Provider can be in the root layout.
// For now, it's used by FarmEasy through src/app/farmeasy/layout.tsx.
'use client'; 

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

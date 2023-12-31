'use client';

import { PropsWithChildren, useState } from 'react';

import { httpBatchLink } from '@trpc/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { trpc } from '@/app/_trpc/client';
import { Toast } from '@/components/ui/toast';

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: 'http://localhost:3000/api/trpc' })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

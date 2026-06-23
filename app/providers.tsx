'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // Создаем QueryClient внутри useState, чтобы он не пересоздавался при каждом рендере
    const [queryClient] = useState(
        () =>
        new QueryClient({
            defaultOptions: {
            queries: {
                refetchOnWindowFocus: false, // Отключаем перезапрос при переключении вкладок
                retry: 1, // В случае сбоя сети делаем только 1 повторную попытку
            },
            },
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
        {children}
        </QueryClientProvider>
    );
}
'use client';

import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


interface ProviderProps {
    children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export default Provider;

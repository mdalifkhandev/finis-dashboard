import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { store } from '@/store/store';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '@/lib/queryClient';

import { ToastProvider } from '@/context/ToastContext';

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <HelmetProvider>
                    <ErrorBoundary>
                        <ToastProvider>
                            <BrowserRouter>
                                {children}
                            </BrowserRouter>
                        </ToastProvider>
                    </ErrorBoundary>
                </HelmetProvider>
            </QueryClientProvider> 
        </Provider>
    );
}
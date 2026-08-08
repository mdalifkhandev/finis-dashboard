import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { store } from '@/store/store';
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <HelmetProvider>
                    <ErrorBoundary>
                        <BrowserRouter>
                            {children}
                        </BrowserRouter>
                    </ErrorBoundary>
                </HelmetProvider>
            </QueryClientProvider> 
        </Provider>
    );
}
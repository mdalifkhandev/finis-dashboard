/**
 * Main Application Component
 * 
 * Clean and focused - just providers and router.
 * All routing logic is in router.tsx
 * All providers are in providers.tsx
 */

import { AppProviders } from './providers';
import { AppRouter } from './router';

export function App() {
    return (
        <AppProviders>
            <AppRouter />
        </AppProviders>
    );
}

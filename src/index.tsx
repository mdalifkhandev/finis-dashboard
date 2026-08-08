import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';

if (typeof document !== 'undefined') {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.body.style.direction = 'ltr';
    document.body.style.textAlign = 'left';
    document.title = 'Finis Pro';
}

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/geist-sans/100.css';
import '@fontsource/geist-sans/200.css';
import '@fontsource/geist-sans/300.css';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-sans/800.css';
import '@fontsource/geist-sans/900.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import '@fontsource/geist-mono/700.css';
import { AppProvider } from './providers/app-provider';
import { AppRouter } from './routes';
import '@/styles/index.css';

// Single branded console message on boot. All other auth/flow logs are
// stripped from production so the console never leaks tokens, MFA secrets,
// or internal state to anyone with DevTools open.
console.log(
  '%c🛡️  We are Soberana',
  'font-size:16px; font-weight:700; padding:6px 10px; color:#fff; background:linear-gradient(90deg,#d97757 0%,#7c5cff 100%); border-radius:6px;'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <AppRouter />
    </AppProvider>
  </React.StrictMode>
);


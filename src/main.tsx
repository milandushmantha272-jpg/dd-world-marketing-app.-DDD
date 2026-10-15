import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Initialize PWA Service Worker for offline asset caching & background sync
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New DD World platform version available. Updating cache...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('DD World Platform is ready for offline operation via Service Worker cache.');
  },
  onRegisterError(error) {
    console.warn('Service worker registration failed:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Migration: reset to real hardware mode if demo was previously on from an old session
// Users must explicitly enable demo mode in Settings
if (localStorage.getItem('airguard_demo_mode') === 'true') {
  localStorage.removeItem('airguard_demo_mode');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

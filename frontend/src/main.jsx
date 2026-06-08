// src/main.jsx
// Very first file that runs — mounts the React app

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>   {/* Wraps everything so all pages can access login state */}
      <App />
      <Toaster position="top-right" /> {/* Global toast notifications */}
    </AuthProvider>
  </React.StrictMode>
);

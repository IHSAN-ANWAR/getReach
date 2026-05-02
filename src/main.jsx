import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Axios interceptor — attach fresh token from localStorage on every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('gr_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    // Also set as X-Auth-Token header (some hosts block Authorization)
    config.headers['X-Auth-Token'] = token;
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

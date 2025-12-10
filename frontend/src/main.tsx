// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import { SocketProvider } from './context/SocketContext';

createRoot(document.getElementById('root')!).render(
  <SocketProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </SocketProvider>
);
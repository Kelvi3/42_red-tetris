import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { SocketProvider } from './context/SocketContext';
import store from './store';
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error("L'élément root est introuvable dans le DOM.");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <SocketProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </SocketProvider>
  </StrictMode>
);
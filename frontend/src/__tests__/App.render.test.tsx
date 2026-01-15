import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { SocketProvider } from '../context/SocketContext';

describe('App root', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <SocketProvider>
        <App />
      </SocketProvider>
    );
    expect(container).toBeDefined();
  });
});

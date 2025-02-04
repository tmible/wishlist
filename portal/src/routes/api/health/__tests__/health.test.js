import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { GET } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('health endpoint', () => {
  let db;
  let hub;

  beforeEach(() => {
    db = { open: 'open' };
    hub = { isConnected: () => 'isConnected' };
    vi.mocked(inject).mockImplementation((token) => {
      if (token === InjectionToken.Database) {
        return db;
      }
      if (token === InjectionToken.IPCHub) {
        return hub;
      }
      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return DB connection status', async () => {
    await expect(GET().json().then(({ dbConnection }) => dbConnection)).resolves.toBe('open');
  });

  it('should return IPC hub connection status', async () => {
    await expect(
      GET().json().then(({ hubConnection }) => hubConnection),
    ).resolves.toBe(
      'isConnected',
    );
  });
});

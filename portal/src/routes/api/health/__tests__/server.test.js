import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { GET } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('$lib/server/ipc-hub/injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));

describe('health endpoint', () => {
  let db;
  let hub;

  beforeEach(() => {
    db = { open: 'open' };
    hub = { isConnected: () => 'isConnected' };
    vi.mocked(inject).mockImplementation((token) => {
      if (token === Database) {
        return db;
      }
      if (token === IPCHub) {
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

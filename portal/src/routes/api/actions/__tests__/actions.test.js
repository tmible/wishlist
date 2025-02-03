import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { PUT } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('actions endpoint', () => {
  let cookies;
  let request;
  let statement;

  beforeEach(() => {
    cookies = { get: vi.fn(() => 'unknownUserUuid') };
    request = { json: vi.fn(() => ({ timestamp: 'timestamp', action: 'action' })) };
    statement = { run: vi.fn() };
    vi.mocked(inject).mockReturnValueOnce(statement);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject statement', async () => {
    await PUT({ cookies, request });
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.AddActionStatement);
  });

  it('should run statement', async () => {
    await PUT({ cookies, request });
    expect(statement.run).toHaveBeenCalledWith('timestamp', 'action', 'unknownUserUuid');
  });

  it('should return success', async () => {
    const response = await PUT({ cookies, request });
    expect(response.status).toBe(200);
  });
});

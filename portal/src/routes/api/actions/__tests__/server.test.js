import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addAction } from '$lib/server/actions/use-cases/add-action.js';
import { PUT } from '../+server.js';

vi.mock('$lib/server/actions/use-cases/add-action.js');

describe('actions endpoint', () => {
  let request;

  beforeEach(() => {
    request = { json: vi.fn(() => ({ timestamp: 'timestamp', action: 'action' })) };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should run statement', async () => {
    await PUT({ cookies: 'cookies', request });
    expect(vi.mocked(addAction)).toHaveBeenCalledWith('timestamp', 'action', 'cookies');
  });

  it('should return success', async () => {
    const response = await PUT({ request });
    expect(response.status).toBe(200);
  });
});

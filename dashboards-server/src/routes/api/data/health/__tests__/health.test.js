import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('node:fs/promises');
vi.mock('$env/static/private', () => ({ HEALTH_CHECK_FILE_PATH: 'HEALTH_CHECK_FILE_PATH' }));

describe('health endpoint', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockResolvedValue('json');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should read json from file', async () => {
    await GET();
    expect(vi.mocked(readFile)).toHaveBeenCalledWith('HEALTH_CHECK_FILE_PATH', 'utf8');
  });

  it('should return json from file', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('json');
  });
});

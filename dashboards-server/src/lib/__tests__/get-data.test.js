// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from '../auth-interceptor.js';
import { getData } from '../get-data.js';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => 'json' }));
vi.mock('../auth-interceptor.js');

describe('getData', () => {
  beforeEach(() => {
    vi.mocked(authInterceptor).mockImplementation((arg) => arg);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch', async () => {
    await getData('path');
    expect(fetch).toHaveBeenCalledWith('path');
  });

  it('should use auth interceptor', async () => {
    await getData('path');
    expect(vi.mocked(authInterceptor)).toHaveBeenCalledWith(await vi.mocked(fetch)());
  });

  it('should return answer', async () => {
    expect(await getData('path')).toBe('json');
  });
});

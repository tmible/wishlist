import { afterEach, describe, expect, it, vi } from 'vitest';
import { post } from '../post.js';

vi.stubGlobal('fetch', vi.fn());

describe('post', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should fetch', async () => {
    await post('path');
    expect(fetch).toHaveBeenCalledWith(
      'path',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: '{}',
      },
    );
  });

  it('should return answer', async () => {
    fetch.mockReturnValue(Promise.resolve('response'));
    expect(await post('path')).toEqual('response');
  });
});

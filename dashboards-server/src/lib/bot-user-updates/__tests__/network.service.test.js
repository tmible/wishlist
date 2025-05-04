import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPage } from '../network.service.js';

describe('bot user updates / network service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPage', () => {
    let fetchFunction;

    beforeEach(() => {
      fetchFunction = vi.fn().mockResolvedValueOnce({
        ok: 'ok',
        json: vi.fn().mockResolvedValueOnce('page'),
      });
    });

    it('should fetch page without params', async () => {
      await getPage({}, fetchFunction);
      expect(fetchFunction).toHaveBeenCalledWith('/api/data/bot/userUpdates');
    });

    it('should fetch page with params', async () => {
      await getPage(
        { param1: undefined, param2: 2, param3: 'param3', param4: { inner: 'property' } },
        fetchFunction,
      );
      expect(
        fetchFunction,
      ).toHaveBeenCalledWith(
        '/api/data/bot/userUpdates?param2=2&param3="param3"&param4={"inner":"property"}',
      );
    });

    it('should return page and response status', async () => {
      await expect(getPage({}, fetchFunction)).resolves.toEqual([ 'page', 'ok' ]);
    });
  });
});

import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { GET, POST } from '../+server.js';

vi.mock('@sveltejs/kit');
vi.mock('@tmible/wishlist-common/dependency-injector');

describe('categories endpoint', () => {
  let locals;
  let statement;

  beforeEach(() => {
    locals = { userid: 'userid' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    beforeEach(() => {
      vi.mocked(json).mockImplementation((original) => original);
      statement = { all: vi.fn() };
      vi.mocked(inject).mockReturnValueOnce(statement);
    });

    it('should inject statement', async () => {
      await GET({ locals });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.GetUserCategoriesStatement);
    });

    it('should run statement', async () => {
      await GET({ locals });
      expect(statement.all).toHaveBeenCalledWith('userid');
    });

    it('should return statement run result', () => {
      statement.all.mockReturnValueOnce('categories');
      expect(GET({ locals })).toBe('categories');
    });
  });

  describe('POST', () => {
    let request;

    beforeEach(() => {
      request = { text: vi.fn(() => 'text') };
      statement = { run: vi.fn() };
      vi.mocked(inject).mockReturnValueOnce(statement);
    });

    it('should inject statement', async () => {
      await POST({ request, locals });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.AddCategoryStatement);
    });

    it('should run statement', async () => {
      await POST({ request, locals });
      expect(statement.run).toHaveBeenCalledWith('userid', 'text');
    });

    it('should return success', async () => {
      const response = await POST({ request, locals });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });
});

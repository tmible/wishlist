import { redirect } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from '../+page.js';

vi.mock('@sveltejs/kit', () => ({ redirect: vi.fn() }));

describe('404 page', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should redirect to /login', () => {
    load();
    expect(redirect).toHaveBeenCalledWith(308, '/login');
  });
});

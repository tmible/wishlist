import { redirect } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from '../+page.js';

vi.mock('@sveltejs/kit');

describe('404 page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should redirect to /login', () => {
    load();
    expect(vi.mocked(redirect)).toHaveBeenCalledWith(308, '/');
  });
});

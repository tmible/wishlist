import { redirect } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { load } from '../+page.js';

vi.mock('@sveltejs/kit');

describe('404 page', () => {
  it('should redirect to /login', () => {
    load();
    expect(vi.mocked(redirect)).toHaveBeenCalledWith(308, '/');
  });
});

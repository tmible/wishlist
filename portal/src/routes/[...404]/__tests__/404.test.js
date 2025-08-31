import { error } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { load } from '../+page.js';

vi.mock('@sveltejs/kit');

describe('404 page', () => {
  it('should return error', () => {
    load();
    expect(vi.mocked(error)).toHaveBeenCalledWith(404);
  });
});

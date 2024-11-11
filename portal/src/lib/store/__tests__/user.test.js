import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('svelte/store');

describe('store/user', () => {
  beforeEach(async () => {
    await import('../user.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should init user as writable store', () => {
    expect(
      vi.mocked(writable),
    ).toHaveBeenCalledWith(
      { id: null, hash: null, isAuthenticated: null },
    );
  });
});

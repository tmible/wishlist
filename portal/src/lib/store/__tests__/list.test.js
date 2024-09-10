import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('svelte/store');

describe('store/list', () => {
  beforeEach(async () => {
    await import('../list.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should init list as writable store', () => {
    expect(vi.mocked(writable)).toHaveBeenCalledWith(null);
  });
});

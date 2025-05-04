import { afterEach, describe, expect, it, vi } from 'vitest';
import { cache } from '../cache.js';

describe('bot user updates / cache', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set value', () => {
    cache.set('filters', 'index', 'value');
    expect(cache.get('filters', 'index')).toBe('value');
  });
});

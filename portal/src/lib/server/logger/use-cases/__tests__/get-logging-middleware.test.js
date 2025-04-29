import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CreateLoggingMiddleware } from '../../events.js';
import { getLoggingMiddleware } from '../get-logging-middleware.js';

vi.mock('@tmible/wishlist-common/event-bus');

describe('logger / use cases / get logging middleware', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit CreateLoggingMiddleware event', () => {
    getLoggingMiddleware();
    expect(vi.mocked(emit)).toHaveBeenCalledWith(CreateLoggingMiddleware);
  });

  it('should return CreateLoggingMiddleware event result', () => {
    vi.mocked(emit).mockReturnValueOnce('middleware');
    expect(getLoggingMiddleware()).toBe('middleware');
  });
});

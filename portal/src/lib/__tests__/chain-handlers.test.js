import { describe, expect, it, vi } from 'vitest';
import { chainHandlers } from '../chain-handlers.js';

describe('chainHandlers', () => {
  it('should chain handlers', async () => {
    const handlers = [ vi.fn(), vi.fn() ];
    await chainHandlers(...handlers)('arg');
    for (const spy of handlers) {
      expect(spy).toHaveBeenCalledWith('arg');
    }
  });

  it('should call handlers in order', async () => {
    const marks = [];
    const handlers = [
      vi.fn(() => {
        marks.push('1');
      }),
      vi.fn(() => {
        marks.push('2');
      }),
    ];
    await chainHandlers(...handlers)();
    expect(marks).toEqual([ '1', '2' ]);
  });

  it('should return if handler returns', async () => {
    const handlers = [ vi.fn(() => 'return'), vi.fn() ];
    await chainHandlers(...handlers)();
    expect(handlers[0]).toHaveBeenCalled();
    expect(handlers[1]).not.toHaveBeenCalled();
  });
});

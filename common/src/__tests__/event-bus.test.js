import { describe, expect, it, vi } from 'vitest';
import { emit, subscribe, unsubscribe } from '../event-bus.js';

describe('event bus', () => {
  it('should register event handler and invoke it on event emit', () => {
    const handler = vi.fn();
    subscribe('event', handler);
    emit('event');
    expect(handler).toHaveBeenCalled();
  });

  it('should unsubscribe event handler', () => {
    const handler = vi.fn();
    subscribe('event', handler);
    unsubscribe('event');
    emit('event');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should pass arguments to handler', () => {
    const handler = vi.fn();
    subscribe('event', handler);
    emit('event', 'arg1', 'arg2');
    expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should return handler return', () => {
    const handler = vi.fn().mockReturnValueOnce('return');
    subscribe('event', handler);
    expect(emit('event')).toBe('return');
  });

  it('should allow only 1 handler', () => {
    const handlers = [ vi.fn(), vi.fn() ];
    subscribe('event', handlers[0]);
    subscribe('event', handlers[1]);
    emit('event');
    expect(handlers[0]).not.toHaveBeenCalled();
    expect(handlers[1]).toHaveBeenCalled();
  });
});

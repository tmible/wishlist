import { describe, expect, it, vi } from 'vitest';
import { chainMiddlewares } from '../chain-middlewares.js';

describe('chainMiddlewares', () => {
  it('should chain middlewares', () => {
    const middlewares = [ vi.fn((arg, next) => next(arg)), vi.fn((arg, next) => next(arg)) ];
    const final = vi.fn();
    chainMiddlewares(...middlewares)('arg', final);
    for (const spy of middlewares) {
      expect(spy).toHaveBeenCalledWith('arg', expect.any(Function));
    }
    expect(final).toHaveBeenCalledWith('arg');
  });

  it('should call middlewares in order', () => {
    const marks = [];
    const middlewares = [
      vi.fn((next) => {
        marks.push('1.1');
        next();
        marks.push('1.2');
      }),
      vi.fn((next) => {
        marks.push('2.1');
        next();
        marks.push('2.2');
      }),
    ];
    const final = vi.fn(() => marks.push('3'));
    chainMiddlewares(...middlewares)(final);
    expect(marks).toEqual([ '1.1', '2.1', '3', '2.2', '1.2' ]);
  });

  it('should throw args length error', () => {
    expect(() => chainMiddlewares()()).toThrowError('Must have at least one argument');
  });

  it('should throw args type error', () => {
    expect(
      () => chainMiddlewares()('not a function'),
    ).toThrowError(
      'Last argument must be a function',
    );
  });
});

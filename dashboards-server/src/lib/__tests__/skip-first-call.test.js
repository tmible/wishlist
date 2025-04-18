import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { skipFirstCall } from '../skip-first-call.js';

describe('skip first call', () => {
  const spy = vi.fn();

  let func;

  beforeEach(() => {
    func = skipFirstCall(spy);
    func();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should skip first call', () => {
    expect(spy).not.toHaveBeenCalled();
  });

  it('should provide second call', () => {
    func();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

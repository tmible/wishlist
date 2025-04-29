// @vitest-environment jsdom
import { readable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('svelte/store');

const mediaQuery = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe('breakpoints', () => {
  let startSpy;
  let changeEventHandler;

  beforeEach(async () => {
    vi.mocked(readable).mockImplementation((value, start) => startSpy = start);
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
    mediaQuery.addEventListener.mockImplementation(
      (eventName, eventHandler) => changeEventHandler = eventHandler,
    );
    await import('../breakpoints.js');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should init md as readable store', () => {
    expect(vi.mocked(readable)).toHaveBeenCalledWith(null, expect.any(Function));
  });

  it('should create md media query', () => {
    startSpy(vi.fn());
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('should add event listener to md media query', () => {
    startSpy(vi.fn());
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should set inside event listener', () => {
    const setSpy = vi.fn();
    startSpy(setSpy);
    const matches = Math.random() < 0.5;
    changeEventHandler({ matches });
    expect(setSpy).toHaveBeenCalledWith(matches);
  });

  it('should remove event listener on unsubscribe', () => {
    const unsubscribe = startSpy(vi.fn());
    unsubscribe();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', changeEventHandler);
  });
});

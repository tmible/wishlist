import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyGradient, removeGradient } from '../favicon.service.js';

describe('gradient / favicon service', () => {
  let mock;
  let hrefSetSpy;
  let settedValue;

  beforeEach(() => {
    mock = {};
    hrefSetSpy = vi.fn((value) => settedValue = value);
    Object.defineProperty(mock, 'href', { set: hrefSetSpy, configurable: true });
    vi.stubGlobal('document', { querySelector: vi.fn().mockReturnValueOnce(mock) });
  });

  afterEach(() => {
    delete mock.href;
    vi.clearAllMocks();
  });

  it('should apply gradient to favicon', () => {
    const gradient = { hue1: 1, hue2: 2, saturation: 3, lightness: 4 };
    applyGradient(gradient);
    expect(settedValue).toMatchSnapshot();
  });

  it('should remove gradient from favicon', () => {
    removeGradient();
    expect(settedValue).toMatchSnapshot();
  });
});

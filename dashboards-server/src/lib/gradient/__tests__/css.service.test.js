import { describe, expect, it, vi } from 'vitest';
import { applyGradient, constructStyle, removeGradient } from '../css.service.js';

describe('gradient / css service', () => {
  it('should construct style', () => {
    expect(
      constructStyle({ hue1: 1, hue2: 2, saturation: 3, lightness: 4 }),
    ).toBe(
      'linear-gradient(135deg, hsl(1 3 4), hsl(2 3 4))',
    );
  });

  it('should apply gradient to document', () => {
    const setProperty = vi.fn();
    vi.stubGlobal('document', { documentElement: { style: { setProperty } } });
    const gradient = { hue1: 1, hue2: 2, saturation: 3, lightness: 4 };
    applyGradient(gradient);
    expect(
      setProperty,
    ).toHaveBeenCalledWith(
      '--gradient',
      'linear-gradient(135deg, hsl(1 3 4), hsl(2 3 4))',
    );
  });

  it('should remove gradient from document', () => {
    const setProperty = vi.fn();
    vi.stubGlobal('document', { documentElement: { style: { setProperty } } });
    removeGradient();
    expect(setProperty).toHaveBeenCalled();
  });
});

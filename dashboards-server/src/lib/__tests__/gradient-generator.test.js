import { describe, expect, it } from 'vitest';
import { adjustGradient, generateGradient } from '../gradient-generator';

const gradientMatcher = {
  hue1: expect.any(Number),
  hue2: expect.any(Number),
  saturation: expect.any(Number),
  lightness: expect.any(Number),
  style: expect.stringMatching(
    /* eslint-disable-next-line sonarjs/regex-complexity --
      Соответствие строке linear-gradient(135deg, hsl(a1 b1 b2), hsl(a2 b3 b4)),
      где a1 и a2 -- действительные числа,
      b1, b2, b3, b4 -- действительные неотрициательные числа */
    /^linear-gradient\(135deg(?:, hsl\(-?(?:\d+(?:\.\d+)? ){2}\d+(?:\.\d+)?\)){2}\)$/,
  ),
};

describe('gradient generator', () => {
  it('should generate gradient', () => {
    const isDark = Math.random() >= 0.5;
    expect(generateGradient(isDark)).toEqual({
      ...gradientMatcher,
      isDarkTheme: isDark,
    });
  });

  describe('adjustGradient', () => {
    it('should generate gradient if none is passed', () => {
      const isDark = Math.random() >= 0.5;
      expect(adjustGradient(null, isDark)).toEqual({
        ...gradientMatcher,
        isDarkTheme: isDark,
      });
    });

    it('should adjust passed gradient', () => {
      const isDark = Math.random() >= 0.5;
      const currentGradient = {
        hue1: 0,
        hue2: 0,
        saturation: 0,
        lightness: 0,
        isDarkTheme: !isDark,
        style: 'linear-gradient(135deg, hsl(0 0 0), hsl(0 0 0))',
      };
      expect(adjustGradient(currentGradient, isDark)).toEqual({
        ...gradientMatcher,
        ...currentGradient,
        isDarkTheme: isDark,
      });
    });
  });
});

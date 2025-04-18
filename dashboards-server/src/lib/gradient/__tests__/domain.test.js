import { beforeEach, describe, expect, it } from 'vitest';
import { getRandomArbitrary } from '$lib/get-random-arbitrary.js';
import { changeGradientVariant, generateGradient, GradientVariant } from '../domain.js';

const gradientMatcher = {
  hue1: expect.any(Number),
  hue2: expect.any(Number),
  saturation: expect.any(Number),
  lightness: expect.any(Number),
};

describe('gradient / domain', () => {
  const variants = Object.values(GradientVariant);
  let variant;

  beforeEach(() => {
    variant = variants[Math.round(getRandomArbitrary(0, variants.length - 1))];
  });

  it('should generate gradient', () => {
    expect(generateGradient(variant)).toEqual({ ...gradientMatcher, variant });
  });

  describe('changeGradientVariant', () => {
    it('should generate gradient if none is passed', () => {
      expect(changeGradientVariant(null, variant)).toEqual({ ...gradientMatcher, variant });
    });

    it('should adjust passed gradient', () => {
      expect(
        changeGradientVariant(
          {
            hue1: 0,
            hue2: 0,
            saturation: 0,
            lightness: 0,
            variant: GradientVariant.LIGHT,
          },
          GradientVariant.DARK,
        ),
      ).toEqual(
        { ...gradientMatcher, variant: GradientVariant.DARK },
      );
    });
  });
});

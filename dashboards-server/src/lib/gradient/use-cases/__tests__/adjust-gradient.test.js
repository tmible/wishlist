import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { changeGradientVariant } from '../../domain.js';
import { ApplyGradient } from '../../events.js';
import { GradientStore, NextGradientStore } from '../../injection-tokens.js';
import { adjustGradient } from '../adjust-gradient.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../domain.js');
vi.mock('../../events.js', () => ({ ApplyGradient: 'apply gradient' }));
vi.mock(
  '../../injection-tokens.js',
  () => ({ GradientStore: 'gradient store', NextGradientStore: 'next gradient store' }),
);

const variant = 'variant';
const storeMock = { get: vi.fn(), set: vi.fn() };
const nextStoreMock = { get: vi.fn(), set: vi.fn() };

describe('gradient / use cases / adjust gradient', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(storeMock).mockReturnValueOnce(nextStoreMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject gradient store', () => {
    adjustGradient(variant);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(GradientStore));
  });

  it('should get gradient from store', () => {
    adjustGradient(variant);
    expect(storeMock.get).toHaveBeenCalled();
  });

  describe('if there is gradient in store', () => {
    const gradient = 'gradient';

    beforeEach(() => {
      storeMock.get.mockReturnValue(gradient);
    });

    it('should change gradient variant', () => {
      adjustGradient(variant);
      expect(vi.mocked(changeGradientVariant)).toHaveBeenCalledWith(gradient, variant);
    });

    it('should set gradient to store', () => {
      vi.mocked(changeGradientVariant).mockReturnValue('changed gradient');
      adjustGradient(variant);
      expect(storeMock.set).toHaveBeenCalledWith('changed gradient');
    });

    it('should emit ApplyGradient event', () => {
      adjustGradient(variant);
      expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(ApplyGradient), gradient);
    });
  });

  it('should inject next gradient store', () => {
    adjustGradient(variant);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NextGradientStore));
  });

  it('should get next gradient from store', () => {
    adjustGradient(variant);
    expect(nextStoreMock.get).toHaveBeenCalled();
  });

  describe('if there is next gradient in store', () => {
    const nextGradient = 'next gradient';

    beforeEach(() => {
      nextStoreMock.get.mockReturnValue(nextGradient);
    });

    it('should change next gradient variant', () => {
      adjustGradient(variant);
      expect(vi.mocked(changeGradientVariant)).toHaveBeenCalledWith(nextGradient, variant);
    });

    it('should set next gradient to store', () => {
      vi.mocked(changeGradientVariant).mockReturnValue('changed next gradient');
      adjustGradient(variant);
      expect(nextStoreMock.set).toHaveBeenCalledWith('changed next gradient');
    });
  });
});

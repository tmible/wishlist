import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateGradient } from '../../domain.js';
import { ApplyGradient } from '../../events.js';
import { GradientStore, NextGradientStore } from '../../injection-tokens.js';
import { setGradient } from '../set-gradient.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../domain.js');

const variant = 'variant';
const gradient = 'gradient';
const storeMock = { get: vi.fn(), set: vi.fn() };
const nextStoreMock = { get: vi.fn(), delete: vi.fn() };

describe('gradient / use cases / set gradient', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(storeMock).mockReturnValueOnce(nextStoreMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject gradient store', () => {
    setGradient(variant);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(GradientStore);
  });

  it('should inject next gradient store', () => {
    setGradient(variant);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NextGradientStore);
  });

  it('should get gradient from store', () => {
    setGradient(variant);
    expect(storeMock.get).toHaveBeenCalled();
  });

  it('should get next gradient from store if there is no gradient in store', () => {
    setGradient(variant);
    expect(nextStoreMock.get).toHaveBeenCalled();
  });

  it('should generate gradient if there are no gradaint and next gradient in store', () => {
    setGradient(variant);
    expect(vi.mocked(generateGradient)).toHaveBeenCalledWith(variant);
  });

  it('should emit ApplyGradient event', () => {
    storeMock.get.mockReturnValue(gradient);
    setGradient(variant);
    expect(vi.mocked(emit)).toHaveBeenCalledWith(ApplyGradient, gradient);
  });

  it('should delete next gradient from store', () => {
    setGradient(variant);
    expect(nextStoreMock.delete).toHaveBeenCalled();
  });

  it('should set gradient to store', () => {
    storeMock.get.mockReturnValue(gradient);
    setGradient(variant);
    expect(storeMock.set).toHaveBeenCalledWith(gradient);
  });
});

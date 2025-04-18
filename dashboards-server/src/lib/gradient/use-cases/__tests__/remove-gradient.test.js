import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateGradient } from '../../domain.js';
import { RemoveGradient } from '../../events.js';
import { GradientStore, NextGradientStore } from '../../injection-tokens.js';
import { removeGradient } from '../remove-gradient.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../domain.js');

const variant = 'variant';
const storeMock = { delete: vi.fn() };
const nextStoreMock = { set: vi.fn() };

describe('gradient / use cases / remove gradient', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(storeMock).mockReturnValueOnce(nextStoreMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject gradient store', () => {
    removeGradient(variant);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(GradientStore);
  });

  it('should delete gradient from store', () => {
    removeGradient(variant);
    expect(storeMock.delete).toHaveBeenCalled();
  });

  it('should emit RemoveGradient event', () => {
    removeGradient(variant);
    expect(vi.mocked(emit)).toHaveBeenCalledWith(RemoveGradient);
  });

  it('should inject next gradient store', () => {
    removeGradient(variant);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NextGradientStore);
  });

  it('should generate next gradient', () => {
    removeGradient(variant);
    expect(vi.mocked(generateGradient)).toHaveBeenCalledWith(variant);
  });

  it('should set next gradient to store', () => {
    vi.mocked(generateGradient).mockReturnValue('next gradient');
    removeGradient(variant);
    expect(nextStoreMock.set).toHaveBeenCalledWith('next gradient');
  });
});

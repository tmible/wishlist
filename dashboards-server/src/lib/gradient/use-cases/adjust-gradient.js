import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { changeGradientVariant } from '../domain.js';
import { ApplyGradient } from '../events.js';
import { GradientStore, NextGradientStore } from '../injection-tokens.js';

/** @typedef {import('../domain.js').GradientVariant} GradientVariant */

/** @module Сценарий обновления градиента */

/**
 * Обновление градиента, чтобы он соответствовал целевому варианту
 * 1. Обновление, сохранение и применение основного градиента при наличии
 * 2. Обновление и сохранение следующего градиента при наличии
 * @function adjustGradient
 * @param {GradientVariant} variant Целевой вариант
 * @returns {void}
 */
export const adjustGradient = (variant) => {
  const store = inject(GradientStore);
  const gradient = store.get();
  if (gradient) {
    store.set(changeGradientVariant(gradient, variant));
    emit(ApplyGradient, gradient);
  }

  const nextStore = inject(NextGradientStore);
  const nextGradient = nextStore.get();
  if (nextGradient) {
    nextStore.set(changeGradientVariant(nextGradient, variant));
  }
};

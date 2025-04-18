import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { generateGradient } from '../domain.js';
import { ApplyGradient } from '../events.js';
import { GradientStore, NextGradientStore } from '../injection-tokens.js';

/** @typedef {import('../domain.js').GradientVariant} GradientVariant */

/** @module Сценарий применения градиента */

/**
 * Применение градиента
 * 1. Получение градиента из хранилища, из хранилища следующего градиента или генерация нового
 * 2. Применение градиента
 * 3. Удаление из хранилища следующего градиента
 * 4. Сохранение градиента в хранилище
 * @function setGradient
 * @param {GradientVariant} variant Вариант градиента
 * @returns {void}
 */
export const setGradient = (variant) => {
  const store = inject(GradientStore);
  const nextStore = inject(NextGradientStore);
  const gradient = store.get() ?? nextStore.get() ?? generateGradient(variant);
  emit(ApplyGradient, gradient);
  nextStore.delete();
  store.set(gradient);
};

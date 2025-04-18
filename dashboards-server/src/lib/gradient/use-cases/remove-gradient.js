import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { generateGradient } from '../domain.js';
import { RemoveGradient } from '../events.js';
import { GradientStore, NextGradientStore } from '../injection-tokens.js';

/** @typedef {import('../domain.js').GradientVariant} GradientVariant */

/** @module Сценарий отключения градиента */

/**
 * Отключение градиента
 * 1. Удаление градиента из хранилища
 * 2. Отключение градиента
 * 3. Генерация и сохранение в хранилище следующего градиента
 * @function removeGradient
 * @param {GradientVariant} variant Вариант следующего градиента
 * @returns {void}
 */
export const removeGradient = (variant) => {
  inject(GradientStore).delete();
  emit(RemoveGradient);
  inject(NextGradientStore).set(generateGradient(variant));
};

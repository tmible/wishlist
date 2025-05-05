import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
import * as cssService from './css.service.js';
import { ApplyGradient, RemoveGradient } from './events.js';
import * as faviconService from './favicon.service.js';
import { GradientStore, NextGradientStore } from './injection-tokens.js';
import { nextStore, store } from './store.js';

/**
 * Регистрация зависисмостей и подписка на события для работы с градиентом
 * @function initGradientFeature
 * @returns {() => void} Функция освбождения зависисмостей и отписки от событий
 */
export const initGradientFeature = () => {
  provide(GradientStore, store);
  provide(NextGradientStore, nextStore);
  subscribe(ApplyGradient, (gradient) => {
    cssService.applyGradient(gradient);
    faviconService.applyGradient(gradient);
  });
  subscribe(RemoveGradient, (gradient) => {
    cssService.removeGradient(gradient);
    faviconService.removeGradient(gradient);
  });

  return () => {
    unsubscribe(ApplyGradient);
    unsubscribe(RemoveGradient);
    deprive(GradientStore);
    deprive(NextGradientStore);
  };
};

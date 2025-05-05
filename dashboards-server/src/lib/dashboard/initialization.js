import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { NetworkFactory, StoreFactory } from './injection-tokens.js';
import { createGetData } from './network.service.js';
import { createStore } from './store.js';

/**
 * Регистрация зависисмостей для работы с дашбордами
 * @function initDashboardFeature
 * @returns {() => void} Функция освбождения зависисмостей
 */
export const initDashboardFeature = () => {
  Chart.register(annotationPlugin);
  provide(StoreFactory, createStore);
  provide(NetworkFactory, createGetData);

  return () => {
    deprive(StoreFactory);
    deprive(NetworkFactory);
  };
};

import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { buildDashboard } from '../domain.js';
import { NetworkFactory, StoreFactory } from '../injection-tokens.js';

/** @typedef {import('../domain.js').DashboardConfig} DashboardConfig */

/** @module Сценарий создания дашборда */

/**
 * Создание дашборда
 * 1. [Построение дашборда]{@link buildDashboard}
 * 2. Создание функции запроса данных для дашборда
 * 3. Создание и регистрация в сервисе внедрения зависимостей хранилища дашборда
 * @function createDashboard
 * @param {'bot' | 'portal'} service Сервис, данные которого отображаются в дашборде
 * @param {DashboardConfig} config Конфиг для постройки дашборда
 * @returns {void}
 */
export const createDashboard = (service, config) => {
  const dashboard = buildDashboard(config);
  provide(
    `${service} ${config.key} store`,
    inject(StoreFactory)(dashboard, inject(NetworkFactory)(service)),
  );
};

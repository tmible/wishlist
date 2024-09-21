import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для изменения категории
 * @function initUpdateCategoryStatement
 * @returns {void}
 */
export const initUpdateCategoryStatement = () => provide(
  InjectionToken.UpdateCategoryStatement,
  inject(
    InjectionToken.Database,
  ).prepare(
    'UPDATE categories SET name = ? WHERE id = ? AND userid = ?',
  ),
);

import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для получения категорий пользователя
 * @function initGetUserCategoriesStatement
 * @returns {void}
 */
export const initGetUserCategoriesStatement = () => provide(
  InjectionToken.GetUserCategoriesStatement,
  inject(InjectionToken.Database).prepare('SELECT id, name FROM categories WHERE userid = ?'),
);

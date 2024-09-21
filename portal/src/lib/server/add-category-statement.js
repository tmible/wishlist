import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для добавления категории
 * @function initAddCategoryStatement
 * @returns {void}
 */
export const initAddCategoryStatement = () => provide(
  InjectionToken.AddCategoryStatement,
  inject(InjectionToken.Database).prepare('INSERT INTO categories (userid, name) VALUES (?, ?)'),
);

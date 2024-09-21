import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для удаления категории
 * @function initDeleteCategoryStatement
 * @returns {void}
 */
export const initDeleteCategoryStatement = () => provide(
  InjectionToken.DeleteCategoryStatement,
  inject(InjectionToken.Database).prepare('DELETE FROM categories WHERE id = ? AND userid = ?'),
);

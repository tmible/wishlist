import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Создание и регистрация в сервисе внедрения зависмостей
 * SQL выражения для добавления элемента списка
 * @function initAddItemStatement
 * @returns {void}
 */
export const initAddItemStatement = () => provide(
  InjectionToken.AddItemStatement,
  inject(InjectionToken.Database).prepare(`
    INSERT INTO list (userid, priority, name, description, state)
    VALUES (?, ?, ?, ?, ${ListItemState.FREE})
    RETURNING id
  `),
);

import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 * @typedef {import('@tmible/wishlist-common/constants/list-item-state').default} ListItemState
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
 */
/**
 * Элемент списка желаний пользователя
 * во варианте отображения для владельца
 * @typedef {object} OwnListItem
 * @property {number} id Идентификатор элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {ListItemState} state Состояние подарка
 * @property {number} order Порядковый номер элемента
 * @property {string | null} category Категория элемента
 * @property {Entity[]} descriptionEntities Элементы разметки текста описания подарка
 * @property {0 | 1} isExternal Признак того, что подарок был добавлен в список не владельцем
 */

/**
 * Подготовленное выражение запроса БД
 * @type {Statement}
 */
let statement;

/**
 * Подготовка [выражения]{@link statement}
 * @function prepare
 * @returns {void}
 */
const prepare = () => {
  statement = inject(InjectionToken.Database).prepare(`
    SELECT
      list.id,
      list.name,
      description,
      state,
      "order",
      categories.name AS category,
      type,
      offset,
      length,
      additional,
      CASE WHEN added_by IS NULL THEN FALSE ELSE TRUE END AS isExternal
    FROM (
      SELECT id, name, description, state, "order", category_id, added_by
      FROM list
      WHERE userid = ?
    ) AS list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    LEFT JOIN categories ON list.category_id = categories.id
  `);
};

/**
 * Получение пользователем своего списка желаний
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {OwnListItem[]} Список желаний пользователя, отсортированный в заданном владельцем
 * порядке
 */
const eventHandler = (userid) => statement
  .all(userid)
  /* eslint-disable-next-line unicorn/no-array-callback-reference --
    descriptionEntitiesReducer -- специально написанная для использования в reduce() функция
  */
  .reduce(descriptionEntitiesReducer, [])
  .sort((a, b) => a.order - b.order);

export default { eventHandler, prepare };

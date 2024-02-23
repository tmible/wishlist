import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import descriptionEntitiesReducer from '@tmible/wishlist-bot/store/helpers/description-entities-reducer';

/**
 * @typedef {import('better-sqlite3').Statement} Statement
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
 */
/**
 * Элемент списка желаний пользователя
 * во варианте отображения для владельца
 * @typedef {object} OwnListItem
 * @property {number} id Идентификатор элемента
 * @property {number} priority Приоритет элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {Entity[]} descriptionEntities Элементы разметки текста описания подарка
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
    SELECT id, priority, name, description, type, offset, length, additional
    FROM list
    LEFT JOIN description_entities ON list.id = description_entities.list_item_id
    WHERE userid = ?
  `);
};

/**
 * Получение пользователем своего списка желаний
 * @function eventHandler
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {OwnListItem[]} Список желаний пользователя,
 *   отсортированный по возрастанию идентификаторов
 */
const eventHandler = (userid) => statement
  .all(userid)
  /* eslint-disable-next-line unicorn/no-array-callback-reference --
    descriptionEntitiesReducer -- специально написанная для использования в reduce() функция
  */
  .reduce(descriptionEntitiesReducer, [])
  .sort((a, b) => a.id - b.id);

export default { eventHandler, prepare };

import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';

/** @typedef {import('@tmible/wishlist-common/constants/list-item-state').default} ListItemState */
/** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */
/** @typedef {import('$lib/categories/domain.js').Category} Category */

/**
 * Элемент списка желаний пользователя во варианте отображения для владельца
 * @typedef {object} OwnWishlistItem
 * @property {number} id Идентификатор элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {ListItemState} state Состояние подарка
 * @property {number} order Порядковый номер элемента
 * @property {Category | null} category Категория элемента
 * @property {Entity[]} descriptionEntities Элементы разметки текста описания подарка
 */

/**
 * Свойства элемента списка, определяемые при его создании или изменении
 * @typedef {
 *   Omit<OwnWishlistItem, 'id' | 'state' | 'order' | 'category'> &
 *     { order?: number, categoryId: number | null }
 * } OwnWishlistItemFormData
 */

/**
 * Присовение порядкового номера новому (создаваемому) элементу списка
 * @function assignOrderToNewItem
 * @param {OwnWishlistItem[]} list Текущий список
 * @param {Partial<OwnWishlistItem>} itemToAdd Создаваемый элемент
 * @returns {void}
 */
export const assignOrderToNewItem = (list, itemToAdd) => {
  itemToAdd.order = list.length;
};

/**
 * Определение наличия изменений, фильтрация объекта с изменениями
 * и создание нового изменённого элемена списка
 * @function patchItem
 * @param {OwnWishlistItem} item Изменяемый элемент списка
 * @param {Partial<OwnWishlistItem>} patch Объект с изменениями
 * @returns {[ boolean, OwnWishlistItem, Partial<OwnWishlistItem> ]}
 *   Признак наличия изменений, изменённый элемент списка и отфильтрованный объект с изменениями
 */
export const patchItem = (item, patch) => {
  const patchFiltered = { ...patch };
  for (const [ key, value ] of Object.entries(patch)) {
    if (
      (
        key === 'descriptionEntities' &&
        arrayToOrderedJSON(value) === arrayToOrderedJSON(item[key])
      ) ||
      (key === 'category' && (value?.id ?? null) === (item.category?.id ?? null)) ||
      (
        key !== 'descriptionEntities' &&
        key !== 'category' &&
        value === item[key]
      )
    ) {
      delete patchFiltered[key];
    }
  }

  return [ Object.entries(patchFiltered).length > 0, { ...item, ...patchFiltered }, patchFiltered ];
};

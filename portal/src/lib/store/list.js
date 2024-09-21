import { writable } from 'svelte/store';

/**
 * @template T
 * @typedef {import('svelte/store').Writable<T>} Writable
 */
/** @typedef {import('@tmible/wishlist-common/constants/list-item-state').default} ListItemState */
/** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */
/** @typedef {import('./categories.js').Category} Category */
/**
 * Элемент списка желаний пользователя во варианте отображения для владельца
 * @typedef {object} OwnListItem
 * @property {number} id Идентификатор элемента
 * @property {string} name Название подарка
 * @property {string} description Описание подарка
 * @property {ListItemState} state Состояние подарка
 * @property {number} order Порядковый номер элемента
 * @property {Category | null} category Категория элемента
 * @property {Entity[]} descriptionEntities Элементы разметки текста описания подарка
 */

/**
 * Svelte хранилище списка желаний пользователя
 * @type {Writable<OwnListItem[] | null>}
 */
export const list = writable(null);

import DescriptionEntityBaseKeys from '@tmible/wishlist-common/constants/description-entity-base-keys';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { InsertDescriptionEntities } from '../events.js';

/** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */

/**
 * Создание и выполнение SQL выражения для записи элементов разметки описания в БД
 * @function insertDescriptionEntities
 * @param {number | string} itemId Идентификатор элемента списка, к которому относится описание
 * @param {Entity[]} descriptionEntities Элементы разметки описания
 * @returns {void}
 */
const insertDescriptionEntities = (itemId, descriptionEntities) => {
  if (descriptionEntities.length <= 0) {
    return;
  }

  inject(Database).prepare(
    `INSERT INTO description_entities VALUES ${
      descriptionEntities.map((entity) => `($itemId, ?, ?, ?, ${
        Object.entries(entity).some(([ key ]) => !DescriptionEntityBaseKeys.has(key)) ?
          '?' :
          'NULL'
      })`).join(',')
    }`,
  ).run(
    ...descriptionEntities.flatMap((entity) => {
      const additionalProperties = Object.entries(entity).filter(
        ([ key ]) => !DescriptionEntityBaseKeys.has(key),
      );
      return [
        entity.type,
        entity.offset,
        entity.length,
        JSON.stringify(Object.fromEntries(additionalProperties)),
      ].slice(0, additionalProperties.length > 0 ? 4 : 3);
    }),
    { itemId },
  );
};

/**
 * Подписка [выполнения SQL выражения]{@link insertDescriptionEntities} на соответствующее событие
 * @function initInsertDescriptionEntitiesStatement
 * @returns {void}
 */
export const initInsertDescriptionEntitiesStatement = () => {
  subscribe(InsertDescriptionEntities, insertDescriptionEntities);
};

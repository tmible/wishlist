import DescriptionEntityBaseKeys from '@tmible/wishlist-common/constants/description-entity-base-keys';

/** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */
/** @typedef {import('better-sqlite3').Database} Database */

/**
 * Подготовка и выполнение SQL выражения для записи элементов разметки описания в БД
 * @function parseAndInsertDescriptionEntities
 * @param {Database} db Объект для доступа к БД
 * @param {number | string} itemId Идентификатор элемента списка, к которому относится описание
 * @param {Entity[]} descriptionEntities Элементы разметки описания
 * @returns {void}
 */
export const parseAndInsertDescriptionEntities = (db, itemId, descriptionEntities) => {
  if (descriptionEntities.length <= 0) {
    return;
  }

  db.prepare(
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

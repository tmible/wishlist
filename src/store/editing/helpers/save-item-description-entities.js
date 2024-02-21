/* eslint-disable-next-line import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { db } from '@tmible/wishlist-bot/store';
import DescriptionEntityBaseKeys from '@tmible/wishlist-bot/store/constants/description-entity-base-keys';

/**
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
 */

/**
 * Сохранение в БД элементов разметки текста описания подарка
 * @function saveItemDescriptionEntities
 * @param {number} itemId Идентификатор подарка
 * @param {Entity[]} entities Элементы разметки
 * @param {number} descriptionOffset Отступ начала описания от начала текста сообщения
 * @returns {void}
 */
const saveItemDescriptionEntities = (itemId, entities, descriptionOffset) => {
  if (!Array.isArray(entities) || entities?.length === 0) {
    return;
  }

  const descriptionEntities = entities.filter(({ offset }) => offset >= descriptionOffset);

  if (descriptionEntities.length === 0) {
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
        entity.offset - descriptionOffset,
        entity.length,
        JSON.stringify(Object.fromEntries(additionalProperties)),
      ].slice(0, additionalProperties.length > 0 ? 4 : 3);
    }),
    { itemId },
  );
};

export default saveItemDescriptionEntities;

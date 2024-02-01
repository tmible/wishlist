import DescriptionEntityBaseKeys from '@tmible/wishlist-bot/constants/description-entity-base-keys';
import { db } from '@tmible/wishlist-bot/store';

/**
 * Сохранение в БД элементов разметки текста описания подарка
 * @function saveItemDescriptionEntities
 * @param {string} itemId Идентификатор подарка
 * @param {Entity[]} entities Элементы разметки
 * @param {number} descriptionOffset Отступ начала описания от начала текста сообщения
 */
const saveItemDescriptionEntities = (itemId, entities, descriptionOffset) => {
  if (!Array.isArray(entities) || entities?.length === 0) {
    return;
  }

  const descriptionEntities = entities.filter(({ offset }) => offset >= descriptionOffset);

  db.prepare(
    `INSERT INTO description_entities VALUES ${
      descriptionEntities.map((entity) => `($itemId, ?, ?, ?, ${
        !!Object.entries(entity).find(([ key ]) => !DescriptionEntityBaseKeys.has(key)) ?
          '?' :
          'NULL'
      })`).join(', ')
    }`,
  ).run(
    ...descriptionEntities.flatMap((entity) => {
      const additionalProperties = Object.entries(entity).filter(([ key ]) =>
        !DescriptionEntityBaseKeys.has(key)
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

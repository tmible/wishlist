import { inject } from '@tmible/wishlist-common/dependency-injector';
import parseAndInsertDescriptionEntities from '@tmible/wishlist-common/parse-and-insert-description-entities';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

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

  parseAndInsertDescriptionEntities(
    inject(InjectionToken.Database),
    itemId,
    entities.filter(({ offset }) => offset >= descriptionOffset),
  );
};

export default saveItemDescriptionEntities;

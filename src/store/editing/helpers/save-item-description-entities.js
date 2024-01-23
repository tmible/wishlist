import descriptionEntityBaseKeys from 'wishlist-bot/constants/description-entity-base-keys';
import { db } from 'wishlist-bot/store';

const saveItemDescriptionEntities = (itemId, entities, descriptionOffset) => {
  if (!Array.isArray(entities) || entities?.length === 0) {
    return;
  }

  const descriptionEntities = entities.filter(({ offset }) => offset >= descriptionOffset);

  const statement = db.prepare(`INSERT INTO description_entities VALUES ${
    descriptionEntities.map((_, i) => '($itemId, ?, ?, ?, ?)').join(', ')
  }`);

  statement.run(
    ...descriptionEntities.flatMap((entity) => {
      const additionalProperties = Object.entries(entity).filter(([ key ]) =>
        !descriptionEntityBaseKeys.has(key)
      );
      return [
        entity.type,
        entity.offset - descriptionOffset,
        entity.length,
        JSON.stringify(
          additionalProperties.length > 0 ? Object.fromEntries(additionalProperties) : null,
        ),
      ];
    }),
    { itemId },
  );
};

export default saveItemDescriptionEntities;

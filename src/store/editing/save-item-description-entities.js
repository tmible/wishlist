import descriptionEntityBaseKeys from 'wishlist-bot/constants/description-entity-base-keys';
import { db } from 'wishlist-bot/store';

const saveItemDescriptionEntities = async (itemId, entities, descriptionOffset) => {
  if (!Array.isArray(entities) || entities?.length === 0) {
    return;
  }

  const descriptionEntities = entities.filter(({ offset }) => offset >= descriptionOffset);

  const stmt = `INSERT INTO description_entities VALUES ${
    descriptionEntities.map((_, i) =>
      `(?1, ?${2 + i * 4}, ?${3 + i * 4}, ?${4 + i * 4}, ?${5 + i * 4})`
    ).join(', ')
  }`;

  await db.run(
    stmt,
    [
      itemId,
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
    ],
  );
};

export default saveItemDescriptionEntities;

import descriptionEntityKeys from 'wishlist-bot/constants/description-entity-keys';

const descriptionEntitiesReducer = (accum, current) => {
  const found = accum.find(({ id }) => id === current.id);

  if (found) {

    found.descriptionEntities.push({
      type: current.type,
      offset: current.offset,
      length: current.length,
      ...(JSON.parse(current.additional) ?? {}),
    });

  } else {

    accum.push({
      ...Object.fromEntries(
        Object.entries(current).filter(([ key ]) => !descriptionEntityKeys.has(key)),
      ),
      descriptionEntities: [],
    });

    if (!!current.type) {
      accum.at(-1).descriptionEntities.push({
        type: current.type,
        offset: current.offset,
        length: current.length,
        ...(JSON.parse(current.additional) ?? {}),
      });
    }

  }

  return accum;
};

export default descriptionEntitiesReducer;

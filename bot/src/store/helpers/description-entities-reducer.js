import DescriptionEntityKeys from '@tmible/wishlist-bot/store/constants/description-entity-keys';

/** @typedef {import('@tmible/wishlist-bot/store').EntityBase} EntityBase */

/**
 * Обработчик списка желаний, группирующий элементы разметки элементов списка
 * с одинаковыми идентификаторами
 * @function descriptionEntitiesReducer
 * @param {
 *   ({
 *     id: number;
 *     descriptionEntities: (EntityBase & { additional: string })[];
 *   } & Record<string, unknown>)[]
 * } accum Обработанные ранее элементы списка
 * @param {
 *   { id: number } &
 *   EntityBase &
 *   { additional: string } &
 *   Record<string, unknown>
 * } current Очередной элемент списка
 * @returns {
 *   ({
 *     id: number;
 *     descriptionEntities: (EntityBase & { additional: string })[];
 *   } & Record<string, unknown>)[]
 * } Элементы списка со сгрупированными элементами разметки описания
 */
const descriptionEntitiesReducer = (accum, current) => {
  const found = accum.find(({ id }) => id === current.id);

  if (found) {

    found.descriptionEntities.push({
      type: current.type,
      offset: current.offset,
      length: current.length,
      ...JSON.parse(current.additional),
    });

  } else {

    accum.push({
      ...Object.fromEntries(
        Object.entries(current).filter(([ key ]) => !DescriptionEntityKeys.has(key)),
      ),
      descriptionEntities: [],
    });

    if (current.type) {
      accum.at(-1).descriptionEntities.push({
        type: current.type,
        offset: current.offset,
        length: current.length,
        ...JSON.parse(current.additional),
      });
    }

  }

  return accum;
};

export default descriptionEntitiesReducer;

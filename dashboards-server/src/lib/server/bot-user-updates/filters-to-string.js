/**
 * @typedef {
 *   import('$lib/bot-user-updates/initialization.js').BotUserUpdatesFilters
 * } BotUserUpdatesFilters
 */

/**
 * Преобразование объекта фильтров к строке для использования в SQL выражении
 * @function filtersToString
 * @param {BotUserUpdatesFilters} filters Фильтры
 * @returns {string} SQL представление фильтров
 */
export const filtersToString = (filters) => {
  const filtersString = Object.entries(filters)
    .map(([ key, value ]) => {
      if (typeof value === 'object') {
        const filter = [];
        if (value.start) {
          filter.push(`${key} >= ${value.start}`);
        }
        if (value.end) {
          filter.push(`${key} <= ${value.end}`);
        }
        return filter.join(' AND ');
      }
      if (value === '') {
        return '';
      }
      return `${key} = ${value}`;
    })
    .filter(Boolean)
    .join(' AND ');
  return `${filtersString.length > 0 ? ' AND ' : ''}${filtersString}`;
};

/**
 * Сравнение объектов по названиям свойств
 * @template T extends Record<string, number | bigint | string | boolean>
 * @function objectsComparator
 * @param {T} a Первый сраниваемый объект
 * @param {T} b Второй сраниваемый объект
 * @returns {-1 | 0 | 1} -1, если первый раньше, 1, если второй раньше, иначе -- 0
 */
const objectsComparator = (a, b) => {
  const keys = new Set(Object.keys(a)).intersection(new Set(Object.keys(b)));
  for (const key of keys) {
    if (a[key] !== b[key]) {
      return a[key] < b[key] ? -1 : 1;
    }
  }
  return 0;
};

/**
 * Сравнение свойств объекта для сортировки в лексекографическом порядке
 * @function objectKeysComparator
 * @param {[ string, string ]} aEntry Первое сраниваемое свойство (название и значение)
 * @param {string} aEntry.a Название первого сраниваемого свойства
 * @param {[ string, string ]} bEntry Первое сраниваемое свойство (название и значение)
 * @param {string} bEntry.b Название второго сраниваемого свойства
 * @returns {-1 | 1} -1, если первое раньше, 1, если второе раньше
 */
const objectKeysComparator = ([ a ], [ b ]) => (a < b ? -1 : 1);

/**
 * Приведение массива объектов к единому формату JSON.
 * [Сортировка свойств объектов в лексекографическом порядке]{@link objectKeysComparator},
 * [сортировка объектов]{@link objectsComparator}
 * @param {Record<string, unknown>[]} array Массив объектов
 * @returns {string} Отсортированный массив отсортированных объектов в виде JSON строки
 */
const arrayToOrderedJSON = (array) => JSON.stringify(
  array
    .map((entity) => Object.fromEntries(
      Object
        .entries(entity)
        .sort(objectKeysComparator),
    ))
    .sort(objectsComparator),
);

export default arrayToOrderedJSON;

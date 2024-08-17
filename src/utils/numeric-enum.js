/**
 * Создание перечисления из набора ключей
 * @function numericEnum
 * @param {string[]} keys Ключи перечисления
 * @returns {{[key: string]: number }} Перечисление с задаными ключами и числовыми значениями
 */
const numericEnum = (keys) => Object.freeze(Object.fromEntries(keys.map((key, i) => [ key, i ])));

export default numericEnum;

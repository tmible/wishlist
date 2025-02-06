/**
 * Получение случайного числа в отрезке
 * @function getRandomArbitrary
 * @param {number} min Левая граница отрезка
 * @param {number} max Правая граница отрезка
 * @returns {number} Случайное число в отрезке
 */
/* eslint-disable-next-line sonarjs/pseudo-random --
  Используется только в генерации градиента */
export const getRandomArbitrary = (min, max) => (Math.random() * (max - min)) + min;

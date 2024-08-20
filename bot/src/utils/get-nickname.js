import { faker } from '@faker-js/faker/locale/ru';

/**
 * Генерация случайного, постоянного относительно переданного зерна, никнейма
 * @function getNickname
 * @param {number} seed Зерно для генератора псевдослучайных чисел
 * @returns {string} Сгенерированный никнейм
 */
const getNickname = (seed) => {
  faker.seed(seed);
  const adjective = faker.color.human();
  faker.seed(seed);
  const noun = faker.hacker.noun();
  return `${adjective} ${noun}`;
};

export default getNickname;

import { faker } from '@faker-js/faker/locale/ru';

const getNickname = (seed) => {
  faker.seed(seed);
  const adjective = faker.color.human();
  faker.seed(seed);
  const noun = faker.hacker.noun();
  return `${adjective} ${noun}`;
};

export default getNickname;

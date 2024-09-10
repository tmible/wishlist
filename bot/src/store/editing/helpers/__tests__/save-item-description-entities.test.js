import { afterEach, beforeEach, describe, it } from 'node:test';
import { object, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const itemId = 'itemId';
const entities = [{
  type: 'type 1',
  offset: 0,
  length: 1,
}, {
  type: 'type 2',
  offset: 1,
  length: 2,
  additional: 'property',
}];

const db = object([ 'prepare', 'pragma' ]);
const [{ inject }, parseAndInsertDescriptionEntities ] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceModule('@tmible/wishlist-common/parse-and-insert-description-entities'),
]);
const saveItemDescriptionEntities = await import('../save-item-description-entities.js')
  .then((module) => module.default);

describe('saveItemDescriptionEntities', () => {
  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn(db);
  });

  afterEach(reset);

  it('should return if entities is not array', () => {
    saveItemDescriptionEntities();
    verify(parseAndInsertDescriptionEntities(), { times: 0 });
  });

  it('should return if entities is empty array', () => {
    saveItemDescriptionEntities(itemId, []);
    verify(parseAndInsertDescriptionEntities(), { times: 0 });
  });

  it('should run filter entities', () => {
    saveItemDescriptionEntities(itemId, entities, 1);
    verify(parseAndInsertDescriptionEntities(db, itemId, [ entities[1] ]));
  });

  it('should call parseAndInsertDescriptionEntities', () => {
    saveItemDescriptionEntities(itemId, entities, 0);
    verify(parseAndInsertDescriptionEntities(db, itemId, entities));
  });
});

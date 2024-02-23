import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, reset, verify, when } from 'testdouble';
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
const { inject } = await replaceModule('@tmible/wishlist-bot/architecture/dependency-injector');
const saveItemDescriptionEntities = await import('../save-item-description-entities.js')
  .then((module) => module.default);

describe('saveItemDescriptionEntities', () => {
  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn(db);
  });

  afterEach(reset);

  it('should return if entities is not array', () => {
    saveItemDescriptionEntities();
    verify(db.prepare(), { times: 0 });
  });

  it('should return if entities is empty array', () => {
    saveItemDescriptionEntities(itemId, []);
    verify(db.prepare(), { times: 0 });
  });

  it('should construct prepared statement', () => {
    when(
      db.prepare(matchers.anything()),
    ).thenDo((statement) => {
      assert.equal(
        statement,
        'INSERT INTO description_entities VALUES ($itemId, ?, ?, ?, NULL),($itemId, ?, ?, ?, ?)',
      );
      return object([ 'run' ]);
    });
    saveItemDescriptionEntities(itemId, entities, 0);
  });

  it('should run filter entities', () => {
    const statementMock = object([ 'run' ]);
    when(db.prepare(matchers.anything())).thenReturn(statementMock);
    saveItemDescriptionEntities(itemId, entities, 1);
    verify(
      statementMock.run('type 2', 0, 2, '{"additional":"property"}', { itemId }),
    );
  });

  it('should run prepared statement', () => {
    const statementMock = object([ 'run' ]);
    when(db.prepare(matchers.anything())).thenReturn(statementMock);
    saveItemDescriptionEntities(itemId, entities, 0);
    verify(
      statementMock.run('type 1', 0, 1, 'type 2', 1, 2, '{"additional":"property"}', { itemId }),
    );
  });
});

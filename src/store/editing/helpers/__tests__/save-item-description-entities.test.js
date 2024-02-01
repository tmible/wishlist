import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('saveItemDescriptionEntities', () => {
  let db;
  let saveItemDescriptionEntities;

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

  beforeEach(async () => {
    db = td.object([ 'prepare', 'pragma' ]);
    await td.replaceEsm(await resolveModule('wishlist-bot/store'), { db });
    saveItemDescriptionEntities = (await import('../save-item-description-entities.js')).default;
  });

  afterEach(() => td.reset());

  it('should return if entities is not array', () => {
    saveItemDescriptionEntities();
    td.verify(db.prepare(), { times: 0 });
  });

  it('should return if entities is empty array', () => {
    saveItemDescriptionEntities(itemId, []);
    td.verify(db.prepare(), { times: 0 });
  });

  it('should construct prepared statement', () => {
    td.when(
      db.prepare(td.matchers.anything()),
    ).thenDo((statement) => {
      assert.equal(
        statement,
        'INSERT INTO description_entities VALUES ($itemId, ?, ?, ?, NULL), ($itemId, ?, ?, ?, ?)',
      );
      return td.object([ 'run' ]);
    });
    saveItemDescriptionEntities(itemId, entities, 0);
  });

  it('should run filter entities', () => {
    const statementMock = td.object([ 'run' ]);
    td.when(db.prepare(td.matchers.anything())).thenReturn(statementMock);
    saveItemDescriptionEntities(itemId, entities, 1);
    td.verify(
      statementMock.run('type 2', 0, 2, '{"additional":"property"}', { itemId }),
    );
  });

  it('should run prepared statement', () => {
    const statementMock = td.object([ 'run' ]);
    td.when(db.prepare(td.matchers.anything())).thenReturn(statementMock);
    saveItemDescriptionEntities(itemId, entities, 0);
    td.verify(
      statementMock.run('type 1', 0, 1, 'type 2', 1, 2, '{"additional":"property"}', { itemId }),
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseAndInsertDescriptionEntities } from '../parse-and-insert-description-entities.js';

const itemId = 'itemId';
const descriptionEntities = [{
  type: 'type 1',
  offset: 0,
  length: 1,
}, {
  type: 'type 2',
  offset: 1,
  length: 2,
  additional: 'property',
}];

describe('parseAndInsertDescriptionEntities', () => {
  let db;

  beforeEach(() => {
    db = { prepare: vi.fn() };
  });

  afterEach(vi.restoreAllMocks);

  it('should return if descriptionEntities is empty array', () => {
    parseAndInsertDescriptionEntities(db, itemId, []);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('should construct prepared statement', () => {
    db.prepare = vi.fn((statement) => {
      expect(
        statement,
      ).toEqual(
        'INSERT INTO description_entities VALUES ($itemId, ?, ?, ?, NULL),($itemId, ?, ?, ?, ?)',
      );
      return { run: vi.fn() };
    });
    parseAndInsertDescriptionEntities(db, itemId, descriptionEntities);
  });

  it('should run prepared statement', () => {
    const statementMock = { run: vi.fn() };
    db.prepare = vi.fn(() => statementMock);
    parseAndInsertDescriptionEntities(db, itemId, descriptionEntities);
    expect(
      statementMock.run,
    ).toHaveBeenCalledWith(
      'type 1',
      0,
      1,
      'type 2',
      1,
      2,
      '{"additional":"property"}',
      { itemId },
    );
  });
});

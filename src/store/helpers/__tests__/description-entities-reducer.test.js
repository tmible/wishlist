import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import descriptionEntitiesReducer from '../description-entities-reducer.js';

describe('descriptionEntitiesReducer', () => {
  it('should add current to accum', () => {
    assert.deepEqual(
      descriptionEntitiesReducer([], { id: 'id', other: 'property' }),
      [{ id: 'id', other: 'property', descriptionEntities: [] }],
    );
  });

  it('should add current with entities to accum', () => {
    const current = {
      id: 'id',
      other: 'property',
      type: 'type',
      offset: 0,
      length: 0,
      additional: null,
    };
    assert.deepEqual(
      descriptionEntitiesReducer([], current),
      [{
        id: 'id',
        other: 'property',
        descriptionEntities: [{ type: 'type', offset: 0, length: 0 }],
      }],
    );
  });

  it('should add current with entities to accum and spread additional', () => {
    const current = {
      id: 'id',
      other: 'property',
      type: 'type',
      offset: 0,
      length: 0,
      additional: '{ "additional": "property" }',
    };
    assert.deepEqual(
      descriptionEntitiesReducer([], current),
      [{
        id: 'id',
        other: 'property',
        descriptionEntities: [{ type: 'type', offset: 0, length: 0, additional: 'property' }],
      }],
    );
  });

  it('should add entities to existing entry', () => {
    const accum = [{ id: 'id', other: 'property', descriptionEntities: [] }];
    const current = { id: 'id', type: 'type', offset: 0, length: 0, additional: null };
    assert.deepEqual(
      descriptionEntitiesReducer(accum, current),
      [{
        id: 'id',
        other: 'property',
        descriptionEntities: [{ type: 'type', offset: 0, length: 0 }],
      }],
    );
  });

  it('should add entities to existing entry and spread additional', () => {
    const accum = [{ id: 'id', other: 'property', descriptionEntities: [] }];
    const current = {
      id: 'id',
      type: 'type',
      offset: 0,
      length: 0,
      additional: '{ "additional": "property" }',
    };
    assert.deepEqual(
      descriptionEntitiesReducer(accum, current),
      [{
        id: 'id',
        other: 'property',
        descriptionEntities: [{ type: 'type', offset: 0, length: 0, additional: 'property' }],
      }],
    );
  });
});

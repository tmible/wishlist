import { describe, expect, it } from 'vitest';
import descriptionEntitiesReducer from '../description-entities-reducer.js';

describe('description entities reducer', () => {
  it('should add current to accum', () => {
    expect(
      descriptionEntitiesReducer([], { id: 'id', other: 'property' }),
    ).toEqual(
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
    expect(
      descriptionEntitiesReducer([], current),
    ).toEqual(
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
    expect(
      descriptionEntitiesReducer([], current),
    ).toEqual(
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
    expect(
      descriptionEntitiesReducer(accum, current),
    ).toEqual(
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
    expect(
      descriptionEntitiesReducer(accum, current),
    ).toEqual(
      [{
        id: 'id',
        other: 'property',
        descriptionEntities: [{ type: 'type', offset: 0, length: 0, additional: 'property' }],
      }],
    );
  });
});

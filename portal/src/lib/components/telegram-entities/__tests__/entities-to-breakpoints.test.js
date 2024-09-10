import { describe, expect, it } from 'vitest';
import { entitiesToBreakpoints } from '../entities-to-breakpoints.js';

describe('entitiesToBreakpoints', () => {
  it('should convert entity to breakpoints', () => {
    const entity = {
      offset: 0,
      length: 1,
      type: 'type',
    };
    expect(
      entitiesToBreakpoints([ entity ]),
    ).toEqual([
      { offset: 0, entity, type: 'opening' },
      { offset: 1, entity, type: 'closing' },
    ]);
  });
});

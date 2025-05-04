import { describe, expect, it } from 'vitest';
import { filtersToString } from '../filters-to-string.js';

describe('bot user updates / filtersToString', () => {
  it('should return empty string', () => {
    expect(filtersToString({})).toBe('');
  });

  it('should return filters string', () => {
    expect(
      filtersToString({
        simple1: 'filter',
        simple2: '',
        range1: { start: 'start', end: 'end', random: 'property' },
        range2: { start: 'only' },
        range3: { end: 'only' },
        range4: {},
      }),
    ).toMatchSnapshot();
  });
});

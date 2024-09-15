import { describe, expect, it } from 'vitest';
import arrayToOrderedJSON from '../array-to-ordered-json.js';

describe('arrayToOrderedJSON', () => {
  it('should convert array to ordered JSON', () => {
    expect(
      arrayToOrderedJSON([{
        property1: 0,
        property2: 0,
        extraProperty1: 'extra',
      }, {
        property1: 0,
        property2: 1,
        extraProperty2: 'extra',
      }, {
        property1: 1,
        property2: 0,
      }, {
        property1: 1,
        property2: 1,
      }, {
        property1: 1,
        property2: 1,
      }].sort(() => Math.random() - 0.5)),
    ).toMatchSnapshot();
  });
});

import { basename, resolve } from 'node:path';
import { describe, it, snapshot } from 'node:test';
import arrayToOrderedJSON from '../array-to-ordered-json.js';

snapshot.setResolveSnapshotPath(
  (testFile) => resolve(testFile, '../__snapshots__', `${basename(testFile)}.snapshot`),
);

describe('arrayToOrderedJSON', () => {
  it('should convert array to ordered JSON', ({ assert }) => {
    assert.snapshot(
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
    );
  });
});

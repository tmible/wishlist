import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import participantsMapper from '../participants-mapper.js';

describe('participantsMapper', () => {
  it('should map participants if there are some', () => {
    assert.deepEqual(
      participantsMapper({ participants: '1,2,3' }).participants,
      [ '1', '2', '3' ],
    );
  });

  it('should map participants if there are none', () => {
    assert.deepEqual(participantsMapper({}).participants, []);
  });

  it('should map participantsIds if there are some', () => {
    assert.deepEqual(
      participantsMapper({ participants_ids: '1,2,3' }).participantsIds,
      [ '1', '2', '3' ],
    );
  });

  it('should map participantsIds if there are none', () => {
    assert.deepEqual(participantsMapper({}).participantsIds, []);
  });
});

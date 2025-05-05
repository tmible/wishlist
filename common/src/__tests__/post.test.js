import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { post } from '../post.js';

describe('post', () => {
  beforeEach(() => {
    mock.method(globalThis, 'fetch', mock.fn());
  });

  afterEach(() => {
    mock.reset();
  });

  it('should fetch', async () => {
    await post('path');
    assert.deepEqual(
      fetch.mock.calls[0].arguments,
      [
        'path',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: '{}',
        },
      ],
    );
  });

  it('should return answer', async () => {
    fetch.mock.mockImplementationOnce(() => Promise.resolve('response'));
    assert.equal(await post('path'), 'response');
  });
});

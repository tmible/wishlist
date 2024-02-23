import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { emit, subscribe } from '../event-bus.js';

describe('EventBus', () => {
  it('should register event handler and invoke it on event emit', (testContext) => {
    const handler = testContext.mock.fn();
    subscribe('event', handler);
    emit('event');
    assert.equal(handler.mock.calls.length, 1);
  });

  it('should pass arguments to handler', (testContext) => {
    const handler = testContext.mock.fn();
    subscribe('event', handler);
    emit('event', 'arg1', 'arg2');
    assert.deepEqual(handler.mock.calls[0].arguments, [ 'arg1', 'arg2' ]);
  });

  it('should return handler return', (testContext) => {
    const handler = testContext.mock.fn(() => 'return');
    subscribe('event', handler);
    assert.equal(emit('event'), 'return');
  });

  it('should allow only 1 handler', (testContext) => {
    const handlers = [ testContext.mock.fn(), testContext.mock.fn() ];
    subscribe('event', handlers[0]);
    subscribe('event', handlers[1]);
    emit('event');
    assert.deepEqual(handlers.map(({ mock }) => mock.calls.length), [ 0, 1 ]);
  });
});

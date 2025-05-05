import { strict as assert } from 'node:assert';
import { afterEach, describe, it, mock } from 'node:test';
import { emit, subscribe, unsubscribe } from '../event-bus.js';

describe('event bus', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should register event handler and invoke it on event emit', () => {
    const handler = mock.fn();
    subscribe('event', handler);
    emit('event');
    assert.notEqual(handler.mock.callCount(), 0);
  });

  it('should unsubscribe event handler', () => {
    const handler = mock.fn();
    subscribe('event', handler);
    unsubscribe('event');
    emit('event');
    assert.equal(handler.mock.callCount(), 0);
  });

  it('should pass arguments to handler', () => {
    const handler = mock.fn();
    subscribe('event', handler);
    emit('event', 'arg1', 'arg2');
    assert.deepEqual(handler.mock.calls[0].arguments, [ 'arg1', 'arg2' ]);
  });

  it('should return handler return', () => {
    const handler = mock.fn();
    handler.mock.mockImplementationOnce(() => 'return');
    subscribe('event', handler);
    assert.equal(emit('event'), 'return');
  });

  it('should allow only 1 handler', () => {
    const handlers = [ mock.fn(), mock.fn() ];
    subscribe('event', handlers[0]);
    subscribe('event', handlers[1]);
    emit('event');
    assert.equal(handlers[0].mock.callCount(), 0);
    assert.notEqual(handlers[1].mock.callCount(), 0);
  });
});

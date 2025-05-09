import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { deprive, inject, provide } from '../dependency-injector.js';

describe('dependency injector', () => {
  it('should register value and provide it on inject', () => {
    const value = 'value';
    provide('token', value);
    assert.equal(inject('token'), value);
  });

  it('should deprive value', () => {
    const value = 'value';
    provide('token', value);
    deprive('token', value);
    assert.equal(inject('token'), undefined);
  });

  it('should allow only 1 value per token', () => {
    const values = [ 'value 1', 'value 2' ];
    provide('token', values[0]);
    provide('token', values[1]);
    assert.equal(inject('token'), values[1]);
  });
});

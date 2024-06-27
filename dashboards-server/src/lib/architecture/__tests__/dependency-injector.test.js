import { describe, expect, it } from 'vitest';
import { inject, provide } from '../dependency-injector.js';

describe('dependency injector', () => {
  it('should register value and provide it on inject', () => {
    const value = 'value';
    provide('token', value);
    expect(inject('token')).toEqual(value);
  });

  it('should allow only 1 value per token', () => {
    const values = [ 'value 1', 'value 2' ];
    provide('token', values[0]);
    provide('token', values[1]);
    expect(inject('token')).toEqual(values[1]);
  });
});

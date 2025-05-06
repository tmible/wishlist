import { beforeEach, describe, expect, it } from 'vitest';
import { addOtherService } from '../domain.js';

describe('health / domain', () => {
  let health;

  beforeEach(() => {
    health = { bot: 'bot', portal: 'portal' };
  });

  describe('addOtherService', () => {
    it('should add other service when there are others', () => {
      health.service1 = { health: 'ok 1' };
      health.service2 = { health: 'ok 2' };
      expect(
        addOtherService(health),
      ).toEqual({
        ...health,
        other: { 'service1.health': 'ok 1', 'service2.health': 'ok 2' },
      });
    });

    it('should add other service when there are no others', () => {
      expect(addOtherService(health)).toEqual({ ...health, other: {} });
    });

    it('should replace other property', () => {
      health.other = 'property';
      expect(addOtherService(health)).toEqual({ ...health, other: {} });
    });
  });
});

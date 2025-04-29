import { randomUUID } from 'node:crypto';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UNKNOWN_USER_UUID_COOKIE_NAME,
} from '$lib/constants/unknown-user-uuid-cookie-name.const.js';
import { AddAction } from '../../events.js';
import { addAction } from '../add-action.js';

vi.mock('node:crypto');
vi.mock('@tmible/wishlist-common/event-bus');

const cookies = {
  get: vi.fn(),
  set: vi.fn(),
};

describe('actions / use cases / add action', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('if there is unknown user UUID', () => {
    beforeEach(() => {
      cookies.get.mockReturnValueOnce('unknownUserUuid');
      addAction('timestamp', 'action', cookies);
    });


    it('should emit AddAction event', () => {
      expect(
        vi.mocked(emit),
      ).toHaveBeenCalledWith(
        AddAction,
        'timestamp',
        'action',
        'unknownUserUuid',
      );
    });
  });

  describe('if there is no unknown user UUID', () => {
    beforeEach(() => {
      cookies.get.mockReturnValueOnce();
      vi.mocked(randomUUID).mockReturnValueOnce('random UUID');
      addAction('timestamp', 'action', cookies);
    });

    it('should generate it', () => {
      expect(vi.mocked(randomUUID)).toHaveBeenCalled();
    });

    it('should store it in cookie', () => {
      expect(cookies.set).toHaveBeenCalledWith(UNKNOWN_USER_UUID_COOKIE_NAME, 'random UUID');
    });


    it('should emit AddAction event', () => {
      expect(
        vi.mocked(emit),
      ).toHaveBeenCalledWith(
        AddAction,
        'timestamp',
        'action',
        'random UUID',
      );
    });
  });
});

import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { ReorderWishlist } from '../../events.js';
import { reorderWishlist } from '../reorder-wishlist.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const ipcHubMock = { sendMessage: vi.fn() };

describe('wishlist / use cases / reorder wishlist', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if patch is empty', () => {
    expect(() => reorderWishlist('userid', [])).toThrowError(LACK_OF_DATA_ERROR_MESSAGE);
  });

  it('should emit RunStatementAuthorized event', () => {
    reorderWishlist('userid', [ 1, 2, 3 ]);
    expect(vi.mocked(emit)).toHaveBeenCalledWith(RunStatementAuthorized, expect.any(Function), 3);
  });

  describe('statement', () => {
    beforeEach(() => {
      vi.mocked(emit).mockImplementationOnce((event, statement) => statement());
      reorderWishlist('userid', [ 'patch' ]);
    });

    it('should emit ReorderWishlist event', () => {
      expect(vi.mocked(emit)).toHaveBeenCalledWith(ReorderWishlist, 'userid', [ 'patch' ]);
    });
  });

  it('should inject IPC hub', () => {
    reorderWishlist('userid', [ 'patch' ]);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(IPCHub);
  });

  it('should send message to IPC hub', () => {
    reorderWishlist('userid', [ 'patch' ]);
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });
});

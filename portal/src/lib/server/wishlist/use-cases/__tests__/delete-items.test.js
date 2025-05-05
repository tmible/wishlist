import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteItems } from '../../events.js';
import { deleteItems } from '../delete-items.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/ipc-hub/injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));
vi.mock('$lib/server/db/events.js', () => ({ RunStatementAuthorized: 'run statement authorized' }));
vi.mock('../../events.js', () => ({ DeleteItems: 'delete items' }));

const ipcHubMock = { sendMessage: vi.fn() };

describe('wishlist / use cases / delete items', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if there are no ids', () => {
    expect(() => deleteItems('userid', [])).toThrowError(LACK_OF_DATA_ERROR_MESSAGE);
  });

  it('should emit RunStatementAuthorized event', () => {
    deleteItems('userid', [ 1, 2, 3 ]);
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      vi.mocked(RunStatementAuthorized),
      expect.any(Function),
      3,
    );
  });

  describe('statement', () => {
    beforeEach(() => {
      vi.mocked(emit).mockImplementationOnce((event, statement) => statement());
      deleteItems('userid', [ 'id' ]);
    });

    it('should emit DeleteItems event', () => {
      expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(DeleteItems), 'userid', [ 'id' ]);
    });
  });

  it('should inject IPC hub', () => {
    deleteItems('userid', [ 'id' ]);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(IPCHub));
  });

  it('should send message to IPC hub', () => {
    deleteItems('userid', [ 'id' ]);
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });
});

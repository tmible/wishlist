import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteItem } from '../../events.js';
import { deleteItem } from '../delete-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/ipc-hub/injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));
vi.mock('../../events.js', () => ({ DeleteItem: 'delete item' }));

const ipcHubMock = { sendMessage: vi.fn() };

describe('wishlist / use cases / delete item', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit RunStatementAuthorized event', () => {
    deleteItem('userid', 'id');
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      vi.mocked(RunStatementAuthorized),
      expect.any(Function),
      1,
    );
  });

  describe('statement', () => {
    beforeEach(() => {
      vi.mocked(emit).mockImplementationOnce((event, statement) => statement());
      deleteItem('userid', 'id');
    });

    it('should emit DeleteItem event', () => {
      expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(DeleteItem), 'userid', 'id');
    });
  });

  it('should inject IPC hub', () => {
    deleteItem('userid', 'id');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(IPCHub));
  });

  it('should send message to IPC hub', () => {
    deleteItem('userid', 'id');
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });
});

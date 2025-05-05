import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteCategory } from '../../events.js';
import { deleteCategory } from '../delete-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/ipc-hub/injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));
vi.mock('../../events.js', () => ({ DeleteCategory: 'delete category' }));

const ipcHubMock = { sendMessage: vi.fn() };

describe('categories / use cases / delete category', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit RunStatementAuthorized event', () => {
    deleteCategory('userid', 'id');
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      vi.mocked(RunStatementAuthorized),
      expect.any(Function),
      1,
    );
  });

  it('should emit DeleteCategory event', () => {
    vi.mocked(emit).mockImplementationOnce((a, target) => target());
    deleteCategory('userid', 'id');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(DeleteCategory), 'userid', 'id');
  });

  it('should inject IPC hub', () => {
    deleteCategory('userid', 'id');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(IPCHub));
  });

  it('should send message to IPC hub', () => {
    deleteCategory('userid', 'id');
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });
});

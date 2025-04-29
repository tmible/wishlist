import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { UpdateCategory } from '../../events.js';
import { updateCategory } from '../update-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const ipcHubMock = { sendMessage: vi.fn() };

describe('categories / use cases / update category', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit RunStatementAuthorized event', () => {
    updateCategory('userid', { id: 'id', name: 'name' });
    expect(vi.mocked(emit)).toHaveBeenCalledWith(RunStatementAuthorized, expect.any(Function), 1);
  });

  it('should emit UpdateCategory event', () => {
    vi.mocked(emit).mockImplementationOnce((a, target) => target());
    updateCategory('userid', { id: 'id', name: 'name' });
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      UpdateCategory,
      'userid',
      { id: 'id', name: 'name' },
    );
  });

  it('should inject IPC hub', () => {
    updateCategory('userid', { id: 'id', name: 'name' });
    expect(vi.mocked(inject)).toHaveBeenCalledWith(IPCHub);
  });

  it('should send message to IPC hub', () => {
    updateCategory('userid', { id: 'id', name: 'name' });
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });
});

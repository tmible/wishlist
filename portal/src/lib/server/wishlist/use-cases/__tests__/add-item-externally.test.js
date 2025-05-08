import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RunTransaction } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { GetUseridByHash } from '$lib/server/user/events.js';
import { assignOrderToNewItem, markExernallyAddedItem } from '../../domain.js';
import { AddItem, GetWishlist, InsertDescriptionEntities } from '../../events.js';
import { addItemExternally } from '../add-item-externally.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/ipc-hub/injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));
vi.mock('$lib/server/user/events.js', () => ({ GetUseridByHash: 'get userid by hash' }));
vi.mock('../../domain.js');
vi.mock(
  '../../events.js',
  () => ({
    AddItem: 'add item',
    GetWishlist: 'get wishlist',
    InsertDescriptionEntities: 'insert description entities',
  }),
);

const ipcHubMock = { sendMessage: vi.fn() };

describe('wishlist / use cases / add item externally', () => {
  beforeEach(() => {
    vi.mocked(emit).mockReturnValueOnce('target userid').mockReturnValueOnce('wishlist');
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit GetUseridByHash event', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(GetUseridByHash), 'hash');
  });

  it('should emit GetWishlist event', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(GetWishlist), 'target userid');
  });

  it('should assign order to item', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(vi.mocked(assignOrderToNewItem)).toHaveBeenCalledWith('wishlist', 'item');
  });

  it('should mark exernally added item', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(vi.mocked(markExernallyAddedItem)).toHaveBeenCalledWith('item', 'userid');
  });

  it('should emit RunTransaction event', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(RunTransaction), expect.any(Function));
  });

  describe('transaction', () => {
    let item;

    beforeEach(() => {
      item = { descriptionEntities: 'description entities' };
      vi.mocked(emit)
        .mockImplementationOnce((event, transaction) => transaction())
        .mockReturnValueOnce({ id: 'id' });
      addItemExternally('hash', item, 'userid');
    });

    it('should emit AddItem event', () => {
      expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(AddItem), 'target userid', item);
    });

    it('should emit InsertDescriptionEntities event', () => {
      expect(
        vi.mocked(emit),
      ).toHaveBeenCalledWith(
        vi.mocked(InsertDescriptionEntities),
        'id',
        'description entities',
      );
    });
  });

  it('should inject IPC hub', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(IPCHub));
  });

  it('should send message to IPC hub', () => {
    addItemExternally('hash', 'item', 'userid');
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update target userid');
  });
});

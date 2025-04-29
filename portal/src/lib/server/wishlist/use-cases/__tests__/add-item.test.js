import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RunTransaction } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { AddItem, GetItem, InsertDescriptionEntities } from '../../events.js';
import { addItem } from '../add-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const ipcHubMock = { sendMessage: vi.fn() };

describe('wishlist / use cases / add item', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit RunTransaction event', () => {
    addItem('userid', 'item');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(RunTransaction, expect.any(Function));
  });

  describe('transaction', () => {
    let item;

    beforeEach(() => {
      item = { descriptionEntities: 'description entities' };
      vi.mocked(emit)
        .mockImplementationOnce((event, transaction) => transaction())
        .mockReturnValueOnce({ id: 'id' });
      addItem('userid', item);
    });

    it('should emit AddItem event', () => {
      expect(vi.mocked(emit)).toHaveBeenCalledWith(AddItem, 'userid', item);
    });

    it('should emit InsertDescriptionEntities event', () => {
      expect(
        vi.mocked(emit),
      ).toHaveBeenCalledWith(
        InsertDescriptionEntities,
        'id',
        'description entities',
      );
    });

    it('should emit GetItem event', () => {
      expect(vi.mocked(emit)).toHaveBeenCalledWith(GetItem, 'id');
    });
  });

  it('should inject IPC hub', () => {
    addItem('userid', 'item');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(IPCHub);
  });

  it('should send message to IPC hub', () => {
    addItem('userid', 'item');
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });

  it('should return added item', () => {
    vi.mocked(emit)
      .mockImplementationOnce((event, transaction) => transaction())
      .mockReturnValueOnce({ id: 'id' })
      .mockReturnValueOnce()
      .mockReturnValueOnce('added item');
    expect(addItem('userid', 'item')).toBe('added item');
  });
});

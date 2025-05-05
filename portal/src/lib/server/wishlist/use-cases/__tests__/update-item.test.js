import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { RunStatementAuthorized, RunTransaction } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteDescriptionEntities, InsertDescriptionEntities, UpdateItem } from '../../events.js';
import { updateItem } from '../update-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock(
  '$lib/server/db/events.js',
  () => ({
    RunStatementAuthorized: 'run statement authorized',
    RunTransaction: 'run transaction',
  }),
);
vi.mock('$lib/server/ipc-hub/injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));
vi.mock(
  '../../events.js',
  () => ({
    DeleteDescriptionEntities: 'delete description entities',
    InsertDescriptionEntities: 'insert description entities',
    UpdateItem: 'update item',
  }),
);

const ipcHubMock = { sendMessage: vi.fn() };

describe('wishlist / use cases / update item', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(ipcHubMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if there are no keys to update', () => {
    expect(
      () => updateItem('userid', 'id', { random: 'propperty' }),
    ).toThrowError(
      LACK_OF_DATA_ERROR_MESSAGE,
    );
  });

  it('should emit RunTransaction event', () => {
    updateItem('userid', 'id', { name: 'name' });
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(RunTransaction), expect.any(Function));
  });

  describe('transaction', () => {
    let patch;

    beforeEach(() => {
      patch = {};
      vi.mocked(emit).mockImplementationOnce((event, transaction) => transaction());
    });

    describe('if patch has something except description entities', () => {
      beforeEach(() => {
        patch.name = 'name';
      });

      it('should emit RunStatementAuthorized event', () => {
        updateItem('userid', 'id', patch);
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
          updateItem('userid', 'id', patch);
        });

        it('should emit UpdateItem event', () => {
          expect(
            vi.mocked(emit),
          ).toHaveBeenCalledWith(
            vi.mocked(UpdateItem),
            'userid',
            'id',
            [ 'name' ],
            patch,
          );
        });
      });
    });

    describe('if patch has description entities', () => {
      beforeEach(() => {
        patch.descriptionEntities = 'description entities';
        updateItem('userid', 'id', patch);
      });

      it('should emit DeleteDescriptionEntities event', () => {
        expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(DeleteDescriptionEntities), 'id');
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
  });

  it('should inject IPC hub', () => {
    updateItem('userid', 'id', { name: 'name' });
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(IPCHub));
  });

  it('should send message to IPC hub', () => {
    updateItem('userid', 'id', { name: 'name' });
    expect(ipcHubMock.sendMessage).toHaveBeenCalledWith('update userid');
  });
});

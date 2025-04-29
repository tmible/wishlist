import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService } from '../../injection-tokens.js';
import { sendAction } from '../send-action.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const networkServiceMock = { sendAction: vi.fn() };

describe('actions / use cases / send action', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject network service', async () => {
    await sendAction('action');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
  });

  it('should send action via network', async () => {
    await sendAction('action');
    expect(networkServiceMock.sendAction).toHaveBeenCalledWith('action');
  });
});

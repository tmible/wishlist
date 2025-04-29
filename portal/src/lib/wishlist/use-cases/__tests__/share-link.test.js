import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GetUserHash } from '$lib/user/events.js';
import { LinkService } from '../../injection-tokens.js';
import { shareLink } from '../share-link.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const linkServiceMock = { shareLink: vi.fn() };

describe('wishlist / use cases / share link', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(linkServiceMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject wishlist link service', async () => {
    await shareLink('current target', 'is link for groups');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(LinkService);
  });

  it('should emit GetUserHash event', async () => {
    await shareLink('current target', 'is link for groups');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(GetUserHash);
  });

  it('should share link', async () => {
    vi.mocked(emit).mockResolvedValueOnce('hash');
    await shareLink('current target', 'is link for groups');
    expect(
      linkServiceMock.shareLink,
    ).toHaveBeenCalledWith(
      'current target',
      'is link for groups',
      'hash',
    );
  });
});

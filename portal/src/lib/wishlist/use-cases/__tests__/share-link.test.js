import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { describe, expect, it, vi } from 'vitest';
import { shareLink } from '../share-link.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/user/events.js', () => ({ GetUserHash: 'get user hash' }));
vi.mock('../../injection-tokens.js', () => ({ LinkService: 'link service' }));

const linkServiceMock = { shareLink: vi.fn() };

describe('wishlist / use cases / share link', () => {
  it('should share link', async () => {
    vi.mocked(inject).mockReturnValueOnce(linkServiceMock);
    vi.mocked(emit).mockResolvedValueOnce('hash');
    await shareLink('is link for groups');
    expect(linkServiceMock.shareLink).toHaveBeenCalledWith('is link for groups', 'hash');
  });
});

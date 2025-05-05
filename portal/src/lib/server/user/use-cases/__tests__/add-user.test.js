import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddUser } from '../../events.js';
import { addUser } from '../add-user.js';

vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../events.js', () => ({ AddUser: 'add user' }));

describe('user / use cases / add user', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit AddUser event', () => {
    addUser('userid', 'username');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(AddUser), 'userid', 'username');
  });

  it('should return AddUser event result', () => {
    vi.mocked(emit).mockReturnValueOnce('user added');
    expect(addUser()).toBe('user added');
  });
});

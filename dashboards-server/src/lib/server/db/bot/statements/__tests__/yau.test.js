import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../../injection-tokens.js';
import { GetYAU } from '../../events.js';
import { initYAUStatement } from '../yau.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('bot YAU statement', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { all: vi.fn() };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initYAUStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('should prepare statement', () => {
    initYAUStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initYAUStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(GetYAU, expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initYAUStatement();
    eventHandler('args');
    expect(statement.all).toHaveBeenCalledWith('args');
  });
});

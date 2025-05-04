import { describe, expect, it, vi } from 'vitest';
import { initBotUserUpdatesFeature } from '../initialization.js';
import { initCountBotUserUpdatesStatement } from '../statements/count.js';
import { initGetBotUserUpdatesStatement } from '../statements/get.js';

vi.mock('../statements/count.js');
vi.mock('../statements/get.js');

describe('bot user updates / initialization', () => {
  it('should init get bot user updates statement', () => {
    initBotUserUpdatesFeature();
    expect(vi.mocked(initGetBotUserUpdatesStatement)).toHaveBeenCalled();
  });

  it('should init count bot user updates statement', () => {
    initBotUserUpdatesFeature();
    expect(vi.mocked(initCountBotUserUpdatesStatement)).toHaveBeenCalled();
  });
});

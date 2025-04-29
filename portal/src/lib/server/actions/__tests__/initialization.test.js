import { describe, expect, it, vi } from 'vitest';
import { initActionsFeature } from '../initialization.js';
import { initAddActionStatement } from '../statements/add-action.js';

vi.mock('../statements/add-action.js');

describe('actions / initialization', () => {
  it('should init add action statement', () => {
    initActionsFeature();
    expect(vi.mocked(initAddActionStatement)).toHaveBeenCalled();
  });
});

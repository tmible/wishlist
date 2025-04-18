import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDashboard } from '../../domain.js';
import { NetworkFactory, StoreFactory } from '../../injection-tokens.js';
import { createDashboard } from '../create-dashboard.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../domain.js');

describe('dashboard / use cases / create dashboard', () => {
  const factorySpy = vi.fn();

  beforeEach(() => {
    vi.mocked(inject).mockReturnValue(factorySpy);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should build dashboard', () => {
    createDashboard('service', 'config');
    expect(vi.mocked(buildDashboard)).toHaveBeenCalledWith('config');
  });

  it('should inject network factory', () => {
    createDashboard('service', 'config');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkFactory);
  });

  it('should invoke network factory', () => {
    createDashboard('service', 'config');
    expect(factorySpy).toHaveBeenCalledWith('service');
  });

  it('should inject store factory', () => {
    createDashboard('service', 'config');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(StoreFactory);
  });

  it('should invoke store factory', () => {
    vi.mocked(buildDashboard).mockReturnValueOnce('dashboard');
    factorySpy.mockReturnValueOnce('network');
    createDashboard('service', 'config');
    expect(factorySpy).toHaveBeenCalledWith('dashboard', 'network');
  });

  it('should provide store', () => {
    factorySpy.mockReturnValueOnce().mockReturnValueOnce('store');
    createDashboard('service', { key: 'configKey' });
    expect(vi.mocked(provide)).toHaveBeenCalledWith('service configKey store', 'store');
  });
});

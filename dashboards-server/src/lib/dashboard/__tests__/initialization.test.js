import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDashboardFeature } from '../initialization.js';
import { NetworkFactory, StoreFactory } from '../injection-tokens.js';
import { createGetData } from '../network.service.js';
import { createStore } from '../store.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('chart.js/auto');
vi.mock('chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm');
vi.mock('chartjs-plugin-annotation');
vi.mock(
  '../injection-tokens.js',
  () => ({ NetworkFactory: 'network factory', StoreFactory: 'store factory' }),
);

describe('dashboard / initialization', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register annotationPlugin', () => {
    initDashboardFeature();
    expect(vi.mocked(Chart.register)).toHaveBeenCalledWith(vi.mocked(annotationPlugin));
  });

  it('should provide store factory', () => {
    initDashboardFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(StoreFactory), createStore);
  });

  it('should provide network factory', () => {
    initDashboardFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(NetworkFactory), createGetData);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      initDashboardFeature()();
    });

    it('should deprive store factory', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(StoreFactory));
    });

    it('should deprive network factory', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NetworkFactory));
    });
  });
});

// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { readable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NetworkFactory as DashboardNetworkFactory,
  StoreFactory as DashboardStoreFactory,
} from '$lib/dashboard/injection-tokens.js';
import { createGetData } from '$lib/dashboard/network.service.js';
import { createStore as dashboardStoreFactory } from '$lib/dashboard/store.js';
import Layout from '../+layout.svelte';

vi.mock('chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('chart.js/auto');
vi.mock('chartjs-plugin-annotation');
vi.mock(
  '$lib/components/theme-switch.svelte',
  async () => await import('./mock.svelte'),
);
vi.mock('$lib/dashboard/injection-tokens.js');
vi.mock('$lib/dashboard/network.service.js');
vi.mock('$lib/dashboard/store.js');
vi.mock(
  '$lib/gradient/switch.svelte',
  async () => await import('./mock.svelte'),
);
vi.mock(
  '$lib/health/indicator.svelte',
  async () => await import('./mock.svelte'),
);
vi.mock('$lib/user/store.js', () => ({ user: readable({ isAuthenticated: null }) }));
vi.mock('$lib/user/use-cases/logout.js');

describe('dashboards layout', () => {
  beforeEach(() => {
    render(Layout);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register annotationPlugin', () => {
    expect(vi.mocked(Chart.register)).toHaveBeenCalledWith(vi.mocked(annotationPlugin));
  });

  it('should provide dashboard store factory', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(DashboardStoreFactory, dashboardStoreFactory);
  });

  it('should provide dashboard network factory', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(DashboardNetworkFactory, createGetData);
  });
});

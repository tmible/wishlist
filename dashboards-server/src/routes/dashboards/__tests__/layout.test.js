// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDashboardFeature } from '$lib/dashboard/initialization.js';
import Layout from '../+layout.svelte';

vi.mock(
  '@tmible/wishlist-ui/theme/switch',
  async () => await import('./mock.svelte'),
);
vi.mock('$lib/dashboard/initialization.js');
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
    vi.mocked(initDashboardFeature).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should init dashboard feature', () => {
    render(Layout);
    expect(vi.mocked(initDashboardFeature)).toHaveBeenCalled();
  });

  describe('on destroy', () => {
    it('should destroy dashboard feature', () => {
      const destroyDashboardFeature = vi.fn();
      vi.mocked(initDashboardFeature).mockReturnValueOnce(destroyDashboardFeature);
      render(Layout).unmount();
      expect(destroyDashboardFeature).toHaveBeenCalled();
    });
  });
});

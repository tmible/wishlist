// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated.js';
import Login from '../+page.svelte';

vi.mock('$app/navigation');
vi.mock('$lib/components/gradient-switcher.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));
vi.mock('$lib/components/theme-switcher.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));

describe('login', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('on form success', () => {
    it('should set isAuthenticated', () => {
      vi.spyOn(isAuthenticated, 'set');
      render(Login, { form: { success: true } });
      expect(isAuthenticated.set).toHaveBeenCalledWith(true);
    });

    it('should redirect to /dashboards', () => {
      render(Login, { form: { success: true } });
      expect(goto).toHaveBeenCalledWith('/dashboards');
    });
  });
});

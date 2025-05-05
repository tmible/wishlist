// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { login } from '$lib/user/use-cases/login.js';
import Login from '../+page.svelte';

vi.mock(
  '@tmible/wishlist-ui/theme/switch',
  async () => await import('./mock.svelte'),
);
vi.mock(
  '$lib/gradient/switch.svelte',
  async () => await import('./mock.svelte'),
);
vi.mock('$lib/user/use-cases/login.js');

describe('login', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('on form success', () => {
    it('should invoke login use case', () => {
      render(Login, { form: { success: true } });
      expect(vi.mocked(login)).toHaveBeenCalled();
    });
  });
});

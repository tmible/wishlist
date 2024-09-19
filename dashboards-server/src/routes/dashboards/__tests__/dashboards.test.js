// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import Dashboards from '../+page.svelte';

vi.mock('$app/navigation');

describe('dashboards', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login page', () => {
    render(Dashboards);
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/dashboards/bot');
  });
});

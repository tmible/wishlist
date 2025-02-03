import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getData } from '$lib/get-data';
import { load } from '../+page.js';

let browserMock;
const fetchMock = vi.fn();

vi.mock('svelte/store');
vi.mock('$lib/get-data', () => ({ getData: vi.fn() }));
vi.mock(
  '$app/environment',
  () => ({
    get browser() {
      return browserMock;
    },
  }),
);

describe('dashboards/portal endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should return placeholder object not in browser', async () => {
    browserMock = false;
    expect(
      await load({ fetch: fetchMock }),
    ).toEqual({
      timeDashboard: [],
      activeUsersDashboard: [],
      successRate: null,
      authenticationFunnel: null,
    });
  });

  describe('in browser', () => {
    beforeEach(async () => {
      browserMock = true;
      get.mockReturnValue([
        { isDisplayed: true, key: '0' },
        { isDisplayed: false, key: '1' },
      ]);
      await load({ fetch: fetchMock });
    });

    it('should get time dashboard data', () => {
      expect(
        getData,
      ).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/portal\/0\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get only displayed time dashboard data', () => {
      expect(
        getData,
      ).not.toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/portal\/1\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get active user dashboard data', () => {
      expect(
        getData,
      ).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/portal\/0\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get only displayed active users dashboard data', () => {
      expect(
        getData,
      ).not.toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/portal\/1\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get success rate data', () => {
      expect(
        getData,
      ).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/portal\/successRate\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get authentication funnel data', () => {
      expect(
        getData,
      ).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/portal\/authenticationFunnel\?periodStart=\d+$/),
        fetchMock,
      );
    });
  });
});

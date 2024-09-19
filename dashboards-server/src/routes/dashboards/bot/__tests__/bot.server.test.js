import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getData } from '$lib/get-data';
import { load } from '../+page';

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

describe('dashboards/bot endpoint', () => {
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
      userSessions: [],
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
        expect.stringMatching(/^\/api\/data\/0\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get only displayed time dashboard data', () => {
      expect(
        getData,
      ).not.toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/1\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get active user dashboard data', () => {
      expect(
        getData,
      ).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/0\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get only displayed active users dashboard data', () => {
      expect(
        getData,
      ).not.toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/1\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get success rate data', () => {
      expect(
        getData,
      ).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/data\/successRate\?periodStart=\d+$/),
        fetchMock,
      );
    });

    it('should get user sessions data', () => {
      expect(getData).toHaveBeenCalledWith('/api/data/userSessions', fetchMock);
    });
  });
});

import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartBuilders } from '../chart-builders.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('$app/environment', () => ({ browser: true }));
vi.hoisted(() => {
  vi.stubGlobal(
    'getComputedStyle',
    vi.fn().mockReturnValue({
      getPropertyValue: vi.fn((argument) => argument),
    }),
  );
  vi.stubGlobal('document', { documentElement: 'documentElement' });
});

describe('dashboard / chart builders', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  for (const chart of [ 'time', 'activeUsers', 'rps' ]) {
    describe('for light theme', () => {
      beforeEach(() => {
        vi.mocked(inject).mockReturnValueOnce({ isDarkTheme: () => false });
        vi.spyOn(Date, 'now').mockReturnValueOnce('now');
      });

      it(`should build ${chart} chart with data`, () => {
        expect(
          ChartBuilders[chart](
            [
              { label: 'chart 1', data: [{ timestamp: 2, value: 3 }] },
              { label: 'chart 2', data: undefined },
            ],
            0,
            1,
          ),
        ).toMatchSnapshot();
      });

      it(`should build ${chart} chart without data`, () => {
        expect(ChartBuilders[chart]([], 0, 1)).toMatchSnapshot();
      });
    });

    describe('for dark theme', () => {
      beforeEach(() => {
        vi.mocked(inject).mockReturnValueOnce({ isDarkTheme: () => true });
        vi.spyOn(Date, 'now').mockReturnValueOnce('now');
      });

      it(`should build ${chart} chart with data`, () => {
        expect(
          ChartBuilders[chart](
            [
              { label: 'chart 1', data: [{ timestamp: 2, value: 3 }] },
              { label: 'chart 2', data: undefined },
            ],
            0,
            1,
          ),
        ).toMatchSnapshot();
      });

      it(`should build ${chart} chart without data`, () => {
        expect(ChartBuilders[chart]([], 0, 1)).toMatchSnapshot();
      });
    });
  }

  for (const chart of [ 'successRate', 'authenticationFunnel' ]) {
    it(`should build ${chart} chart with data`, () => {
      expect(ChartBuilders[chart]([{ data: 0.5 }])).toMatchSnapshot();
    });

    it(`should build ${chart} chart without data`, () => {
      expect(ChartBuilders[chart]([{ data: undefined }])).toMatchSnapshot();
    });
  }
});

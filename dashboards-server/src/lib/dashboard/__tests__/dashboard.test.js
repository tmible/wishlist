// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { deprive, inject } from '@tmible/wishlist-common/dependency-injector';
import { Chart } from 'chart.js/auto';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PERIOD } from '$lib/constants/period.const.js';
import { ChartBuilders } from '../chart-builders.js';
import { ChartUpdateAnimation } from '../chart-update-animation.js';
import Dashboard from '../dashboard.svelte';
import { createDashboard } from '../use-cases/create-dashboard.js';

const service = 'service';
const config = { key: 'key' };

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('chart.js/auto');
vi.mock('../chart-builders.js', () => ({ ChartBuilders: { key: vi.fn() } }));
vi.mock('../chart-update-animation.js', () => ({ ChartUpdateAnimation: { key: vi.fn() } }));
vi.mock('../use-cases/create-dashboard.js');

describe('dashboard / dashboard', () => {
  let store;
  let themeService;

  beforeEach(() => {
    store = writable({
      period: PERIOD.DAY,
      charts: new Map([
        [ 'chart 1', { label: 'chart 1', data: undefined, isDisplayed: true } ],
        [ 'chart 2', { label: 'chart 2', data: undefined, isDisplayed: true } ],
        [ 'chart 3', { label: 'chart 3', data: undefined, isDisplayed: false } ],
      ]),
    });
    themeService = { subscribeToTheme: vi.fn().mockReturnValue(vi.fn()) };
    vi.mocked(inject).mockReturnValueOnce(store).mockReturnValueOnce(themeService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('on create', () => {
    it('should create dashboard', () => {
      render(Dashboard, { service, config });
      expect(vi.mocked(createDashboard)).toHaveBeenCalledWith(service, config);
    });
  });

  describe('on mount', () => {
    it('should inject store', () => {
      render(Dashboard, { service, config });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(`${service} ${config.key} store`);
    });

    it('should build chart', () => {
      vi.spyOn(Date, 'now').mockReturnValue(0);
      render(Dashboard, { service, config });
      expect(
        vi.mocked(ChartBuilders[config.key]),
      ).toHaveBeenCalledWith(
        [
          { label: 'chart 1', data: undefined, isDisplayed: true },
          { label: 'chart 2', data: undefined, isDisplayed: true },
        ],
        -PERIOD.DAY,
        PERIOD.DAY,
      );
    });

    it('should create chart', () => {
      vi.mocked(ChartBuilders[config.key]).mockReturnValueOnce('chart config');
      render(Dashboard, { service, config });
      expect(vi.mocked(Chart)).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 'chart config');
    });

    it('should subscribe to store', () => {
      vi.spyOn(store, 'subscribe');
      render(Dashboard, { service, config });
      expect(vi.mocked(store.subscribe)).toHaveBeenCalledWith(expect.any(Function));
    });

    describe('on store update', () => {
      let dashboard;

      beforeEach(() => {
        dashboard = { data: 'previos data', options: 'previos options', update: vi.fn() };
        vi.mocked(Chart).mockReturnValueOnce(dashboard);
        render(Dashboard, { service, config });
        vi.mocked(ChartBuilders[config.key]).mockClear();
        vi.mocked(
          ChartBuilders[config.key],
        ).mockReturnValueOnce(
          { data: 'current data', options: 'current options' },
        );
      });

      it('should build new chart', () => {
        store.update((value) => value);
        expect(vi.mocked(ChartBuilders[config.key])).toHaveBeenCalled();
      });

      it('should set new data to dashboard', () => {
        store.update((value) => value);
        expect(dashboard.data).toBe('current data');
      });

      it('should set new options to dashboard', () => {
        store.update((value) => value);
        expect(dashboard.options).toBe('current options');
      });

      describe('animation criteria', () => {
        it('should call animation criteria', () => {
          store.update((value) => value);
          expect(
            vi.mocked(ChartUpdateAnimation[config.key]),
          ).toHaveBeenCalledWith(
            { data: 'previos data', options: 'previos options' },
            { data: 'current data', options: 'current options' },
          );
        });

        it('should use animation criteria if it returns true', () => {
          vi.mocked(ChartUpdateAnimation[config.key]).mockReturnValueOnce(true);
          store.update((value) => value);
          expect(dashboard.update).toHaveBeenCalledWith();
        });

        it('should use animation criteria if it returns false', () => {
          vi.mocked(ChartUpdateAnimation[config.key]).mockReturnValueOnce(false);
          store.update((value) => value);
          expect(dashboard.update).toHaveBeenCalledWith('none');
        });
      });

      it('should update dashboard', () => {
        store.update((value) => value);
        expect(dashboard.update).toHaveBeenCalled();
      });
    });

    it('should subscribe to theme', () => {
      render(Dashboard, { service, config });
      expect(themeService.subscribeToTheme).toHaveBeenCalledWith(expect.any(Function));
    });

    describe('on theme change', () => {
      let dashboard;
      let themeSubscriber;

      beforeEach(() => {
        dashboard = { data: 'previos data', options: 'previos options', update: vi.fn() };
        vi.mocked(Chart).mockReturnValueOnce(dashboard);
        themeService.subscribeToTheme.mockImplementation(
          (subscriber) => {
            themeSubscriber = subscriber;
            return vi.fn();
          },
        );
        render(Dashboard, { service, config });

        // first call to get through skipFirstCall
        themeSubscriber();
        vi.mocked(ChartBuilders[config.key]).mockClear();
        vi.mocked(
          ChartBuilders[config.key],
        ).mockReturnValueOnce(
          { data: 'current data', options: 'current options' },
        );
      });

      it('should build new chart', () => {
        themeSubscriber({});
        expect(vi.mocked(ChartBuilders[config.key])).toHaveBeenCalled();
      });

      it('should not set new data to dashboard', () => {
        themeSubscriber({});
        expect(dashboard.data).toBe('previos data');
      });

      it('should set new options to dashboard', () => {
        themeSubscriber({});
        expect(dashboard.options).toBe('current options');
      });

      describe('animation criteria', () => {
        it('should call animation criteria', () => {
          themeSubscriber({});
          expect(
            vi.mocked(ChartUpdateAnimation[config.key]),
          ).toHaveBeenCalledWith(
            { data: 'previos data', options: 'previos options' },
            { data: 'current data', options: 'current options' },
          );
        });

        it('should use animation criteria if it returns true', () => {
          vi.mocked(ChartUpdateAnimation[config.key]).mockReturnValueOnce(true);
          themeSubscriber({});
          expect(dashboard.update).toHaveBeenCalledWith();
        });

        it('should use animation criteria if it returns false', () => {
          vi.mocked(ChartUpdateAnimation[config.key]).mockReturnValueOnce(false);
          themeSubscriber({});
          expect(dashboard.update).toHaveBeenCalledWith('none');
        });
      });

      it('should update dashboard', () => {
        themeSubscriber({});
        expect(dashboard.update).toHaveBeenCalled();
      });
    });
  });

  describe('on destory', () => {
    it('should unsubscribe from store', () => {
      const unsubscribe = vi.fn();
      vi.spyOn(
        store,
        'subscribe',
      ).mockImplementation(
        (subscriber) => {
          subscriber({ period: PERIOD.DAY, charts: new Map() });
          return unsubscribe;
        },
      );
      render(Dashboard, { service, config }).unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('should deprive store', () => {
      render(Dashboard, { service, config }).unmount();
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(`${service} ${config.key} store`);
    });

    it('should unsubscribe from theme', () => {
      const unsubscribe = vi.fn();
      themeService.subscribeToTheme.mockReturnValueOnce(unsubscribe);
      render(Dashboard, { service, config }).unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});

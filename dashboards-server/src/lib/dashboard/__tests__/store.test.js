import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from '../store.js';

describe('dashboard / store', () => {
  let initialValue;
  let fetchDataStub;

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(10);
    initialValue = {
      period: 1,
      charts: new Map([
        [ 'chart 1', { data: undefined, isDisplayed: true } ],
        [ 'chart 2', { data: undefined, isDisplayed: true } ],
        [ 'chart 3', { data: undefined, isDisplayed: false } ],
      ]),
    };
    fetchDataStub = vi.fn(
      (keys, periodStart) => keys.map(
        (key) => `${key} data from network for period ${periodStart}`,
      ),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should immediately call subscription', () => {
      const subscriber = vi.fn();
      const unsubscribe = createStore('initial value', vi.fn()).subscribe(subscriber);
      unsubscribe();
      expect(subscriber).toHaveBeenCalledWith('initial value');
    });

    describe('on first subscriber', () => {
      beforeEach(() => {
        vi.stubGlobal('setInterval', vi.fn());
      });

      describe('if there is initial data', () => {
        let store;
        let unsubscribe;

        beforeEach(() => {
          initialValue.initialData = { 'chart 1': 'chart 1 initial data' };
          store = createStore(initialValue, fetchDataStub);
          vi.useFakeTimers();
        });

        afterEach(() => {
          unsubscribe();
          vi.useRealTimers();
          delete initialValue.initialData;
        });

        it('should set initial data and fetch missing data', async () => {
          let value;
          unsubscribe = store.subscribe(vi.fn((storeValue) => value = storeValue));
          await vi.advanceTimersToNextTimerAsync();
          expect(value).toMatchSnapshot();
        });

        it('should not reuse initial data', async () => {
          unsubscribe = store.subscribe(vi.fn());
          await vi.advanceTimersToNextTimerAsync();
          unsubscribe();
          let value;
          unsubscribe = store.subscribe(vi.fn((storeValue) => value = storeValue));
          await vi.advanceTimersToNextTimerAsync();
          expect(value).toMatchSnapshot();
        });
      });

      describe('if there is no initial data', () => {
        it('should fetch all charts data', async () => {
          let value;
          vi.useFakeTimers();
          const unsubscribe = createStore(
            initialValue,
            fetchDataStub,
          ).subscribe(
            vi.fn((storeValue) => value = storeValue),
          );
          await vi.advanceTimersToNextTimerAsync();
          unsubscribe();
          vi.useRealTimers();
          expect(value).toMatchSnapshot();
        });
      });

      it('should set auto update interval', () => {
        const unsubscribe = createStore('initial value', vi.fn()).subscribe(vi.fn());
        unsubscribe();
        expect(vi.mocked(setInterval)).toHaveBeenCalled();
      });
    });

    describe('on last subscriber', () => {
      it('should clear timeout', () => {
        vi.stubGlobal('setTimeout', vi.fn().mockReturnValueOnce('timeout'));
        vi.stubGlobal('clearTimeout', vi.fn());
        createStore('initial value', vi.fn()).subscribe(vi.fn())();
        expect(vi.mocked(clearTimeout)).toHaveBeenCalledWith('timeout');
      });

      it('should clear interval', () => {
        vi.stubGlobal('setInterval', vi.fn().mockReturnValueOnce('interval'));
        vi.stubGlobal('clearInterval', vi.fn());
        createStore('initial value', vi.fn()).subscribe(vi.fn())();
        expect(vi.mocked(clearInterval)).toHaveBeenCalledWith('interval');
      });
    });
  });

  describe('updatePeriod', () => {
    it('should fetch data if it wasn\'t used since last auto update', async () => {
      let value;
      const store = createStore(initialValue, fetchDataStub);
      vi.useFakeTimers();
      vi.stubGlobal('setInterval', vi.fn());
      const unsubscribe = store.subscribe(vi.fn((storeValue) => value = storeValue));
      await vi.advanceTimersToNextTimerAsync();
      store.updatePeriod(2);
      await vi.advanceTimersToNextTimerAsync();
      unsubscribe();
      vi.useRealTimers();
      expect(value).toMatchSnapshot();
    });

    it('should not fetch data if it was used since last auto update', async () => {
      const store = createStore(initialValue, fetchDataStub);
      vi.useFakeTimers();
      vi.stubGlobal('setInterval', vi.fn());
      const unsubscribe = store.subscribe(vi.fn());
      await vi.advanceTimersToNextTimerAsync();
      store.updatePeriod(2);
      await vi.advanceTimersToNextTimerAsync();
      fetchDataStub.mockClear();
      store.updatePeriod(1);
      await vi.advanceTimersToNextTimerAsync();
      unsubscribe();
      vi.useRealTimers();
      expect(fetchDataStub).not.toHaveBeenCalled();
    });
  });

  describe('updateChartsSelection', () => {
    it('should fetch missing data', async () => {
      let value;
      const store = createStore(initialValue, fetchDataStub);
      vi.useFakeTimers();
      vi.stubGlobal('setInterval', vi.fn());
      const unsubscribe = store.subscribe(vi.fn((storeValue) => value = storeValue));
      await vi.advanceTimersToNextTimerAsync();
      store.updateChartsSelection([ 'chart 1', 'chart 3' ]);
      await vi.advanceTimersToNextTimerAsync();
      unsubscribe();
      vi.useRealTimers();
      expect(value).toMatchSnapshot();
    });

    it('should notify subscribers even though no data is missing', async () => {
      let value;
      const store = createStore(initialValue, fetchDataStub);
      vi.useFakeTimers();
      vi.stubGlobal('setInterval', vi.fn());
      const unsubscribe = store.subscribe(vi.fn((storeValue) => value = storeValue));
      await vi.advanceTimersToNextTimerAsync();
      store.updateChartsSelection([ 'chart 1' ]);
      await vi.advanceTimersToNextTimerAsync();
      unsubscribe();
      vi.useRealTimers();
      expect(value).toMatchSnapshot();
    });
  });

  describe('auto update', () => {
    it('should auto update displayed charts', async () => {
      initialValue.initialData = { 'chart 1': 'chart 1 initial data' };
      let value;
      const store = createStore(initialValue, fetchDataStub);
      vi.useFakeTimers();
      vi.spyOn(Date, 'now').mockReturnValue(10);
      const unsubscribe = store.subscribe(vi.fn((storeValue) => value = storeValue));
      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();
      unsubscribe();
      vi.useRealTimers();
      expect(value).toMatchSnapshot();
    });

    it('should clear periods cache', async () => {
      const store = createStore(initialValue, fetchDataStub);
      vi.useFakeTimers();
      vi.spyOn(Date, 'now').mockReturnValue(10);
      const unsubscribe = store.subscribe(vi.fn());
      await vi.advanceTimersToNextTimerAsync();
      store.updatePeriod(2);
      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();
      fetchDataStub.mockClear();
      store.updatePeriod(1);
      await vi.advanceTimersToNextTimerAsync();
      unsubscribe();
      vi.useRealTimers();
      expect(fetchDataStub).toHaveBeenCalled();
    });
  });
});

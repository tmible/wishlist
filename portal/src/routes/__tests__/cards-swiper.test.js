// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { onDestroy, onMount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CardsSwiper from '../cards-swiper.svelte';

vi.mock('svelte');

describe('cards', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    cleanup();
  });

  it('should ignore swipes during welcome animation', () => {
    let mountHandler;
    const classList = { add: vi.fn() };
    vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
    vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
    const { container } = render(CardsSwiper);
    mountHandler();
    fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
    fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    expect(classList.add).toHaveBeenCalledTimes(1);
  });

  it('should ignore swipes during another swipe handle', () => {
    let mountHandler;
    const classList = { add: vi.fn(), remove: vi.fn() };
    vi.useFakeTimers();
    vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
    vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
    const { container } = render(CardsSwiper);
    mountHandler();
    vi.advanceTimersToNextTimer();
    fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
    fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
    fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    expect(classList.add).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  describe('on overswipe up', () => {
    let classList;

    beforeEach(() => {
      let mountHandler;
      classList = { add: vi.fn(), remove: vi.fn() };
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      const { container } = render(CardsSwiper);
      mountHandler();
      vi.advanceTimersToNextTimer();
      fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 1 }] });
      fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 0 }] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add overswipe class to swiper', () => {
      expect(classList.add).toHaveBeenCalledWith('overswiped-up');
    });

    it('should set timeout to remove overswipe class from swiper', () => {
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 375);
    });

    it('should remove overswipe class from swiper on timeout', () => {
      vi.advanceTimersByTime(375);
      expect(classList.remove).toHaveBeenCalledWith('overswiped-up');
    });
  });

  describe('on overswipe down', () => {
    let classList;

    beforeEach(() => {
      let mountHandler;
      classList = { add: vi.fn(), remove: vi.fn() };
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      const { container } = render(CardsSwiper);
      mountHandler();
      vi.advanceTimersToNextTimer();
      fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
      fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add overswipe class to swiper', () => {
      expect(classList.add).toHaveBeenCalledWith('overswiped-down');
    });

    it('should set timeout to remove overswipe class from swiper', () => {
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 375);
    });

    it('should remove overswipe class from swiper on timeout', () => {
      vi.advanceTimersByTime(375);
      expect(classList.remove).toHaveBeenCalledWith('overswiped-down');
    });
  });

  describe('on swipe up', () => {
    const cards = new Array(2).fill(null).map(() => ({ classList: { add: vi.fn() } }));
    let classList;

    beforeEach(() => {
      let mountHandler;
      classList = { add: vi.fn(), remove: vi.fn() };
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue(cards);
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      const { container } = render(CardsSwiper);
      mountHandler();
      vi.advanceTimersToNextTimer();
      fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 1 }] });
      fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 0 }] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add shown class to corresponding card', () => {
      expect(cards[1].classList.add).toHaveBeenCalledWith('shown');
    });

    it('should add swipe class to swiper', () => {
      expect(classList.add).toHaveBeenCalledWith('swiped-up');
    });

    it('should set timeout to remove swipe class from swiper', () => {
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 375);
    });

    it('should remove swipe class from swiper on timeout', () => {
      vi.advanceTimersByTime(375);
      expect(classList.remove).toHaveBeenCalledWith('swiped-up');
    });
  });

  describe('on swipe down', () => {
    const cards = new Array(2).fill(null).map(() => ({
      classList: { add: vi.fn(), remove: vi.fn() },
    }));
    let classList;

    beforeEach(() => {
      let mountHandler;
      classList = { add: vi.fn(), remove: vi.fn() };
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue(cards);
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      const { container } = render(CardsSwiper);
      mountHandler();
      vi.advanceTimersToNextTimer();
      for (let i = 1; i < cards.length; ++i) {
        fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 1 }] });
        fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 0 }] });
        vi.advanceTimersToNextTimer();
      }
      fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
      fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add shown class to corresponding card', () => {
      expect(cards[1].classList.remove).toHaveBeenCalledWith('shown');
    });

    it('should add swipe class to swiper', () => {
      expect(classList.add).toHaveBeenCalledWith('swiped-down');
    });

    it('should set timeout to remove swipe class from swiper', () => {
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 375);
    });

    it('should remove swipe class from swiper on timeout', () => {
      vi.advanceTimersByTime(375);
      expect(classList.remove).toHaveBeenCalledWith('swiped-down');
    });
  });

  describe('on mount', () => {
    let mountHandler;

    beforeEach(() => {
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      render(CardsSwiper);
    });

    it('should select cards swiper', () => {
      vi.spyOn(document, 'querySelector');
      mountHandler();
      expect(document.querySelector).toHaveBeenCalledWith('.cards-swiper');
    });

    it('should start welcome animation', () => {
      const classList = { add: vi.fn() };
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      mountHandler();
      expect(classList.add).toHaveBeenCalledWith('welcome-animation');
    });

    it('should set timeout to remove welcome animation', () => {
      vi.stubGlobal('setTimeout', vi.fn().mockReturnValue('timeout'));
      mountHandler();
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('should remove welcome animation on timeout', () => {
      const classList = { add: vi.fn(), remove: vi.fn() };
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.useFakeTimers();
      mountHandler();
      vi.advanceTimersByTime(2000);
      expect(classList.remove).toHaveBeenCalledWith('welcome-animation');
      vi.useRealTimers();
    });

    it('should select cards', () => {
      mountHandler();
      expect(vi.mocked(document.querySelectorAll)).toHaveBeenCalledWith('.cards-swiper > *');
    });

    it('should mark first card', () => {
      const classList = { add: vi.fn() };
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList }]);
      mountHandler();
      expect(classList.add).toHaveBeenCalledWith('shown');
    });
  });

  describe('on destroy', () => {
    let destroyHandler;

    beforeEach(() => {
      vi.stubGlobal('clearTimeout', vi.fn());
      vi.mocked(onDestroy).mockImplementation((...args) => [ destroyHandler ] = args);
    });

    it('should not clear timer if there is none', () => {
      render(CardsSwiper);
      destroyHandler();
      expect(vi.mocked(clearTimeout)).not.toHaveBeenCalled();
    });

    it('should clear timer if there is one', () => {
      let mountHandler;
      vi.stubGlobal('setTimeout', vi.fn().mockReturnValue('timeout'));
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      render(CardsSwiper);
      mountHandler();
      destroyHandler();
      expect(vi.mocked(clearTimeout)).toHaveBeenCalledWith('timeout');
    });
  });
});

// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CardsSwiper from '../cards-swiper.svelte';

describe('cards', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should ignore swipes during welcome animation', () => {
    const classList = { add: vi.fn() };
    vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
    const { container } = render(CardsSwiper);
    fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
    fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    expect(classList.add).toHaveBeenCalledTimes(1);
  });

  it('should ignore swipes during another swipe handle', () => {
    const classList = { add: vi.fn(), remove: vi.fn() };
    vi.useFakeTimers();
    vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
    const { container } = render(CardsSwiper);
    vi.advanceTimersToNextTimer();
    fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
    fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 0 }] });
    fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 1 }] });
    vi.useRealTimers();
    expect(classList.add).toHaveBeenCalledTimes(2);
  });

  describe('on overswipe up', () => {
    let classList;

    beforeEach(() => {
      classList = { add: vi.fn(), remove: vi.fn() };
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      const { container } = render(CardsSwiper);
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
      classList = { add: vi.fn(), remove: vi.fn() };
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      const { container } = render(CardsSwiper);
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

  const swipeUpTests = [
    { description: 'on swipe up', startScreenY: 1, endScreenY: 0 },
    { description: 'on touch in upper half', startScreenY: 0, endScreenY: 0, pageY: 1 },
  ];

  for (const { description, startScreenY, endScreenY, pageY } of swipeUpTests) {
    describe(description, () => {
      const cards = new Array(2).fill(null).map(() => ({ classList: { add: vi.fn() } }));
      let classList;

      beforeEach(() => {
        classList = { add: vi.fn(), remove: vi.fn() };
        vi.useFakeTimers();
        vi.spyOn(window, 'setTimeout');
        vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
        vi.spyOn(document, 'querySelectorAll').mockReturnValue(cards);
        const { container } = render(CardsSwiper);
        vi.advanceTimersToNextTimer();
        fireEvent.touchStart(container.firstChild, { touches: [{ screenY: startScreenY }] });
        fireEvent.touchEnd(
          container.firstChild,
          { changedTouches: [{ screenY: endScreenY, pageY }] },
        );
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
  }

  const swipeDownTests = [
    { description: 'on swipe down', startScreenY: 0, endScreenY: 1 },
    { description: 'on touch in lower half', startScreenY: 0, endScreenY: 0, pageY: -1 },
  ];

  for (const { description, startScreenY, endScreenY, pageY } of swipeDownTests) {
    describe(description, () => {
      const cards = new Array(2).fill(null).map(() => ({
        classList: { add: vi.fn(), remove: vi.fn() },
      }));
      let classList;

      beforeEach(() => {
        classList = { add: vi.fn(), remove: vi.fn() };
        vi.useFakeTimers();
        vi.spyOn(window, 'setTimeout');
        vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
        vi.spyOn(document, 'querySelectorAll').mockReturnValue(cards);
        const { container } = render(CardsSwiper);
        vi.advanceTimersToNextTimer();
        for (let i = 1; i < cards.length; ++i) {
          fireEvent.touchStart(container.firstChild, { touches: [{ screenY: 1 }] });
          fireEvent.touchEnd(container.firstChild, { changedTouches: [{ screenY: 0 }] });
          vi.advanceTimersToNextTimer();
        }
        fireEvent.touchStart(container.firstChild, { touches: [{ screenY: startScreenY }] });
        fireEvent.touchEnd(
          container.firstChild,
          { changedTouches: [{ screenY: endScreenY, pageY }] },
        );
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
  }

  describe('on mount', () => {
    beforeEach(() => {
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
      render(CardsSwiper);
    });

    it('should select cards swiper', () => {
      vi.spyOn(document, 'querySelector');
      render(CardsSwiper);
      expect(document.querySelector).toHaveBeenCalledWith('.cards-swiper');
    });

    it('should start welcome animation', () => {
      const classList = { add: vi.fn() };
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      render(CardsSwiper);
      expect(classList.add).toHaveBeenCalledWith('welcome-animation');
    });

    it('should set timeout to remove welcome animation', () => {
      vi.stubGlobal('setTimeout', vi.fn().mockReturnValue('timeout'));
      render(CardsSwiper);
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('should remove welcome animation on timeout', () => {
      const classList = { add: vi.fn(), remove: vi.fn() };
      vi.spyOn(document, 'querySelector').mockReturnValueOnce({ classList });
      vi.useFakeTimers();
      render(CardsSwiper);
      vi.advanceTimersByTime(2000);
      vi.useRealTimers();
      expect(classList.remove).toHaveBeenCalledWith('welcome-animation');
    });

    it('should select cards', () => {
      render(CardsSwiper);
      expect(vi.mocked(document.querySelectorAll)).toHaveBeenCalledWith('.cards-swiper > *');
    });

    it('should mark first card', () => {
      const classList = { add: vi.fn() };
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList }]);
      render(CardsSwiper);
      expect(classList.add).toHaveBeenCalledWith('shown');
    });
  });

  describe('on destroy', () => {
    beforeEach(() => {
      vi.stubGlobal('clearTimeout', vi.fn());
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([{ classList: { add: vi.fn() } }]);
    });

    it('should not clear timer if there is none', () => {
      vi.stubGlobal('setTimeout', vi.fn().mockReturnValue(null));
      const { unmount } = render(CardsSwiper);
      unmount();
      expect(vi.mocked(clearTimeout)).not.toHaveBeenCalled();
    });

    it('should clear timer if there is one', () => {
      vi.stubGlobal('setTimeout', vi.fn().mockReturnValue('timeout'));
      const { unmount } = render(CardsSwiper);
      unmount();
      expect(vi.mocked(clearTimeout)).toHaveBeenCalledWith('timeout');
    });
  });
});

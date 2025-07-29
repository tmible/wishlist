<!-- @component Вертикальная карусель карточек для мобильных устройств -->
<script>
  import { onDestroy, onMount } from 'svelte';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  /**
   * Элемент, внутри которого карточки
   * @type {HTMLElement}
   */
  let cardsSwiper;

  /**
   * Карточки
   * @type {HTMLElement[]}
   */
  let cards = $state([]);

  /**
   * Количество видимых карточек
   * @type {number}
   */
  let shownCardsNumber = $state(1);

  /**
   * Начальная координата свайпа
   * @type {number}
   */
  let swipeStartY;

  /**
   * Таймаут удаления классов для анимации
   * @type {ReturnType<setTimeout>}
   */
  let timeout;

  /**
   * Признак игнорирования жестов пользователя на время анимаций
   * @type {boolean}
   */
  let isSwipeIgnored = false;

  /**
   * Фиксация [начальной координаты свайпа]{@link swipeStartY}
   * @function onTouchStart
   * @param {TouchEvent} event Событие начала касания
   * @returns {void}
   */
  const onTouchStart = (event) => {
    swipeStartY = event.touches[0].screenY;
  };

  /**
   * Определение координаты верха элемента по оси Y
   * @function getElementYPosition
   * @param {HTMLElement} element Элемент
   * @returns {number} Координата верха элемента по оси Y
   */
  const getElementYPosition = (element) => {
    let yPosition = 0;

    for (let el = element; el !== null; el = el.offsetParent) {
      if (el.tagName === 'BODY') {
        const yScrollPos = el.scrollTop || document.documentElement.scrollTop;
        yPosition += (el.offsetTop - yScrollPos + el.clientTop);
        break;
      } else {
        yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      }
    }

    return yPosition;
  };

  /**
   * Определение направления свайпа. Если произошло касание без движения, определяется, в верхней
   * или нижней половине карточки оно произошло
   * @function establishSwipeDirection
   * @param {TouchEvent} event Событие окончания касания
   * @returns {boolean} Признак направления свайпа вниз
   */
  const establishSwipeDirection = (event) => {
    const swipeEndY = event.changedTouches[0].screenY;
    if (swipeStartY === swipeEndY) {
      const top = getElementYPosition(event.currentTarget);
      const middle = top + (event.currentTarget.offsetHeight / 2);
      return event.changedTouches[0].pageY < middle;
    }
    return swipeEndY - swipeStartY > 0;
  };

  /**
   * Обработка свайпа вниз. Возврат очередной карточки вниз, если видимы больше 1,
   * или анимация, сигнализирующая о том, что за видимой карточкой других нет
   * @function onSwipeDown
   * @returns {string} Класс, который нужно добавить {@link cardsSwiper}
   */
  const onSwipeDown = () => {
    let cardsSwiperClass = 'overswiped-down';
    if (shownCardsNumber > 1) {
      cards[shownCardsNumber - 1].classList.remove('shown');
      cardsSwiperClass = 'swiped-down';
      shownCardsNumber -= 1;
    }
    return cardsSwiperClass;
  };

  /**
   * Обработка свайпа вверх. Подъём очередной карточки снизу, если видимы
   * ещё не все, или анимация, сигнализирующая о том, что видимы все карточки
   * @function onSwipeUp
   * @returns {string} Класс, который нужно добавить {@link cardsSwiper}
   */
  const onSwipeUp = () => {
    let cardsSwiperClass = 'overswiped-up';
    if (shownCardsNumber < cards.length) {
      cards[shownCardsNumber].classList.add('shown');
      cardsSwiperClass = 'swiped-up';
      shownCardsNumber += 1;
    }
    return cardsSwiperClass;
  };

  /**
   * Обработка окончания касания. Если [касания не игнорируются]{@link isSwipeIgnored},
   * [Определение направления свайпа]{@link establishSwipeDirection}, обработка свайпа
   * в соответствии с направлением {@link onSwipeDown} {@link onSwipeUp} и установка соответствующих
   * классов для анимаций
   * @function onTouchEnd
   * @param {TouchEvent} event Событие окончания касания
   * @returns {void}
   */
  const onTouchEnd = (event) => {
    if (isSwipeIgnored) {
      return;
    }
    isSwipeIgnored = true;
    const cardsSwiperClass = establishSwipeDirection(event) ? onSwipeDown() : onSwipeUp();
    cardsSwiper.classList.add(cardsSwiperClass);
    timeout = setTimeout(() => {
      cardsSwiper.classList.remove(cardsSwiperClass);
      isSwipeIgnored = false;
    }, 375);
  };

  /**
   * Приветственная анимация и инициализация {@link cardsSwiper}
   * {@link cards} {@link shownCardsNumber}
   */
  onMount(() => {
    cardsSwiper = document.querySelector('.cards-swiper');
    isSwipeIgnored = true;
    cardsSwiper.classList.add('welcome-animation');
    timeout = setTimeout(() => {
      cardsSwiper.classList.remove('welcome-animation');
      isSwipeIgnored = false;
    }, 2000);
    cards = document.querySelectorAll('.cards-swiper > .card');
    cards[0].classList.add('shown');
    shownCardsNumber = 1;
  });

  /**
   * Удаление таймаута при наличии
   */
  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
</script>

<div
  class="md:hidden relative w-full h-[310px] cards-swiper"
  ontouchstart={onTouchStart}
  ontouchend={onTouchEnd}
>
  {@render children?.()}
  <span class="absolute top-full left-1/2 -translate-x-1/2 text-sm counter">
    {shownCardsNumber}/{cards.length}
  </span>
</div>

<style>
  @reference "../app.css";

  :global(html:has(.cards-swiper)) {
    @apply overflow-hidden;
    @apply overscroll-none;
  }

  @keyframes cardAnimation {
    0% {
      transform: translateY(var(--initial-translate, 0)) scale(var(--initial-scale, 1));
    }
    50% {
      transform: translateY(var(--intermediate-translate, 0)) scale(var(--intermediate-scale, 1));
    }
    100% {
      transform: translateY(var(--initial-translate, 0)) scale(var(--initial-scale, 1));
    }
  }

  .cards-swiper:global(.welcome-animation > .counter) {
    @apply hidden;
  }

  .cards-swiper:global(.welcome-animation > .card) {
    animation: 2s cardAnimation;
  }

  .cards-swiper:global(.welcome-animation > .card:nth-child(1)) {
    --initial-translate: -100%;
    --intermediate-translate: -100%;
    --intermediate-scale: 0.9;
  }

  .cards-swiper:global(.welcome-animation > .card:nth-child(n+2))  {
    --intermediate-translate: calc(-30% + var(--index) * 20px);
    --initial-scale: 1.1;
  }

  .cards-swiper:global(.welcome-animation > .card:nth-child(2))  {
    --index: 0;
  }

  .cards-swiper:global(.welcome-animation > .card:nth-child(3))  {
    --index: 1;
  }

  .cards-swiper > :global(.card) {
    @apply absolute;
    @apply top-full;
    @apply h-full;
    @apply transition-all;
    transform: translateY(0) scale(1.1);
    transition-property: transform, top;
    transition-duration: 375ms;
    /* timig function из tailwind .transition-all */
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cards-swiper > :global(.card.shown) {
    transform: translateY(-100%) scale(0.9);
  }

  .cards-swiper > :global(.card:nth-last-child(1 of .shown)) {
    transform: translateY(-100%) scale(1);
  }

  .cards-swiper > :global(.card:not(.shown)) {
    top: calc(100% + 32px);
  }

  .cards-swiper > :global(.card:nth-child(1 of .card:not(.shown))) {
    @apply top-full;
    @apply shadow-md-upside;
  }

  .cards-swiper > :global(.card:nth-child(2 of .card:not(.shown))),
  .cards-swiper > :global(
    .card:nth-child(1 of .card:not(.shown)):nth-last-child(1 of .card:not(.shown))
  ) {
    @apply shadow-md-upside;
    top: calc(100% + 10px);
  }

  .cards-swiper:global(.overswiped-up > .card.shown) {
    --initial-translate: -100%;
    --intermediate-translate: calc(-100% - 20px);
    animation: 375ms cardAnimation;
  }

  .cards-swiper:global(.overswiped-down > .card.shown) {
    --initial-translate: -100%;
    --intermediate-translate: calc(-100% + 20px);
    animation: 375ms cardAnimation;
  }
</style>

<!-- Svelte компонент -- вертикальная карусель карточек для мобильных устройств -->
<script>
  import { onDestroy, onMount } from 'svelte';

  /**
   * Элемент, внутри которого карточки
   * @type {HTMLElement}
   */
  let cardsSwiper;

  /**
   * Карточки
   * @type {HTMLElement[]}
   */
  let cards;

  /**
   * Количество видимых карточек
   * @type {number}
   */
  let shownCardsNumber;

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
   * @param {Event} event Событие начала касания
   * @returns {void}
   */
  const onTouchStart = (event) => {
    swipeStartY = event.touches[0].screenY;
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
   * Определение направления свайпа, обработка свайпа в соответствии с направлением
   * {@link onSwipeDown} {@link onSwipeUp} и установка соответствующих классов для анимаций
   * @function onTouchEnd
   * @param {Event} event Событие окончания касания
   * @returns {void}
   */
  const onTouchEnd = (event) => {
    if (isSwipeIgnored) {
      return;
    }
    isSwipeIgnored = true;
    const swipeEndY = event.changedTouches[0].screenY;
    const cardsSwiperClass = swipeEndY - swipeStartY > 0 ? onSwipeDown() : onSwipeUp();
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
    cards = document.querySelectorAll('.cards-swiper > *');
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
  class="md:hidden relative w-full h-[310px] text-[0.75rem] cards-swiper"
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
>
  <slot />
</div>

<style>
  :global(html) {
    @apply overflow-hidden;
    @apply overscroll-none;
  }

  :root {
    /* timig function из tailwind .transition-all */
    --timig-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes allowing {
    0% {
      transform: scale(1) rotateX(0deg);
    }
    50% {
      transform: scale(0.9) rotateX(-7deg);
    }
    100% {
      transform: scale(1) rotateX(0deg);
    }
  }

  @keyframes teasing {
    0% {
      top: 110%;
    }
    50% {
      top: calc(70% + var(--index) * 20px);
    }
    100% {
      top: 110%;
    }
  }

  .cards-swiper {
    perspective: 200px;
  }

  .cards-swiper:global(.welcome-animation > *:first-child)  {
    animation: 2s var(--timig-function) allowing;
  }

  .cards-swiper:global(.welcome-animation > *:nth-child(n+2))  {
    /* .shadow-sm, но вверх, а не вниз */
    box-shadow: 0 -1px 2px 0 rgb(0 0 0 / 0.05);
    animation:
      2s var(--timig-function) allowing,
      2s var(--timig-function) teasing;
  }

  :global(html[data-theme="dark"] .cards-swiper.welcome-animation > *:nth-child(n+2))  {
    box-shadow: 0 -1px 2px 0 rgb(200 200 200 / 0.05);
  }

  .cards-swiper:global(.welcome-animation > *:nth-child(2))  {
    --index: 0;
  }

  .cards-swiper:global(.welcome-animation > *:nth-child(3))  {
    --index: 1;
  }

  .cards-swiper > :global(*) {
    @apply absolute;
    @apply top-full;
    @apply h-full;
    @apply transition-all;
    transform: scaleX(0) rotateX(-52.2245deg);
    transition-property: transform, top;
    transition-duration: 375ms;
  }

  .cards-swiper > :global(.shown) {
    @apply top-0;
    transform: scale(1) rotateX(0deg);
  }

  .cards-swiper:global(.swiped-up > *:nth-last-child(n + 2 of .shown)) {
    animation: 375ms var(--timig-function) allowing;
  }

  .cards-swiper:global(.swiped-down > .shown) {
    animation: 375ms var(--timig-function) allowing;
  }

  @keyframes overswiped {
    0% {
      top: 0;
    }
    50% {
      top: var(--overswipe-offset);
    }
    100% {
      top: 0;
    }
  }

  .cards-swiper:global(.overswiped-up > .shown) {
    --overswipe-offset: -20px;
    animation: 375ms var(--timig-function) overswiped;
  }

  .cards-swiper:global(.overswiped-down > .shown) {
    --overswipe-offset: 20px;
    animation: 375ms var(--timig-function) overswiped;
  }
</style>

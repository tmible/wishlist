<!-- Svelte компонет -- карточки для главной страницы неавторизованной зоны -->
<script>
  import { waitForElement } from '$lib/wait-for-element.js';

  /**
   * @typedef {object} Props
   * @property {boolean} [isVisible] Признак того, что карточки отображаются
   */

  /** @type {Props} */
  const { isVisible } = $props();

  /**
   * Элемент, внутрь которого добавится виджет авторизации Телеграма
   * @type {HTMLElement}
   */
  let telegramLoginWidgetContainer;

  /**
   * Ожидание выполнения скрипта Телеграма и подстановка виджета авторизации либо от скрипта, либо
   * из карточек, отображаемых для другой ширины экрана, так как виджет должен быть один на странице
   */
  $effect(async () => {
    if (!isVisible) {
      return;
    }
    const telegramLoginWidget = await waitForElement(
      '[id="telegram-login-tmible_wishlist_bot"]',
      [
        document.head,
        ...Array.from(document.querySelectorAll('.telegram-login-widget-container')),
      ],
    );
    telegramLoginWidget.title = 'Telegram login widget';
    /* eslint-disable-next-line svelte/no-dom-manipulating -- по-другому не получается. Скрипт
      Телеграма вставляет виджет после себя, а чтобы скрипт выполнился, он должен быть в <head> */
    telegramLoginWidgetContainer?.append(telegramLoginWidget);
  });
</script>

<div class="card bg-base-100 md:shadow-xl w-full md:w-1/3 md:order-2 main-card-center">
  <div
    bind:this={telegramLoginWidgetContainer}
    class="card-body items-center prose text-[0.75rem] telegram-login-widget-container"
  >
    <p>
      Tmible's wishlist&nbsp;— это инструмент для работы со&nbsp;списками желаний. Его
      основная задача&nbsp;— сократить путь от&nbsp;списка до&nbsp;общения между
      дарителями с&nbsp;максимальным удобством для всех участников процесса. Работайте
      со&nbsp;своим списком здесь, на&nbsp;портале, со&nbsp;списками друзей&nbsp;—
      <span class="whitespace-nowrap">
        в
        <a
          class="whitespace-normal"
          href="https://t.me/tmible_wishlist_bot"
          target="_blank"
        >
          телеграм боте
        </a>
      </span>
    </p>
  </div>
</div>
<div
  class="
    card
    bg-base-100
    md:shadow-xl
    w-full
    md:w-1/4
    md:order-1
    main-card-left
    prose
    text-[0.75rem]
  "
>
  <ul class="card-body justify-center">
    <li class="my-0">Создавайте и&nbsp;редактируйте свой список</li>
    <li class="my-0">Делитесь своим списком по&nbsp;ссылке</li>
    <li class="my-0">Отмечайтесь под подарками в&nbsp;списках друзей</li>
    <li class="my-0">Отправляйте анонимные сообщения</li>
    <li class="my-0">Быстро очищайте список после праздника</li>
    <li class="my-0">Упорядочивайте и&nbsp;группируйте свой список, если нужно</li>
    <li class="my-0">Добавляйте бота в&nbsp;группы для совместного обсуждения</li>
  </ul>
</div>
<div class="card bg-base-100 md:shadow-xl w-full md:w-1/4 md:order-3 main-card-right">
  <div class="card-body h-full">
    <div class="w-full h-0 my-0 mx-auto grow">
      <img
        class="max-w-full max-h-full my-0 mx-auto mask mask-circle aspect-square"
        loading="lazy"
        decoding="async"
        src="avatar_square.jpg"
        alt="bot avatar"
      >
    </div>
    <p class="font-bold text-center prose-base max-md:my-0 grow-0">Tmible's wishlist</p>
    <a class="grow-0" href="https://t.me/tmible_wishlist_bot" target="_blank">
      <button class="btn w-full">
        Перейти к боту
      </button>
    </a>
  </div>
</div>

<style>
  @keyframes popUp {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(25%) skew(var(--skew, 0));
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0) skew(0);
    }
  }

  @media (min-width: 768px) {
    .main-card-center, .main-card-left, .main-card-right {
      animation-name: popUp;
      animation-duration: var(--animation-duration);
      animation-timing-function: ease-out;
      animation-fill-mode: both;
    }

    .main-card-center {
      animation-delay: var(--animation-duration);
    }

    .main-card-left, .main-card-right {
      animation-delay: calc(1.5 * var(--animation-duration));
    }

    .main-card-left {
      --skew: -10deg, -10deg;
    }

    .main-card-right {
      --skew: 10deg, 10deg;
    }
  }
</style>

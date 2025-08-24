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
      '[id="telegram-login-wishnibot"]',
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

<div class="card md:card-lg bg-base-100 md:shadow-xl w-full md:order-2 main-card-center">
  <div
    bind:this={telegramLoginWidgetContainer}
    class="card-body items-center prose telegram-login-widget-container"
  >
    <p class="text-justify">
      Wishni&nbsp;— это инструмент для работы со&nbsp;списками желаний. Его
      основная задача&nbsp;— сократить путь от&nbsp;списка до&nbsp;общения между
      дарителями с&nbsp;максимальным удобством для всех участников процесса. Работайте
      со&nbsp;своим списком здесь, на&nbsp;портале, со&nbsp;списками друзей&nbsp;—
      <span class="whitespace-nowrap">
        в
        <a
          class="whitespace-normal"
          href="https://t.me/wishnibot"
          target="_blank"
        >
          телеграм боте
        </a>
      </span>
    </p>
  </div>
</div>
<div class="card md:card-lg bg-base-100 md:shadow-xl w-full md:order-1 main-card-left">
  <div class="card-body justify-center prose">
    <ul>
      <li class="not-prose">Создавайте и&nbsp;редактируйте свой список</li>
      <li class="not-prose">Делитесь своим списком по&nbsp;ссылке</li>
      <li class="not-prose">Отмечайтесь под подарками в&nbsp;списках друзей</li>
      <li class="not-prose">Используйте созданные ботом группы для кооперации</li>
      <li class="not-prose">Добавляйте сюрпризы в&nbsp;списки друзей</li>
      <li class="not-prose">Отправляйте анонимные сообщения</li>
      <li class="not-prose">Быстро очищайте список после праздника</li>
      <li class="not-prose">Упорядочивайте и&nbsp;группируйте свой список</li>
      <li class="not-prose">Добавляйте бота в&nbsp;группы</li>
    </ul>
  </div>
</div>
<div class="card bg-base-100 md:shadow-xl w-full md:order-3 main-card-right">
  <div class="card-body h-full">
    <div class="flex items-start justify-center w-full h-0 my-0 mx-auto grow">
      <div
        class="
          w-full
          h-full
          mask
          mask-circle
          flex
          items-center
          justify-center
          bg-linear-[0deg,#8f6be8_0%,#d66ba3_100%]
        "
      >
        <img
          class="max-w-2/3 max-h-2/3 aspect-square"
          loading="lazy"
          decoding="async"
          src="b295874c13920d8210a955f26a9ecdc7.webp"
          alt="bot avatar"
        >
      </div>
    </div>
    <p class="font-bold text-center prose max-md:my-0 grow-0">Wishni</p>
    <a class="grow-0" href="https://t.me/wishnibot" target="_blank">
      <button class="btn w-full">
        Перейти к боту
      </button>
    </a>
  </div>
</div>

<style>
  @reference "../app.css";

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
      @apply duration-(--animation-duration);
      @apply ease-out;
      @apply fill-mode-both;
    }

    .main-card-center {
      @apply delay-(--animation-duration);
    }

    .main-card-left, .main-card-right {
      --delay: calc(1.5 * var(--animation-duration));
      @apply delay-(--delay);
    }

    .main-card-left {
      --skew: -10deg, -10deg;
    }

    .main-card-right {
      --skew: 10deg, 10deg;
    }
  }
</style>

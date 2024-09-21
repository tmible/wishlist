<!-- Svelte компонет -- главная страница неавторизованной зоны (лендинг) -->
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { user } from '$lib/store/user';
  import { waitForElement } from '$lib/wait-for-element.js';

  onMount(async () => {
    document.querySelector('[id="telegram-login-widget-container"]')?.append(
      await waitForElement('[id="telegram-login-tmible_wishlist_bot"]', document.head),
    );
  });
</script>

<svelte:head>
  {#if browser && !$user.isAuthenticated}
    <script
      async
      src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="tmible_wishlist_bot"
      data-size="large"
      data-auth-url="/api/authSuccess"
      data-request-access="write"
    />
  {/if}
</svelte:head>

{#if browser && !$user.isAuthenticated}
  <div class="h-dvh bg-[url('/bg.svg')] bg-no-repeat bg-cover bg-base-200 overflow-hidden">
    <div class="w-full h-full flex flex-col dark:backdrop-brightness-75">
      <div class="navbar">
        <div class="pl-12 md:pl-24 mr-auto relative self-start">
          <a href="https://t.me/tmible" target="_blank">
            <div class="absolute top-[-0.5rem] p-2 bg-[#ffd1dc]" data-theme="light">
              tmible
            </div>
          </a>
        </div>
        <div class="mr-4">
          <ThemeSwitcher />
        </div>
      </div>
      <div class="hero grow">
        <div class="hero-content flex-col prose md:p-0 h-full md:h-auto justify-end">
          <div class="grow md:grow-0 flex items-center">
            <h1 class="mb-0 md:mb-16 text-[22vw] md:text-[11vw] text-center main-header">
              Tmible's wishlist
            </h1>
          </div>
          <div
            class="
              grid
              md:flex
              md:flex-row
              w-full
              justify-around
              text-[0.75rem]
              h-[310px]
              md:h-auto
              overflow-y-auto
              md:overflow-y-visible
              main-cards
            "
          >
            <div class="card bg-base-100 md:shadow-xl w-full md:w-1/3 md:order-2 main-card-center">
              <div id="telegram-login-widget-container" class="card-body items-center">
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
            <div class="card bg-base-100 md:shadow-xl w-full md:w-1/4 md:order-1 main-card-left">
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
                    class="max-w-full max-h-full my-0 mx-auto mask mask-circle"
                    loading="lazy"
                    decoding="async"
                    src="avatar_square.jpg"
                    alt="bot avatar"
                  />
                </div>
                <p class="font-bold text-center prose-base max-md:my-0 grow-0">Tmible's wishlist</p>
                <a class="grow-0" href="https://t.me/tmible_wishlist_bot" target="_blank">
                  <button class="btn w-full">
                    Перейти к боту
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :root {
    --animation-duration: 0.75s;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .main-header {
    animation: var(--animation-duration) ease-out both fadeIn;
  }

  @keyframes popUpCenter {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(25%);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes popUpLeft {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(25%) skew(-10deg, -10deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0) skew(0);
    }
  }

  @keyframes popUpRight {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(25%) skew(10deg, 10deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0) skew(0);
    }
  }

  .main-card-center, .main-card-left, .main-card-right {
    animation-duration: var(--animation-duration);
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }

  .main-card-center {
    animation-delay: var(--animation-duration);
  }

  @media (min-width: 768px) {
    .main-card-center {
      animation-name: popUpCenter;
    }

    .main-card-left, .main-card-right {
      animation-delay: calc(1.5 * var(--animation-duration));
    }

    .main-card-left {
      animation-name: popUpLeft;
    }

    .main-card-right {
      animation-name: popUpRight;
    }
  }

  @media (max-width: 768px) {
    .main-cards {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(3, 310px);
      gap: 200px;
    }

    .main-card-center, .main-card-left, .main-card-right {
      position: sticky;
      top: 0;
      animation-name: fadeIn;
    }

    .main-card-left, .main-card-right {
      animation-timeline: view();
      animation-range: entry;
    }
  }
</style>

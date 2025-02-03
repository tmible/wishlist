<!-- Svelte компонет -- главная страница неавторизованной зоны (лендинг) -->
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { md } from '$lib/store/breakpoints.js';
  import { user } from '$lib/store/user';
  import Cards from './cards.svelte';
  import CardsSwiper from './cards-swiper.svelte';

  // Отправка на сервер действия посещения лендинга
  onMount(async () => {
    if (!$user.isAuthenticated) {
      await fetch(
        '/api/actions',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify({
            timestamp: Date.now(),
            action: 'landing visit',
          }),
        },
      );
    }
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
        <div class="pl-4 md:pl-24 mr-auto relative self-start">
          <a href="https://t.me/tmible" target="_blank">
            <div class="absolute top-[-0.5rem] p-2 bg-[#ffd1dc]" data-theme="light">
              tmible
            </div>
          </a>
        </div>
        <div class="mr-2 md:mr-4">
          <ThemeSwitcher />
        </div>
      </div>
      <div class="hero grow">
        <div class="hero-content flex-col md:p-0 h-full md:h-auto justify-end">
          <div class="grow md:grow-0 flex items-center prose">
            <h1
              class="
                md:mb-16
                text-[22vw]
                md:text-[11vw]
                2xl:text-[160px]
                text-center
                dark:text-gray-300
                main-header
              "
            >
              Tmible's wishlist
            </h1>
          </div>
          <CardsSwiper>
            <Cards isVisible={!$md} />
          </CardsSwiper>
          <div
            class="
              hidden
              md:flex
              md:flex-row
              w-full
              justify-around
              h-auto
              overflow-y-visible
              main-cards
            "
          >
            <Cards isVisible={$md} />
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
</style>

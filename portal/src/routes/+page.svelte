<!-- Svelte компонет -- главная страница неавторизованной зоны (лендинг) -->
<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { sendAction } from '$lib/actions/use-cases/send-action.js';
  import { md } from '$lib/breakpoints.js';
  import Header from '$lib/components/header.svelte';
  import { user } from '$lib/user/store.js';
  import Cards from './cards.svelte';
  import CardsSwiper from './cards-swiper.svelte';

  // Отправка на сервер действия посещения лендинга
  onMount(async () => {
    if (!$user.isAuthenticated) {
      await sendAction('landing visit');
    }
  });
</script>

<svelte:head>
  {#if browser && !$user.isAuthenticated}
    <script
      defer
      src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="tmible_wishlist_bot"
      data-size="large"
      data-auth-url="/api/authSuccess"
      data-request-access="write"
    ></script>
  {/if}
</svelte:head>

{#if browser && !$user.isAuthenticated}
  <div class="w-full h-full flex flex-col">
    <Header />
    <main class="hero grow">
      <div class="hero-content flex-col md:p-0 h-full md:h-auto justify-end">
        <div class="grow md:grow-0 flex items-center prose">
          <h1
            class="
              md:mb-16
              text-[22vw]
              md:text-[11vw]
              2xl:text-[160px]
              text-center
              main-header
              animate-in
              fade-in-0
              zoom-in-[0.8]
              ease-out
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
    </main>
  </div>
{/if}

<style>
  :root {
    --animation-duration: 0.75s;
  }

  .main-header {
    animation-duration: var(--animation-duration);
  }
</style>

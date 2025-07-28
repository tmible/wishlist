<!-- @component Форма добавления сюрприза в список желаний -->
<script>
  import ScrollArea from '@tmible/wishlist-ui/scroll-area';
  import { onDestroy } from 'svelte';
  import Header from '$lib/components/header.svelte';
  import WishlistItemForm from '$lib/wishlist/components/item-form.svelte';
  import { initWishlistFeature } from '$lib/wishlist/initialization.js';

  /**
   * Регистрация зависисмостей для работы со списком желаний
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destroyWishlistFeature = initWishlistFeature();

  /**
   * Признак успешного добавления сюрприза
   * @type {boolean}
   */
  let success = false;

  /**
   * Хэш пользователя, к списку желаний которого добавляется сюрприз
   * @type {string | undefined}
   */
  const targetUserHash = new URLSearchParams(window.location.search).get('wishlist');

  /**
   * Переход к боту
   * @function goToBot
   * @returns {void}
   */
  const goToBot = () => {
    // eslint-disable-next-line sonarjs/link-with-target-blank -- Статичная ссылка на Телеграм
    window.open('https://t.me/wishnibot', '_self');
  };

  onDestroy(() => {
    destroyWishlistFeature();
  });
</script>

{#snippet botButton()}
  <a class="w-full md:flex-1 md:basis-1/3" href="https://t.me/wishnibot">
    <button class="btn btn-primary w-full">
      Вернуться к боту
    </button>
  </a>
{/snippet}

<ScrollArea class="h-full" viewportClasses="w-full h-full max-h-dvh">
  <div class="flex flex-col h-full">
    <Header />
    <main class="grow-1 pt-6 md:pt-12 pb-0 md:pb-12 md:mx-6 lg:w-1/3 lg:mx-auto">
      <div class="card h-full md:h-auto bg-base-100 md:shadow-xl">
        <div class="card-body prose">
          {#if targetUserHash}
            {#if success}
              <h3 class="card-title">Успех</h3>
              <p>Можете добавить ещё или вернуться к боту</p>
              <div class="card-actions">
                <button
                  class="btn btn-neutral w-full md:flex-1 md:basis-1/3"
                  onclick={() => success = false}
                >
                  Добавить ещё
                </button>
                {@render botButton()}
              </div>
            {:else}
              <WishlistItemForm
                onsuccess={() => success = true}
                oncancel={goToBot}
                {targetUserHash}
              />
            {/if}
          {:else}
            <h3 class="card-title">Что-то пошло не так</h3>
            <p>Запросите новую ссылку и попробуйте ещё раз</p>
            {@render botButton()}
          {/if}
        </div>
      </div>
    </main>
  </div>
</ScrollArea>

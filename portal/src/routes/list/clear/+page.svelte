<!-- @component Страница быстрой очистки списка. Реализует механику свайпа карточек -->
<script>
  import clearWishlistItemsComparator from '@tmible/wishlist-common/clear-wishlist-items-comparator';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Ban from 'lucide-svelte/icons/ban';
  import Check from 'lucide-svelte/icons/check';
  import Info from 'lucide-svelte/icons/info';
  import Pointer from 'lucide-svelte/icons/pointer';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import { getContext, onDestroy, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { CardSwiper } from '$lib/card-swiper';
  import { wishlist } from '$lib/wishlist/store.js';
  import { deleteItems } from '$lib/wishlist/use-cases/delete-items.js';
  import { cardsImage } from './cards-image.js';
  import Hint from './hint.svelte';

  /** @typedef {import('svelte').Component} Component */
  /** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */

  /**
   * Массив идентификаторов элементов списка к удалению
   * @type {number[]}
   */
  let toDelete = [];

  /**
   * Список желаний пользователя, отсортированный для быстрой очистки
   * @type {OwnWishlistItem[]}
   */
  const wishlistSorted = $derived($wishlist.toSorted(clearWishlistItemsComparator));

  /**
   * Признак пересечения карточкой границы, после которой отпускание
   * карточки приведёт к выполнению соответствующего стороне действия
   * @type {-1 | 0 | 1}
   */
  let thresholdPassed = $state(0);

  /**
   * Эмуляция свайпа карточки
   * @type {(direction: 'left' | 'right') => void}
   */
  let swipe = $state(() => {});

  /**
   * Признак видимости подсказки
   * @type {boolean}
   */
  let isHintShown = $state(false);

  /**
   * Отметка элемента списка к удалению при соответствующем направлении свайпа
   * @typedef {import('$lib/card-swiper').Direction} Direction
   * @typedef {import('$lib/card-swiper').CardData} CardData
   * @function markListItem
   * @param {{ direction: Direction, data: CardData }} payload Полезная нагрузка события
   * @param {Direction} payload.direction Направление свайпа
   * @param {CardData} payload.data Данные свайпнутой карточки
   * @returns {void}
   */
  const markListItem = ({ direction, data }) => {
    if (direction === 'left') {
      toDelete.push(data.id);
    }
  };

  /**
   * Получение данных следующей за текущей видимой карточкой
   * @function cardData
   * @param {number} i Индекс получаемой карточки
   * @returns {import('$lib/card-swiper').CardData} Данные следующей карточки
   */
  const cardData = (i) => {
    if (i === $wishlist.length) {
      return { title: '' };
    }
    if (i > $wishlist.length) {
      goto('/list');
      return {};
    }
    return {
      title: wishlistSorted[i].name,
      image: $cardsImage,
      id: wishlistSorted[i].id,
      description: wishlistSorted[i].isExternal ? 'сюрприз' : '',
    };
  };

  /**
   * Возврат на главную страницу авторизованной зоны, если список пуст
   * @function gotoList
   * @returns {void}
   */
  const gotoList = () => {
    if (($wishlist ?? []).length === 0) {
      goto('/list');
    }
  };

  /**
   * Отмена удаления элементов из списка и возврат к предыдущей странице
   * @function cancel
   * @returns {void}
   */
  const cancel = () => {
    toDelete = [];
    history.back();
  };

  /**
   * Кнопки действий быстрой очистки
   * @type {{ color?: string; Icon: Component; onClick: () => void; testId: string }[]}
   */
  const actionButtons = [{
    color: 'text-error',
    Icon: Trash2,
    onClick: () => swipe('left'),
    testId: 'delete',
  }, {
    Icon: Ban,
    onClick: cancel,
    testId: 'cancel',
  }, {
    color: 'text-success',
    Icon: Check,
    onClick: () => swipe('right'),
    testId: 'save',
  }];


  /**
   * Подсказки для кнопок действий быстрой очистки (а также кнопки отображения подсказок)
   * @type {string[]}
   */
  const ACTION_BUTTON_HINTS = [
    'Удалить подарок',
    'Отменить очистку',
    'Справка',
    'Оставить подарок',
  ];

  // onMount не может быть асинхронной функцией, поэтому такой механизм
  onMount(() => {
    let wishlistAwaiter = gotoList;
    getContext('get wishlist promise').then(wishlistAwaiter);
    return () => wishlistAwaiter = undefined;
  });

  // Запрос на удаление элементов, карточки которых были свайпнуты влево
  onDestroy(async () => await deleteItems(toDelete));
</script>

{#snippet ActionButtonHint({ hint })}
  <div class="w-14 h-0 relative">
    <div
      class="
        absolute
        bottom-2
        left-1/2
        -translate-x-1/2
        p-2
        rounded-field
        bg-neutral
        text-neutral-content
        text-center
        animate-in
        fade-in
      "
    >
      {hint}
    </div>
  </div>
{/snippet}

{#snippet ActionButton({ color, Icon, onClick, onMouseDown, testId })}
  <div class="bg-base-100 rounded-full">
    <button
      class={`btn btn-xl btn-neutral btn-outline btn-circle max-md:border-none ${color}`}
      onclick={onClick}
      onmousedown={onMouseDown}
      data-testid={testId}
    >
      <Icon />
    </button>
  </div>
{/snippet}

{#snippet HintButton()}
  <Hint bind:isShown={isHintShown}>
    {#snippet trigger({ onClick, onMouseDown })}
      {@render ActionButton({
        color: 'text-info',
        Icon: Info,
        onClick,
        onMouseDown,
        testId: 'show-hints',
      })}
    {/snippet}
    {#snippet content()}
      <div
        class="
          fixed
          top-4
          left-1/2
          -translate-x-1/2
          p-4
          rounded-field
          bg-neutral
          text-neutral-content
          w-full
          md:w-1/2
          animate-in
          slide-in-from-top-1/4
          fade-in
        "
        data-testid="hint"
        out:fly={{ y: '-25%' }}
      >
        <div class="flex gap-8 pl-4 items-center">
          <Pointer
            class="
              w-4
              h-4
              shrink-0
              origin-bottom
              animate-out
              duration-2000
              -rotate-30
              spin-out-60
              repeat-infinite
              direction-alternate
              ease-in-out
            "
          />
          Свайпайте карточки влево, чтобы удалить подарок, и&nbsp;вправо, чтобы оставить.
          Если передумаете, отмените очистку.
        </div>
        <br>
        <div class="flex gap-4 items-center">
          <Trash2 class="w-4 h-4 shrink-0" />
          <Check class="w-4 h-4 shrink-0" />
          Альтернативно можете использовать кнопки внизу.
        </div>
        <br>
        <div class="flex gap-4 items-center">
          <ArrowLeft class="w-4 h-4 shrink-0" />
          <ArrowRight class="w-4 h-4 shrink-0" />
          Если у&nbsp;вас подключена клавиатура, также можете использовать клавиши
          со&nbsp;стрелками.
        </div>
      </div>
    {/snippet}
  </Hint>
{/snippet}

{#if ($wishlist ?? []).length > 0}

  <div class="flex flex-col w-dvw h-dvh md:w-1/3 mx-auto overflow-hidden">
    <CardSwiper {cardData} onSwipe={markListItem} bind:swipe bind:thresholdPassed />
    <div class="flex justify-between p-4 relative">
      {#if isHintShown}
        <div class="flex justify-between w-full px-4 absolute left-0 -translate-y-full" out:fly>
          {#each ACTION_BUTTON_HINTS as hint (hint)}
            {@render ActionButtonHint({ hint })}
          {/each}
        </div>
      {/if}
      {@render ActionButton(actionButtons[0])}
      {@render ActionButton(actionButtons[1])}
      {@render HintButton()}
      {@render ActionButton(actionButtons[2])}
    </div>
  </div>

  {#if thresholdPassed !== 0}
    <div class="absolute w-full h-full inset-0 flex items-center justify-center text-4xl">
      <span
        class="p-4 rounded-xl z-10"
        class:bg-success={thresholdPassed > 0}
        class:bg-error={thresholdPassed < 0}
      >
        {thresholdPassed > 0 ? 'оставить в списке' : 'удалить'}
      </span>
      <div
        class="absolute w-full h-full opacity-10"
        class:bg-success={thresholdPassed > 0}
        class:bg-error={thresholdPassed < 0}
      ></div>
    </div>
  {/if}
{/if}

<!-- @component Страница быстрой очистки списка. Реализует механику свайпа карточек -->
<script>
  import clearWishlistItemsComparator from '@tmible/wishlist-common/clear-wishlist-items-comparator';
  import { onDestroy, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { CardSwiper } from '$lib/card-swiper';
  import { wishlist } from '$lib/wishlist/store.js';
  import { deleteItems } from '$lib/wishlist/use-cases/delete-items.js';

  /** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */

  /**
   * Массив идентификаторов элементов списка к удалению
   * @type {number[]}
   */
  const toDelete = [];

  /**
   * Список желаний пользователя, отсортированный для быстрой очистки
   * @type {OwnWishlistItem[]}
   */
  const wishlistSorted = $derived($wishlist.toSorted(clearWishlistItemsComparator));

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
    if (direction === 'right') {
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
      image: '/bg.svg',
      id: wishlistSorted[i].id,
      description: wishlistSorted[i].isExternal ? 'сюрприз' : '',
    };
  };

  /**
   * Признак пересечения карточкой границы, после которой отпускание
   * карточки приведёт к выполнению соответствующего стороне действия
   * @type {-1 | 0 | 1}
   */
  let thresholdPassed = $state(0);

  // Возврат на главную страницу авторизованной зоны, если список пуст
  onMount(() => {
    if (($wishlist ?? []).length === 0) {
      goto('/list');
    }
  });

  // Запрос на удаление элементов, карточки которых были свайпнуты вправо
  onDestroy(async () => await deleteItems(toDelete));
</script>

{#if ($wishlist ?? []).length > 0}
  <div class="w-dvw h-dvh md:w-1/3 mx-auto overflow-hidden">
    <CardSwiper {cardData} swiped={markListItem} bind:thresholdPassed />
    {#if thresholdPassed !== 0}
      <div class="absolute w-full h-full inset-0 flex items-center justify-center text-4xl">
        <span
          class="p-4 rounded-xl z-10"
          class:bg-success={thresholdPassed > 0}
          class:bg-error={thresholdPassed < 0}
        >
          {thresholdPassed > 0 ? 'удалить' : 'оставить в списке'}
        </span>
        <div
          class="absolute w-full h-full opacity-10"
          class:bg-success={thresholdPassed > 0}
          class:bg-error={thresholdPassed < 0}
        ></div>
      </div>
    {/if}
  </div>
{/if}

<!-- Svelte компонент -- форма создания или изменения элемента списка -->
<script>
  import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
  import { Select } from 'bits-ui';
  import Check from 'lucide-svelte/icons/check';
  import TextEditor from '$lib/components/text-editor';
  import { categories } from '$lib/store/categories.js';
  import { list } from '$lib/store/list';
  import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */
  /** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */

  /**
   * @typedef {object} Props
   * @property {OwnListItem | null} [values] Текущие значения свойств элемента списка
   *  для подстановки в форму в режиме редактирования
   * @property {() => void} cancel Функция обратного вызова для отмены отправки формы на сервер
   * @property {() => void} success Функция обратного вызова для успеха редактирования
   */

  /** @type {Props} */
  const { values = null, cancel, success } = $props();

  /**
   * Идентификатор выбранной категории
   * @type {number | null}
   */
  let selectedCategoryId = $state(values ? values.category.id : null);

  /**
   * Название выбранной категории
   * @type {string}
   */
  const selectedCategoryName = $derived(
    $categories?.find(({ id }) => id === selectedCategoryId)?.name ?? '',
  );

  /**
   * Парсинг и подстановка в форму описания элемента списка. Парсинг нужен
   * для перевода разметки из формата текстового редактора в формат телеграма
   * @function setDescription
   * @param {FormData} formData Обрабатываемая форма
   * @returns {void}
   */
  const setDescription = (formData) => {
    const [
      description,
      descriptionEntities,
    ] = tiptapToTelegram(JSON.parse(formData.get('description')).content);

    formData.set('description', description);
    formData.set('descriptionEntities', JSON.stringify(descriptionEntities));
  };

  /**
   * Удаление из формы неизменых по сравнению с сохранённым
   * в [хранилище]{@link list} состоянием свойств элемента
   * @function filterNotModifiedProperties
   * @param {FormData} formData Обрабатываемая форма
   * @returns {void}
   */
  const filterNotModifiedProperties = (formData) => {
    const storedItem = $list.find(({ id }) => id === values.id);

    for (const [ key, value ] of Array.from(formData.entries())) {
      if (
        (
          key === 'descriptionEntities' &&
          arrayToOrderedJSON(JSON.parse(value)) === arrayToOrderedJSON(storedItem[key])
        ) ||
        (
          key === 'categoryId' &&
          (value === 'null' ? null : value) === (storedItem.category.id?.toString() ?? null)
        ) ||
        (
          key !== 'descriptionEntities' &&
          key !== 'categoryId' &&
          value === storedItem[key].toString()
        )
      ) {
        formData.delete(key);
      }
    }
  };

  /**
   * Отправка формы на сервер
   * @function sendForm
   * @param {FormData} formData Данные формы
   * @returns {Promise<void>}
   * @async
   */
  const sendForm = async (formData) => {
    const body = Object.fromEntries(formData);
    if (body.categoryId === 'null') {
      body.categoryId = null;
    }
    const response = await fetch(
      values ? `/api/wishlist/${values.id}` : '/api/wishlist',
      {
        method: values ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      success();
    }
  };

  /**
   * Обработка и отправка на сервер формы после подтверждения
   * @function handleFormSubmit
   * @param {Event} event Событие подтверждения формы
   * @returns {Promise<void>}
   * @async
   */
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    setDescription(formData);

    if (values) {
      filterNotModifiedProperties(formData);

      if (Array.from(formData.entries()).length === 0) {
        cancel();
        return;
      }
    } else {
      formData.append('order', $list.length);
    }

    await sendForm(formData);
  };
</script>

<form class="prose" method="POST" onsubmit={handleFormSubmit}>
  <fieldset class="fieldset mb-2">
    <legend class="fieldset-legend">Название</legend>
    <input
      name="name"
      class="input w-full bg-base-200"
      required
      type="text"
      value={values?.name ?? ''}
      placeholder="Название"
    >
  </fieldset>
  <fieldset class="fieldset mb-2">
    <legend class="fieldset-legend">Описание</legend>
    <TextEditor
      name="description"
      className="textarea textarea-bordered w-full h-24 bg-base-200"
      value={values?.description ?? ''}
      placeholder="Описание"
    />
  </fieldset>
  <!-- eslint-disable-next-line svelte/valid-compile -- input внутри Select -->
  <fieldset class="fieldset mb-6">
    <legend class="fieldset-legend">Категория</legend>
    <Select.Root
      name="categoryId"
      type="single"
      preventScroll={false}
      allowDeselect={true}
      items={$categories ?? []}
      bind:value={selectedCategoryId}
    >
      <Select.Trigger class="select select-bordered bg-base-200 items-center w-full">
        {selectedCategoryName}
      </Select.Trigger>

      <Select.Content side="bottom" align="center" sideOffset={8}>
        {#snippet child({ wrapperProps, props })}
          <div {...wrapperProps}>
            <ul
              class="
                shadow-xl
                menu
                bg-base-200
                rounded-lg
                not-prose
                w-[var(--bits-select-anchor-width)]
              "
              {...props}
            >
              {#each $categories as { id, name } (id)}
                <Select.Item value={id} label={name}>
                  {#snippet child({ props, selected })}
                    <li {...props}>
                      <div class="flex justify-between" class:bg-base-100={selected}>
                        {name}
                        {#if selected}
                          <Check />
                        {/if}
                      </div>
                    </li>
                  {/snippet}
                </Select.Item>
              {/each}
            </ul>
          </div>
        {/snippet}
      </Select.Content>
    </Select.Root>
  </fieldset>
  <div class="card-actions">
    <button class="btn btn-neutral w-full md:flex-1" type="button" onclick={cancel}>
      Отмена
    </button>
    <button class="btn btn-primary w-full md:flex-1" type="submit">
      {values ? 'Сохранить' : 'Добавить'}
    </button>
  </div>
</form>

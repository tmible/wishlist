<!-- Svelte компонент -- форма создания или изменения элемента списка -->
<script>
  import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
  import { Select } from 'bits-ui';
  import Check from 'lucide-svelte/icons/check';
  import { createEventDispatcher } from 'svelte';
  import TextEditor from '$lib/components/text-editor';
  import { categories } from '$lib/store/categories.js';
  import { list } from '$lib/store/list';
  import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */
  /** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */

  /**
   * Диспетчер событий
   * @type {import('svelte').EventDispatcher}
   */
  const dispatch = createEventDispatcher();

  /**
   * Текущие значения свойств элемента списка для подстановку в форму в режиме редактирования
   * @type {OwnListItem | null}
   */
  export let values = null;

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
      dispatch('success');
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
    const formData = new FormData(event.target);
    setDescription(formData);

    if (values) {
      filterNotModifiedProperties(formData);

      if (Array.from(formData.entries()).length === 0) {
        dispatch('cancel');
        return;
      }
    } else {
      formData.append('order', $list.length);
    }

    await sendForm(formData);
  };

  /**
   * Выпуск события отмены отправки формы на сервер по инициативе пользователя
   * @function cancel
   * @returns {void}
   */
  const cancel = () => dispatch('cancel');
</script>

<form class="prose" method="POST" on:submit|preventDefault={handleFormSubmit}>
  <label class="form-control w-full mb-2">
    <div class="label">
      <span class="label-text">Название</span>
    </div>
    <input
      name="name"
      class="input input-bordered w-full bg-base-200"
      required
      type="text"
      value={values?.name ?? ''}
      placeholder="Название"
    />
  </label>
  <!-- eslint-disable-next-line svelte/valid-compile -- textarea внутри TextEditor -->
  <label class="form-control w-full mb-2">
    <div class="label">
      <span class="label-text">Описание</span>
    </div>
    <TextEditor
      name="description"
      className="textarea textarea-bordered h-24 bg-base-200"
      value={values?.description ?? ''}
      placeholder="Описание"
    />
  </label>
  <!-- eslint-disable-next-line svelte/valid-compile -- input внутри Select -->
  <label class="form-control w-full mb-6">
    <div class="label">
      <span class="label-text">Категория</span>
    </div>
    <Select.Root
      name="categoryId"
      preventScroll={false}
      items={$categories}
      selected={values ?
        { value: values.category.id, label: values.category.name ?? '⸻' } :
        { value: null, label: '⸻' }}
    >
      <Select.Input />
      <Select.Trigger class="select select-bordered bg-base-200 items-center">
        <Select.Value />
      </Select.Trigger>

      <Select.Content
        asChild
        side="bottom"
        align="center"
        sameWidth={true}
        sideOffset={8}
        let:builder
      >
        <ul
          class="shadow-xl menu bg-base-200 rounded-lg not-prose"
          use:builder.action
          {...builder}
        >
          <Select.Item asChild value={null} label="⸻" let:builder>
            <li use:builder.action {...builder}>
              <span>⸻</span>
            </li>
          </Select.Item>
          {#each $categories as { id, name } (id)}
            <Select.Item asChild value={id} label={name} let:builder let:isSelected>
              <li use:builder.action {...builder}>
                <div class="flex justify-between" class:bg-base-100={isSelected}>
                  {name}
                  <Select.ItemIndicator>
                    <Check />
                  </Select.ItemIndicator>
                </div>
              </li>
            </Select.Item>
          {/each}
        </ul>
      </Select.Content>
    </Select.Root>
  </label>
  <div class="card-actions">
    <button class="btn btn-neutral w-full md:flex-1" type="button" on:click={cancel}>
      Отмена
    </button>
    <button class="btn btn-primary w-full md:flex-1" type="submit">
      {values ? 'Сохранить' : 'Добавить'}
    </button>
  </div>
</form>

<!-- @component Форма создания или изменения элемента списка -->
<script>
  import CategorySelect from '$lib/categories/select.svelte';
  import { categories } from '$lib/categories/store.js';
  import TextEditor from '$lib/components/text-editor';
  import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';
  import { addItem } from '../use-cases/add-item.js';
  import { addItemExternally } from '../use-cases/add-item-externally.js';
  import { editItem } from '../use-cases/edit-item.js';

  /** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */
  /** @typedef {import('../domain.js').OwnWishlistItemFormData} OwnWishlistItemFormData */
  /** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */

  /**
   * @typedef {object} Props
   * @property {OwnWishlistItem} [item] Элемент списка желаний
   * @property {OwnWishlistItem | null} [values] Текущие значения свойств элемента списка
   *  для подстановки в форму в режиме редактирования
   * @property {() => void} [onfinish] Функция обратного вызова после завершения обработки формы
   * @property {() => void} [onsuccess]
   *   Функция обратного вызова после успешного завершения обработки формы
   * @property {() => void} [oncancel] Функция обратного вызова после отмены обработки формы
   * @property {number | null} [targetUserHash] Хэш пользователя — владельца списка.
   *   Нужен при использования формы для добавления элемента в список не владельцем
   */

  /** @type {Props} */
  const { item = null, values = null, onfinish, onsuccess, oncancel, targetUserHash } = $props();

  /**
   * Идентификатор выбранной категории
   * @type {number | ''}
   */
  let selectedCategoryId = $state(values ? values.category.id : '');

  /**
   * Парсинг и подстановка в форму описания элемента списка. Парсинг нужен
   * для перевода разметки из формата текстового редактора в формат телеграма
   * @function setDescription
   * @param {OwnWishlistItemFormData} formData Обрабатываемая форма
   * @returns {void}
   */
  const setDescription = (formData) => {
    const [
      description,
      descriptionEntities,
    ] = tiptapToTelegram(JSON.parse(formData.description).content);

    formData.description = description;
    formData.descriptionEntities = descriptionEntities;
  };

  /**
   * Определение категории по идентификатору и подстановка в форму
   * @function setCategory
   * @param {OwnWishlistItemFormData} formData Обрабатываемая форма
   * @returns {void}
   */
  const setCategory = (formData) => {
    if (!Object.hasOwn(formData, 'categoryId') || formData.categoryId === '') {
      formData.category = null;
    } else {
      const categoryId = Number.parseInt(formData.categoryId);
      formData.category = $categories.find(({ id }) => id === categoryId) ?? null;
    }
    delete formData.categoryId;
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
    const formData = Object.fromEntries(new FormData(event.target));
    setDescription(formData);
    setCategory(formData);
    if (targetUserHash) {
      await addItemExternally(formData, targetUserHash);
    } else {
      await (values ? editItem(item, formData) : addItem(formData));
    }
    onfinish?.();
    onsuccess?.();
  };

  /**
   * Отмена заполнения формы
   * @function onCancel
   * @returns {void}
   */
  const onCancel = () => {
    onfinish?.();
    oncancel?.();
  };
</script>

<form class="prose flex flex-col grow-1" method="POST" onsubmit={handleFormSubmit}>
  <div class="flex flex-col gap-2 grow-1 mb-6">
    <fieldset class="fieldset">
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
    <fieldset class="fieldset">
      <legend class="fieldset-legend">Описание</legend>
      <TextEditor
        name="description"
        className="textarea textarea-bordered w-full h-24 bg-base-200"
        value={values?.description ?? ''}
        placeholder="Описание"
      />
    </fieldset>
    {#if !targetUserHash}
      <!-- eslint-disable-next-line svelte/valid-compile -- input внутри CategorySelect -->
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Категория</legend>
        <CategorySelect bind:selectedCategoryId={selectedCategoryId} />
      </fieldset>
    {/if}
  </div>
  <div class="card-actions">
    <button class="btn btn-neutral w-full md:flex-1" type="button" onclick={onCancel}>
      Отмена
    </button>
    <button class="btn btn-primary w-full md:flex-1" type="submit">
      {values ? 'Сохранить' : 'Добавить'}
    </button>
  </div>
</form>

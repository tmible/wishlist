<!-- @component Форма создания или изменения элемента списка -->
<script>
  import CategorySelect from '$lib/categories/select.svelte';
  import { categories } from '$lib/categories/store.js';
  import TextEditor from '$lib/components/text-editor';
  import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';
  import { addItem } from '../use-cases/add-item.js';
  import { editItem } from '../use-cases/edit-item.js';

  /** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */
  /** @typedef {import('../domain.js').OwnWishlistItemFormData} OwnWishlistItemFormData */
  /** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */

  /**
   * @typedef {object} Props
   * @property {OwnWishlistItem} [item] Элемент списка желаний
   * @property {OwnWishlistItem | null} [values] Текущие значения свойств элемента списка
   *  для подстановки в форму в режиме редактирования
   * @property {() => void} onfinish Функция обратного вызова после завершения обработки формы
   */

  /** @type {Props} */
  const { item = null, values = null, onfinish } = $props();

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
    if (formData.categoryId === '') {
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
    await (values ? editItem(item, formData) : addItem(formData));
    onfinish();
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
  <!-- eslint-disable-next-line svelte/valid-compile -- input внутри CategorySelect -->
  <fieldset class="fieldset mb-6">
    <legend class="fieldset-legend">Категория</legend>
    <CategorySelect bind:selectedCategoryId={selectedCategoryId} />
  </fieldset>
  <div class="card-actions">
    <button class="btn btn-neutral w-full md:flex-1" type="button" onclick={onfinish}>
      Отмена
    </button>
    <button class="btn btn-primary w-full md:flex-1" type="submit">
      {values ? 'Сохранить' : 'Добавить'}
    </button>
  </div>
</form>

<!-- Svelte компонент -- форма создания или изменения элемента списка -->
<script>
  import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
  import { createEventDispatcher } from 'svelte';
  import TextEditor from '$lib/components/text-editor';
  import { list } from '$lib/store/list';
  import { user } from '$lib/store/user';
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
        value === storedItem[key].toString()
      ) {
        formData.delete(key);
      }
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
    }

    formData.append('userid', $user.id);

    const response = await fetch(
      values ? `/api/wishlist/${values.id}` : '/api/wishlist',
      {
        method: values ? 'PUT' : 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
      },
    );

    if (response.ok) {
      dispatch('success');
    }
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
      class="input input-bordered w-full"
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
      className="textarea textarea-bordered h-24"
      value={values?.description ?? ''}
      placeholder="Описание"
    />
  </label>
  <label class="form-control w-full mb-6">
    <div class="label">
      <span class="label-text">Приоритет</span>
    </div>
    <input
      name="priority"
      class="input input-bordered w-full"
      required
      type="number"
      min="1"
      value={values?.priority ?? 1}
      placeholder="Приоритет"
    />
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

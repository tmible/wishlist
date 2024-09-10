<!-- Svelte компонент -- форма создания или изменения элемента списка -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { enhance } from '$app/forms';
  import TextEditor from '$lib/components/text-editor';
  import { list } from '$lib/store/list';
  import { user } from '$lib/store/user';
  import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

  /**
   * Диспетчер событий
   * @type {import('svelte').EventDispatcher}
   */
  const dispatch = createEventDispatcher();

  /**
   * Форма из родительского компонента для использования form actions
   * @type {import('./$types').ActionData}
   * @see {@link https://kit.svelte.dev/docs/form-actions}
   */
  export let form;

  /**
   * Текущие значения свойств элемента списка для подстановку в форму в режиме редактирования
   * @type {OwnListItem | null}
   */
  export let values = null;

  /**
   * Выпуск события успеха при успешной обработке формы сервером
   */
  $: if (form?.success) {
    dispatch('success');
  }

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
   * Удаление из формы не изменых по сравнению с сохранённым
   * в [хранилище]{@link list} состоянием свойств элемента
   * @function filterNotModifiedProperties
   * @param {FormData} formData Обрабатываемая форма
   * @returns {void}
   */
  const filterNotModifiedProperties = (formData) => {
    const storedItem = $list.find(({ id }) => id === values.id);

    for (const [ key, value ] of Array.from(formData.entries())) {
      if (
        value === (
          typeof storedItem[key] === 'object' ?
            JSON.stringify(storedItem[key]) :
            storedItem[key].toString()
        )
      ) {
        formData.delete(key);
      }
    }
  };

  /**
   * Обработка формы после подтверждения и перед отправкой на сервер
   * @function handleFormSubmit
   * @param {Parameters<import('@sveltejs/kit').SubmitFunction>[0]} input Входные данные для
   * SubmitFunction
   * @param {() => void} input.cancel Функция отмены отправки формы на сервер
   * @param {FormData} input.formData Данные формы
   * @returns {void}
   */
  const handleFormSubmit = ({ cancel, formData }) => {
    setDescription(formData);

    if (values) {
      filterNotModifiedProperties(formData);

      if (Array.from(formData.entries()).length === 0) {
        cancel();
        dispatch('cancel');
      }

      formData.append('listItemId', values.id);
    }

    formData.append('userid', $user.id);
    formData.append('method', values ? 'PUT' : 'POST');
  };

  /**
   * Выпуск события отмены отправки формы на сервер по инициативе пользователя
   * @function cancel
   * @returns {void}
   */
  const cancel = () => dispatch('cancel');
</script>

<form class="prose" method="POST" use:enhance={handleFormSubmit}>
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

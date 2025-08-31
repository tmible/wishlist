<!--
@component Подсказка, отображающая своё содержание по клику на триггер и скрывающая
по нажатию клавиши мыши где бы то ни было
-->
<script>

  /** @typedef {import('svelte').Snippet} Snippet */

  /**
   * Параметры элемента-триггера
   * @typedef {object} TriggerParams
   * @property {(event: PointerEvent) => void} onClick Обработчик клика
   * @property {() => void} onMouseDown Обработчик опускания клавиши указателя
   */
  /**
   * @typedef {object} Props
   * @property {Snippet<[TriggerParams]>} trigger Элемент, при клике на который отображается
   * подсказка
   * @property {Snippet<void>} content Элемент подсказки
   * @property {boolean} isShown Признак видимости подсказки
   */

  /** @type {Props} */
  /* eslint-disable-next-line prefer-const -- Невозможно разорвать определение props */
  let { trigger, content, isShown = $bindable(false) } = $props();

  /**
   * Скрытие подсказки
   * @function hide
   * @returns {void}
   */
  const hide = () => isShown = false;

  /**
   * Изменение статуса отображения подсказки на противоположный
   * @function toggle
   * @param {Event} event Событие нажатия на [триггер]{@link trigger}
   * @returns {void}
   */
  const toggle = (event) => {
    isShown = !isShown;
    if (isShown) {
      globalThis.addEventListener('mousedown', hide, { once: true });
      event.stopImmediatePropagation();
    } else {
      globalThis.removeEventListener('mousedown', hide);
    }
  };

  /**
   * Отмена прослушивания глобального события опускания клавиши при опускании клавиши
   * на [триггер]{@link trigger}, чтобы подсказка не отображалась повторно при клике
   * на [триггер]{@link trigger}
   * @function onTriggerMouseDown
   * @returns {void}
   */
  const onTriggerMouseDown = () => {
    if (isShown) {
      globalThis.removeEventListener('mousedown', hide);
    }
  };
</script>

{@render trigger?.({ onClick: toggle, onMouseDown: onTriggerMouseDown })}
{#if isShown}
  {@render content?.()}
{/if}

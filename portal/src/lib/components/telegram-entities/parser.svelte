<!-- @component Парсер элементов разметки сообщения из телеграма в дерево для отображения в HTML -->
<script>
  import { addParagraphBreakpointsToEveryBlockquote } from './add-paragraph-breakpoints-to-every-blockquote.js';
  import { entitiesToBreakpoints } from './entities-to-breakpoints.js';
  import { filterPreParagraphs } from './filter-pre-paragraphs.js';
  import { goUpSavingNodes } from './go-up-saving-nodes.js';
  import { lineBreaksToBreakpoints } from './line-breaks-to-breakpoints.js';
  import { sortBreakpoints } from './sort-breakpoints.js';
  import TelegramEntity from './telegram-entity.svelte';

  /**
   * Обязательная часть элемента разметки текста
   * @typedef {object} EntityBase
   * @property {string} type Тип элемента
   * @property {number} offset Отступ от начала строки
   * @property {number} length Длина
   */

  /**
   * Элемент разметки текста
   * @typedef {EntityBase & Record<string, unknown>} Entity
   */

  /**
   * Корневой узел дерева элементов разметки текста
   * @typedef {object} EntitiesTreeRoot
   * @property {null} parent Родитель узла
   * @property {(EntitiesTreeRegularNode | EntitiesTreeTextNode)[]} children Потомки узла
   */

  /**
   * Обычный узел дерева элементов разметки текста
   * @typedef {object & Omit<Entity, 'type' | 'offset' | 'length'>} EntitiesTreeRegularNode
   * @property {EntitiesTreeRoot | EntitiesTreeRegularNode} parent Родитель узла
   * @property {(EntitiesTreeRegularNode | EntitiesTreeTextNode)[]} children Потомки узла
   * @property {
   *   'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'blockquote' | 'pre' | 'url' |
   *   'text_link' | 'spoiler' | 'mention' | 'hashtag' | 'bot_command' | 'cashtag' | 'email' |
   *   'phone_number' | 'paragraph' | 'mention_name' | 'bank_card' | 'custom_emoji'
   * } type Тип элемента
   * @property {number} index Уникальный порядковый номер среди потомков родителя узла
   */

  /**
   * Листовой узел дерева элементов разметки текста с текстом
   * @typedef {object} EntitiesTreeTextNode
   * @property {string} text Текст
   * @property {number} index Уникальный порядковый номер среди потомков родителя узла
   */

  /**
   * Узел дерева элементов разметки текста
   * @typedef {EntitiesTreeRegularNode | EntitiesTreeTextNode} EntitiesTreeNode
   */

  /**
   * Точка изменения разметки в тексте
   * @typedef {object} Breakpoint
   * @property {number} offset Положение в тексте (отступ от начала текста)
   * @property {Entity | { type: 'paragraph', length: number }} entity Представляемый элемент
   * разметки текста
   * @property {'opening' | 'closing'} type Тип изменения
   */

  /**
   * @typedef {object} Props
   * @property {string} text Размечаемый текст
   * @property {Entity[]} entities Элементы разметки
   */

  /** @type {Props} */
  const { text, entities } = $props();

  /**
   * При нахождении открывающей точки изменения разметки добавление потомка
   * и переход в него. При нахождении закрывающей -- [выход из текущего узла до соответсвующего
   * родителя с сохранением активных встреченных при этом узлов]{@link goUpSavingNodes}.
   * @function EntitiesTreeNode
   * @param {Breakpoint} breakpoint Очередная точка изменения разметки
   * @param {EntitiesTreeNode} node Текущий узел дерева
   * @param {string} textPiece Соответствующая часть текста
   * @returns {EntitiesTreeNode} Следующий узел дерева
   */
  const handleBreakpoint = (breakpoint, node, textPiece) => {
    let nextNode = node;

    if (breakpoint.type === 'opening') {

      node.children.push({
        index: node.children.length,
        type: breakpoint.entity.type,
        ...Object.fromEntries(
          Object
            .entries(breakpoint.entity)
            .filter(([ key ]) => ![ 'type', 'offset', 'length' ].includes(key)),
        ),
        children: textPiece ? [{ text: textPiece, index: 0 }] : [],
        parent: node,
      });

      nextNode = node.children.at(-1);

    } else if (breakpoint.type === 'closing') {

      nextNode = goUpSavingNodes(node, breakpoint);
      if (textPiece) {
        nextNode.children.push({ text: textPiece, index: nextNode.children.length });
      }
    }

    return nextNode;
  };

  /**
   * Построение из элементов разметки сообщения из телеграма дерева для отображения в HTML
   * 1. [Определение точек изменения разметки текста]{@link entitiesToBreakpoints};
   * 2. [Добавление точек переводов строк]{@link lineBreaksToBreakpoints};
   * 3. [
   *      Обеспечение наличия абзацев в каждой цитате
   *    ]{@link addParagraphBreakpointsToEveryBlockquote};
   * 4. [Удаление абзацев из блоков кода]{@link filterPreParagraphs};
   * 5. [Сортировка точек изменения разметки текста]{@link sortBreakpoints};
   * 6. [Построение дерева]{@link handleBreakpoint}.
   * @function buildTree
   * @returns {EntitiesTreeRoot} Построенное дерево
   */
  const buildTree = () => {
    const breakpoints = [
      ...entitiesToBreakpoints(entities),
      ...lineBreaksToBreakpoints(Array.from(text.matchAll(/(?!^)\n(?!$)/g)), text.length),
    ]
      /* eslint-disable-next-line unicorn/no-array-callback-reference --
        специально написанная для использования в flatMap() функция
      */
      .flatMap(addParagraphBreakpointsToEveryBlockquote)
      /* eslint-disable-next-line unicorn/no-array-callback-reference --
        специально написанная для использования в filter() функция
      */
      .filter(filterPreParagraphs)
      .sort(sortBreakpoints);

    const root = { children: [], parent: null };
    let node = root;

    for (let i = 0; i < breakpoints.length; ++i) {
      const breakpoint = breakpoints[i];

      if (breakpoint.offset >= text.length + 1) {
        break;
      }

      const textPiece = text.slice(
        breakpoint.offset,
        i === breakpoints.length - 1 ?
          text.length - breakpoint.offset :
          breakpoints[i + 1].offset,
      ).replaceAll('\n', '');

      node = handleBreakpoint(breakpoint, node, textPiece);

    }

    return root;
  };

  /**
   * Корень построенного дерева
   * @type {EntitiesTreeRoot}
   */
  const tree = $derived.by(buildTree);
</script>

{#each (tree?.children ?? []) as { index, ...child } (index)}
  <TelegramEntity node={child} />
{/each}

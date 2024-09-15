/** @module Перевод дерева текстового редактора в набор элементов разметки текста телеграма */

/** @typedef {import('@tiptap/core').JSONContent} JSONContent */
/** @typedef {import('$lib/components/telegram-entities/parser.svelte').Entity} Entity */
/**
 * @template ArrayType
 * @typedef
 * {ArrayType extends readonly (infer ElementType)[] ? ElementType : never}
 * ArrayElement<ArrayType extends readonly unknown[]>
 */
// eslint-disable-next-line no-secrets/no-secrets -- Просто длинное название
/**
 * Уплощёный узел дерева текстового редактора
 * @typedef {object} FlatChild
 * @property {string[]} marks Набор активных меток
 * //Будет работать только в TS
 * //@property {Pick<ArrayElement<Pick<JSONContent, 'marks'>>, 'type'>[]} marks Набор активных меток
 * @property {Pick<JSONContent, 'text'>} text Содержащийся в узле текст
 * @property {Pick<JSONContent, 'attrs'>} attrs Атрибуты для меток
 */

/**
 * Отображение названий меток текстового редактора в типы элементов
 * разметки текста телегарма Не упомянутые совпадают
 * @constant {Map<string, Pick<Entity, 'type'>>}
 */
const TIPTAP_TO_TELEGRAM_NAMES_MAP = new Map([
  [ 'strike', 'strikethrough' ],
  [ 'codeBlock', 'pre' ],
  [ 'link', 'url' ],
]);

/**
 * Рекурсивное уплощение дерева текстового редактора
 * @function flatContent
 * @param {JSONContent} content Текущий узел дерева
 * @param {string[]} [mixin] Примесь меток от родительских узлов дерева
 * @returns {FlatChild[]} Массив уплощённых потомков текущего узла
 */
const flatContent = (content, mixin = []) => content?.flatMap((child) => {
  if (child.type === 'text') {
    const url = child.marks?.find(({ type }) => type === 'text_link')?.attrs.href;
    return {
      marks: [ ...mixin, ...(child.marks?.map(({ type }) => type) ?? []) ],
      text: child.text,
      ...(url ? { attrs: { url } } : {}),
    };
  }

  if (child.type === 'codeBlock') {
    return {
      marks: [ child.type ],
      text: child.content[0].text ?? '',
      attrs: child.attrs,
    };
  }

  if (child.type === 'blockquote') {
    return flatContent(child.content, [ ...mixin, child.type ]);
  }

  const childContentFlat = flatContent(child.content, mixin) ?? [];
  if (child.content) {
    childContentFlat.at(-1).text += '\n';
  }
  return childContentFlat;
});

/**
 * Дополнительные проверки для приведения к соответствию формату Телеграма
 * @function preAndTextLinksMapper
 * @param {Entity} entity Элемент разметки текста
 * @returns {Entity} Обновлённый элемент разметки текста
 */
const preAndTextLinksMapper = (entity) => {
  if (entity.type === 'pre' && entity.language === null) {
    delete entity.language;
  }
  if (entity.type === 'text_link' && !entity.url.endsWith('/')) {
    entity.url += '/';
  }
  return entity;
};

/**
 * Перевод дерева текстового редактора в набор элементов разметки текста телеграма
 * 1. [Уплощение дерева]{@link flatContent};
 * 2. Перебор получившихся блоков:
 * 2.1. Создание элементов разметки текста на основе меток, закончившихся на начале текущего блока;
 * 2.2. Добавление к активным меткам меток, начавшихся в начале текущего блока;
 * 2.3. Добавление к тексту текста текущего блока;
 * 3. Удаление пробельных символов с конца текста;
 * 4. Создание элементов разметки текста на основе меток, закончившихся в конце текста;
 * @function tiptapToTelegram
 * @param {JSONContent} content Корень дерева текстового редактора
 * @returns {[ string, Entity[] ]} Текст и набор элементов его разметки
 */
export const tiptapToTelegram = (content) => {
  const contentFlat = flatContent(content);

  let text = '';
  const entities = [];
  let activeMarks = [];

  for (
    let i = 0, finishedMarks = [], [ block ] = contentFlat;
    i < contentFlat.length;
    ++i, text += block.text, block = contentFlat[i]
  ) {
    ({ activeMarks = [], finishedMarks = [] } = Object.groupBy(
      activeMarks,
      ({ type }) => (block.marks.includes(type) ? 'activeMarks' : 'finishedMarks'),
    ));

    entities.push(
      ...finishedMarks
        .map((finishedMark) => ({
          ...finishedMark,
          type: TIPTAP_TO_TELEGRAM_NAMES_MAP.get(finishedMark.type) ?? finishedMark.type,
          length: text.length - finishedMark.offset,
        }))
        .map((entity) => preAndTextLinksMapper(entity)),
    );

    activeMarks.push(
      ...block.marks
        .filter((mark) => !activeMarks.some(({ type }) => type === mark))
        .map((mark) => ({ ...block.attrs, offset: text.length, type: mark })),
    );
  }

  text = text.trimEnd();

  entities.push(
    ...activeMarks
      .map((activeMark) => ({
        ...activeMark,
        type: TIPTAP_TO_TELEGRAM_NAMES_MAP.get(activeMark.type) ?? activeMark.type,
        length: text.length - activeMark.offset,
      }))
      .map((entity) => preAndTextLinksMapper(entity)),
  );

  return [ text, entities ];
};

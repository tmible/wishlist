import Bold from 'lucide-svelte/icons/bold';
import Code from 'lucide-svelte/icons/code';
import EyeOff from 'lucide-svelte/icons/eye-off';
import Italic from 'lucide-svelte/icons/italic';
import Link from 'lucide-svelte/icons/link';
import Quote from 'lucide-svelte/icons/quote';
import RemoveFormatting from 'lucide-svelte/icons/remove-formatting';
import SquareCode from 'lucide-svelte/icons/square-code';
import Strikethrough from 'lucide-svelte/icons/strikethrough';
import Underline from 'lucide-svelte/icons/underline';

/** @typedef {import('svelte').ComponentType} ComponentType */
/**
 * Опция меняю форматирования для текстового редактора
 * @typedef {object} FormattingMenuOption
 * @property {ComponentType} icon Иконка
 * @property {string} label Название опции
 * @property {string} [labelTag] HTML тег для названия опции
 * @property {string[]} [keys] Сочетание клавиш для активации опции
 * @property {boolean} isTouchedDirectly Служебное свойство для корректной работы на сенсорных
 * экранах. Признак того, что пользователь нажал на опцию, а не коснулся её в процессе прокрутки
 * меню
 * @property {string} [activityKey] Ключ для проверки активности опции в текстовом редакторе
 * @property {string} [editorAction] Название метода для изменения активности опции в текстовом
 * редакторе
 * @property {boolean} isLastInSection Признак того, что опция последняя в секции. После последней
 * в секции опции в меню отображается разделитель
 */

/**
 * Признак операционной системы MacOS
 * @constant {boolean}
 */
const isMac = navigator.userAgentData ?
  navigator.userAgentData.platform === 'macOS' :
  navigator.userAgent.includes('Mac');

/**
 * Опции меню форматирования для текстового редактора
 * @constant {FormattingMenuOption[]}
 */
export const formattingMenu = [{
  icon: Bold,
  label: 'Жирный',
  labelTag: 'b',
  keys: [ isMac ? '⌘' : 'Ctrl', 'B' ],
  isTouchedDirectly: false,
  activityKey: 'bold',
  editorAction: 'toggleBold',
  isLastInSection: false,
}, {
  icon: Italic,
  label: 'Курсив',
  labelTag: 'i',
  keys: [ isMac ? '⌘' : 'Ctrl', 'I' ],
  isTouchedDirectly: false,
  activityKey: 'italic',
  editorAction: 'toggleItalic',
  isLastInSection: false,
}, {
  icon: Underline,
  label: 'Подчёркнутый',
  labelTag: 'u',
  keys: [ isMac ? '⌘' : 'Ctrl', 'U' ],
  isTouchedDirectly: false,
  activityKey: 'underline',
  editorAction: 'toggleUnderline',
  isLastInSection: false,
}, {
  icon: Strikethrough,
  label: 'Зачёркнутый',
  labelTag: 's',
  keys: [ isMac ? '⌘' : 'Ctrl', 'Shift', 'S' ],
  isTouchedDirectly: false,
  activityKey: 'strike',
  editorAction: 'toggleStrike',
  isLastInSection: false,
}, {
  icon: Code,
  label: 'Моноширинный',
  labelTag: 'code',
  keys: [ isMac ? '⌘' : 'Ctrl', 'E' ],
  isTouchedDirectly: false,
  activityKey: 'code',
  editorAction: 'toggleCode',
  isLastInSection: false,
}, {
  icon: EyeOff,
  label: 'Скрытый',
  keys: [ isMac ? '⌘' : 'Ctrl', 'Shift', 'P' ],
  isTouchedDirectly: false,
  activityKey: 'spoiler',
  editorAction: 'toggleSpoiler',
  isLastInSection: true,
}, {
  icon: SquareCode,
  label: 'Код',
  keys: [ isMac ? '⌘' : 'Ctrl', isMac ? '⌥' : 'Alt', 'C' ],
  isTouchedDirectly: false,
  activityKey: 'codeBlock',
  editorAction: 'toggleCodeBlock',
  isLastInSection: false,
}, {
  icon: Link,
  label: 'Добавить ссылку',
  isTouchedDirectly: false,
  activityKey: 'text_link',
  isLastInSection: false,
}, {
  icon: Quote,
  label: 'Цитировать',
  keys: [ isMac ? '⌘' : 'Ctrl', 'Shift', 'B' ],
  isTouchedDirectly: false,
  activityKey: 'blockquote',
  editorAction: 'toggleBlockquote',
  isLastInSection: true,
}, {
  icon: RemoveFormatting,
  label: 'Без форматирования',
  keys: [ isMac ? '⌘' : 'Ctrl', 'Space' ],
  isTouchedDirectly: false,
  editorAction: 'unsetAllMarks',
  isLastInSection: false,
}];

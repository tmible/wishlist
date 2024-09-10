import DescriptionEntityBaseKeys from './description-entity-base-keys.const.js';

/**
 * Множество свойств элементов разметки текста сообщения
 * @constant {Set<string>}
 */
const DescriptionEntityKeys = new Set([ ...DescriptionEntityBaseKeys, 'additional' ]);

export default DescriptionEntityKeys;

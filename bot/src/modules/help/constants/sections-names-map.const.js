import HelpSections from './sections.const.js';

/**
 * Отображение названий разделов помощи в отображаемый текст
 * @constant {Map<HelpSections, string>}
 */
const HelpSectionsNamesMap = new Map([
  [ HelpSections.GENERAL, 'ℹ️ Общее' ],
  [ HelpSections.FOREIGN_LIST, '✨ Список желаний' ],
  [ HelpSections.NICKNAME, '🥷 Никнейм' ],
  [ HelpSections.COMMAND_LIST, '🤖 Список команд' ],
]);

export default HelpSectionsNamesMap;

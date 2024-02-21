import { Markup } from 'telegraf';
import HelpSections from './sections.const.js';
import HelpSectionsNamesMap from './sections-names-map.const.js';

/** @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup */

/**
 * Встроенная кладиватура для переключения между разделами справки
 * @constant {Markup<InlineKeyboardMarkup>}
 */
const HelpMessageMarkup = Markup.inlineKeyboard(
  Object.values(HelpSections).reduce((markupRows, section) => {
    const sectionButton = Markup.button.callback(
      HelpSectionsNamesMap.get(section),
      `help ${section}`,
    );

    if (markupRows.at(-1).length === 2) {
      markupRows.push([ sectionButton ]);
    } else {
      markupRows.at(-1).push(sectionButton);
    }

    return markupRows;
  }, [[]]),
);

export default HelpMessageMarkup;

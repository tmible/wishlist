import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Markup } from 'telegraf';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import HelpSections from './constants/sections.const.js';
import SharedHelpSupportSection from './constants/sections/shared/support.const.js';
import HelpSectionsNamesMap from './constants/sections-names-map.const.js';

/**
 * @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/**
 * Формирование встроенной клавиатуры для переключения между разделами справки
 * @function formHelpMessageMarkup
 * @param {string} currentSection Активный раздел справки
 * @returns {Markup<InlineKeyboardMarkup>} Встроенная клавиатура для переключения между разделами
 *   справки
 */
const formHelpMessageMarkup = (currentSection) => Markup.inlineKeyboard(
  Object.values(HelpSections).reduce((markupRows, section) => {
    const sectionButton = Markup.button.callback(
      HelpSectionsNamesMap.get(section),
      `help ${section} ${currentSection}`,
    );

    if (markupRows.at(-1).length === 2) {
      markupRows.push([ sectionButton ]);
    } else {
      markupRows.at(-1).push(sectionButton);
    }

    return markupRows;
  }, [[]]),
);

/**
 * Настройка модуля получения справки
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  inject(InjectionToken.Logger).debug('configuring help module');

  /**
   * При получении команды /help бот отправит сообщение с общим разделом справки
   * и встроенной клавиатурой для переключения на другие разделы
   */
  bot.command('help', async (ctx) => {
    await ctx.replyWithMarkdownV2(
      `${
        await import(
          `./constants/sections/${isChatGroup(ctx) ? 'group' : 'default'}/general.const.js`,
        ).then((module) => module.default)
      }\n\n${
        SharedHelpSupportSection
      }`,
      formHelpMessageMarkup('general'),
    );
  });

  /**
   * При вызове действия help бот заменит текст сообщения со справкой на запрашиваемый раздел,
   * если сообщение содержит текст другого раздела
   */
  bot.action(/^help ([a-z-]+) ([a-z-]+)$/, async (ctx) => {
    if (ctx.match[1] === ctx.match[2]) {
      return;
    }

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      `${
        await import(
          `./constants/sections/${isChatGroup(ctx) ? 'group' : 'default'}/${ctx.match[1]}.const.js`,
        ).then((module) => module.default)
      }\n\n${
        SharedHelpSupportSection
      }`,
      {
        ...formHelpMessageMarkup(ctx.match[1]),
        parse_mode: 'MarkdownV2',
      },
    );
  });
};

export default { configure };

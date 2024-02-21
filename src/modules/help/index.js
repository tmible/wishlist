import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import tryEditing from '@tmible/wishlist-bot/helpers/messaging/try-editing';
import HelpMessageMarkup from './constants/message-markup.const.js';
import SharedHelpSupportSection from './constants/sections/shared/support.const.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/**
 * Настройка модуля получения справки
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  console.log('configuring help module');

  /**
   * При получении команды /help бот отправит сообщение с общим разделом справки
   * и встроенной клавиатурой для переключения на другие разделы
   */
  bot.command('help', async (ctx) => {
    await ctx.replyWithMarkdownV2(
      `${
        await import(
          `./constants/sections/${isChatGroup(ctx) ? 'group' : 'default'}/general.const.js`
        ).then((module) => module.default)
      }\n\n${
        SharedHelpSupportSection
      }`,
      HelpMessageMarkup,
    );
  });

  /**
   * При вызове действия help бот [заменит текст]{@link tryEditing}
   * сообщения со справкой на запрашиваемый раздел
   */
  bot.action(/^help ([a-z-]+)$/, async (ctx) => {
    await tryEditing(
      ctx,
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      `${
        await import(
          `./constants/sections/${isChatGroup(ctx) ? 'group' : 'default'}/${ctx.match[1]}.const.js`
        ).then((module) => module.default)
      }\n\n${
        SharedHelpSupportSection
      }`,
      {
        ...HelpMessageMarkup,
        parse_mode: 'MarkdownV2',
      },
    );
  });
};

export default { configure };

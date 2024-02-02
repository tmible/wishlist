import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import tryEditing from '@tmible/wishlist-bot/helpers/messaging/try-editing';
import SharedHelpSupportSection from './constants/sections/shared/support.const.js';
import HelpMessageMarkup from './constants/message-markup.const.js';

/**
 * Настройка модуля получения справки
 *
 * При получении команды /help бот отправит сообщение с общим разделом справки
 * и встроенной клавиатурой для переключения на другие разделы
 *
 * При вызове действия help бот [заменит текст]{@link tryEditing}
 * сообщения со справкой на запрашиваемый раздел
 *
 * @function configure
 */
const configure = (bot) => {
  console.log('configuring help module');

  bot.command('help', async (ctx) => {
    await ctx.replyWithMarkdownV2(
      `${
        (await import(
          `./constants/sections/${isChatGroup(ctx) ? 'group' : 'default'}/general.const.js`,
        )).default
      }\n\n${
        SharedHelpSupportSection
      }`,
      HelpMessageMarkup,
    );
  });

  bot.action(/^help ([a-z\-]+)$/, async (ctx) => {
    await tryEditing(
      ctx,
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      `${
        (await import(
          `./constants/sections/${isChatGroup(ctx) ? 'group' : 'default'}/${ctx.match[1]}.const.js`
        )).default
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

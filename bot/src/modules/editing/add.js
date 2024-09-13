import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import ItemDescriptionPattern from './constants/item-description-pattern.const.js';
import ItemNamePattern from './constants/item-name-pattern.const.js';
import ItemPriorityPattern from './constants/item-priority-pattern.const.js';
import sendList from './helpers/send-list.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleMessageHandler
 * } ModuleMessageHandler
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При получении команды /add, если чат не групповой, бот отправляет сообщение-приглашение
   * для отправки сообщения с информацией о подарке, добавляемом в список желаний
   */
  bot.command('add', async (ctx) => {
    if (isChatGroup(ctx)) {
      return;
    }

    ctx.session.messagePurpose = { type: MessagePurposeType.AddItemToWishlist };
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'replyWithMarkdownV2',
      'Опишите подарок в формате:\n' +
      '>приоритет\n>название\n>описание\n' +
      'Приоритет и описание можно не указывать',
      Markup.inlineKeyboard([ Markup.button.callback('Не добавлять', 'cancel_add') ]),
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении сообщения от пользователя, если ожидается информация о подарке,
   * добавляемом в список желаний, бот валидирует текст полученного сообщения.
   * При провале валидации бот отправляет сообщение-уведомления об ошибке валидации.
   * При успехе валидации бот выпускает соответствующее событие, отправляет сообщение-уведомление
   * об успехе добавления подарка и [отправляет обновлённый список]{@link sendList}
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.AddItemToWishlist) {
      delete ctx.session.messagePurpose;

      /* eslint-disable
        security/detect-non-literal-regexp,
        security-node/non-literal-reg-expr --
        Регулярное выражение из константы, так что тут нет уязвимости
      */
      const match = new RegExp(
        `^((?<priority>${ItemPriorityPattern})\n)?` +
        `(?<name>${ItemNamePattern})` +
        `(\n(?<description>${ItemDescriptionPattern}))?$`,
      ).exec(ctx.message.text);
      /* eslint-enable security/detect-non-literal-regexp, security-node/non-literal-reg-expr */

      if (!match) {
        await ctx.reply(
          'Ошибка в описании подарка. Проверьте, что:\n' +
          'Приоритет — целое число больше 0\n' +
          'Название — произвольный текст без переносов строк\n' +
          'Описание — произвольный текст с переносами строк и форматированием',
        );
        return;
      }

      eventBus.emit(
        Events.Editing.AddItem,
        [
          ctx.from.id,
          Number.parseInt(match.groups.priority ?? 1),
          match.groups.name,
          match.groups.description ?? '',
        ],
        ctx.message.entities,
        (match[1] ?? '').length + match[3].length + 1,
      );

      await ctx.reply('Добавлено!');
      await sendList(eventBus, ctx);
      return;
    }

    await next();
  });
};

export default { configure, messageHandler };

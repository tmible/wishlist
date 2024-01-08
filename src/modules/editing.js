import { Markup } from 'telegraf';
import {
  MarkdownV2SpecialCharacters,
  MessageEntityType,
  MessageEntityTypeToMarkdownV2,
  TmibleId,
} from '../constants.js';
import { numberToEmoji } from '../utils.js';

const updateTemplateFunction = (ctx, sessionKeys, reply) => {
  if (ctx.update.callback_query.message.chat.id !== TmibleId) {
    return;
  }

  ctx.session = { ...ctx.session, [sessionKeys[0]]: true, [sessionKeys[1]]: ctx.match[1] };
  return ctx.reply(reply);
};

const updateValueTemplateFunction =
async (ctx, db, sessionKeys, valueRegexp, errorMessage, dbQuery, successMessage) => {
  if (sessionKeys.every((key) => ctx.session?.[key])) {
    const match = valueRegexp.exec(ctx.update.message.text);
    const itemId = ctx.session[sessionKeys[1]];

    for (const key of sessionKeys) {
      delete ctx.session[key];
    }

    if (!match) {
      return ctx.reply(errorMessage);
    }

    await db.run(dbQuery, [ match[0], itemId ]);

    await ctx.reply(successMessage);
    sendList(ctx, db);
    return;
  }
};

const cancelUpdateTemplateFunction = (ctx, sessionKeys, reply) => {
  if (ctx.update.message.chat.id !== TmibleId) {
    return;
  }

  for (const key of sessionKeys) {
    if (ctx.session?.[key]) {
      delete ctx.session[key];
    }
  }

  return ctx.reply(reply);
};

const sendList = async (ctx, db) => {
  const messages = (await db.all('SELECT id, priority, name, description FROM list'))
  .sort((a, b) => a.id - b.id)
  .map((item) => [

    '_id: ' + item.id + '_\n' + numberToEmoji(item.priority) +
    ' *' + item.name + '*\n' + item.description,

    Markup.inlineKeyboard([
      [ Markup.button.callback('Изменить приоритет', `update_priority ${item.id}`) ],
      [ Markup.button.callback('Изменить название', `update_name ${item.id}`) ],
      [ Markup.button.callback('Изменить описание', `update_description ${item.id}`) ],
      [ Markup.button.callback('Удалить', `delete ${item.id}`) ],
    ]),
  ]);

  await ctx.sendMessage('Актуальный список:');
  for (const message of messages) {
    await ctx.replyWithMarkdownV2(...message);
  }
};

export const configureEditingModule = (bot, db) => {
  console.log('configuring editing module');

  bot.command('edit', async (ctx) => {
    if (ctx.update.message.chat.id !== TmibleId) {
      return;
    }
    sendList(ctx, db);
  });

  bot.action(/^update_priority ([\-\d]+)$/, (ctx) => {
    return updateTemplateFunction(
      ctx,
      [ 'updatePriority', 'updatePriorityId' ],
      'Отправьте мне новое значение приоритета (целое число больше 0)\n' +
      'Если передумаете, используйте команду /cancel_update_priority',
    );
  });

  bot.command('cancel_update_priority', (ctx) => {
    return cancelUpdateTemplateFunction(
      ctx,
      [ 'updatePriority', 'updatePriorityId' ],
      'Обновление приоритета отменено',
    );
  });

  bot.action(/^update_name ([\-\d]+)$/, (ctx) => {
    return updateTemplateFunction(
      ctx,
      [ 'updateName', 'updateNameId' ],
      'Отправьте мне новое название (произвольный текст без переносов строк)\n' +
      'Если передумаете, используйте команду /cancel_update_name',
    );
  });

  bot.command('cancel_update_name', (ctx) => {
    return cancelUpdateTemplateFunction(
      ctx,
      [ 'updateName', 'updateNameId' ],
      'Обновление названия отменено',
    );
  });

  bot.action(/^update_description ([\-\d]+)$/, (ctx) => {
    return updateTemplateFunction(
      ctx,
      [ 'updateDescription', 'updateDescriptionId' ],
      'Отправьте мне новое описание (произвольный текст с переносами строк)\n' +
      'Если передумаете, используйте команду /cancel_update_description',
    );
  });

  bot.command('cancel_update_description', (ctx) => {
    return cancelUpdateTemplateFunction(
      ctx,
      [ 'updateDescription', 'updateDescriptionId' ],
      'Обновление описания отменено',
    );
  });

  bot.action(/^delete ([\-\d]+)$/, async (ctx) => {
    if (ctx.update.callback_query.message.chat.id !== TmibleId) {
      return;
    }

    await db.run('DELETE FROM list WHERE id = ?', [ ctx.match[1] ]);
    await ctx.reply('Удалено!');
    sendList(ctx, db);
  });

  bot.command('add', async (ctx) => {
    if (ctx.update.message.chat.id !== TmibleId) {
      return;
    }

    ctx.session = { ...ctx.session, addItemToWishlist: true };
    return ctx.replyWithMarkdownV2(
      'Опишите подарок в формате:\n\n' +
      'приоритет\nназвание\nописание\n\n'+
      'и я добавлю его в список\\.\n' +
      'Если передумаете, используйте команду /cancel\\_add\n\n' +
      'Приоритет — целое число больше 0\n' +
      'Название — произвольный текст без переносов строк\n' +
      'Описание — произвольный текст с переносами строк\n\n' +
      'Форматирование текста будет сохранено'
    );
  });

  bot.command('cancel_add', (ctx) => {
    return cancelUpdateTemplateFunction(
      ctx,
      [ 'addItemToWishlist' ],
      'Добавление отменено'
    );
  });

  bot.command('clear_list', async (ctx) => {
    if (ctx.update.message.chat.id !== TmibleId) {
      return;
    }

    ctx.session = { ...ctx.session, clearList: true };
    return ctx.reply(
      'Отправьте мне список id позиций, которые нужно удалить\n' +
      'Если передумаете, используйте команду /cancel_clear_list'
    );
  });

  bot.command('cancel_clear_list', (ctx) => {
    return cancelUpdateTemplateFunction(
      ctx,
      [ 'clearList' ],
      'Очищение списка отменено'
    );
  });

  bot.on('message', async (ctx, next) => {
    updateValueTemplateFunction(
      ctx,
      db,
      [ 'updatePriority', 'updatePriorityId' ],
      /^[\d]+$/,
      'Ошибка в значении приоритета. Не могу обновить',
      'UPDATE list SET priority = ? WHERE id = ?',
      'Приоритет обновлён!',
    );

    updateValueTemplateFunction(
      ctx,
      db,
      [ 'updateName', 'updateNameId' ],
      /^.+$/,
      'Ошибка в названии. Не могу обновить',
      'UPDATE list SET name = ? WHERE id = ?',
      'Название обновлено!',
    );

    updateValueTemplateFunction(
      ctx,
      db,
      [ 'updateDescription', 'updateDescriptionId' ],
      /^[\s\S]+$/,
      'Ошибка в описании. Не могу обновить',
      'UPDATE list SET description = ? WHERE id = ?',
      'Описание обновлено!',
    );

    if (ctx.session?.addItemToWishlist) {
      const match = /^([\d]+)\n(.+)\n([\s\S]+)$/.exec(ctx.update.message.text);
      delete ctx.session.addItemToWishlist;

      if (!match || match.length < 4) {
        return ctx.reply('Ошибка в описании подарка. Не могу добавить');
      }

      const entitiesStarts = new Map(ctx.update.message.entities.map(
        ({ offset }, i) => [ offset, i ]),
      );
      const entitiesEnds = new Map(ctx.update.message.entities.map(
        ({ offset, length }, i) => [ offset + length, i ]),
      );

      let description = '';
      const descriptionOffset = match[1].length + match[2].length + 2;
      let isQuoteBlock = false;

      for (let i = 0; i <= match[3].length; ++i) {
        if (entitiesEnds.has(descriptionOffset + i)) {
          const entity = ctx.update.message.entities[entitiesEnds.get(descriptionOffset + i)];
          const markdown = MessageEntityTypeToMarkdownV2.get(entity.type);
          if (entity.type === MessageEntityType.PRE) {
            description += markdown[2];
          } else {
            description += markdown[1];
            switch (entity.type) {
              case MessageEntityType.TEXT_LINK:
                description += entity.url + markdown[2];
                break;
              case MessageEntityType.TEXT_MENTION:
                description += entity.user.id + markdown[2];
                break;
              case MessageEntityType.CUSTOM_EMOJI:
                description += entity.custom_emoji_id + markdown[2];
                break;
              default:
                break;
            }
          }
          isQuoteBlock = false;
        }

        if (i === match[3].length) {
          break;
        }

        if (entitiesStarts.has(descriptionOffset + i)) {
          const entity = ctx.update.message.entities[entitiesStarts.get(descriptionOffset + i)];
          description += MessageEntityTypeToMarkdownV2.get(entity.type)[0];
          if (entity.type === MessageEntityType.PRE) {
            description +=
              (entity.language ?? '') + MessageEntityTypeToMarkdownV2.get(entity.type)[1];
          }
          isQuoteBlock = entity.type === MessageEntityType.BLOCKQUOTE;
        }

        if (isQuoteBlock && i > 0 && match[3][i - 1] === '\n') {
          description += '>';
        }

        if (MarkdownV2SpecialCharacters.has(match[3][i])) {
          description += `\\${match[3][i]}`;
        } else {
          description += match[3][i];
        }

      }

      await db.run(
        'INSERT INTO list (priority, name, description, state) VALUES (?, ?, ?, 0)',
        [ ...match.slice(1, 3), description ],
      );

      await ctx.reply('Добавлено!');
      sendList(ctx, db);
      return;
    }

    if (ctx.session?.clearList) {
      const ids = ctx.update.message.text.split(/[^\d]+/).filter((id) => !!id).join(', ');
      delete ctx.session.clearList;

      if (ids.length === 0) {
        return ctx.reply('Не могу найти ни одного id');
      }

      await db.run('DELETE FROM participants');
      await db.run(`DELETE FROM list WHERE id IN (${ids})`);

      await ctx.reply('Список очищен!');
      sendList(ctx, db);
      return;
    }

    next();
  });
};

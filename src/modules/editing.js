import { Format, Markup } from 'telegraf';
import { TmibleId } from '../constants.js';
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

const saveDescriptionEntities = async (db, itemId, entities, descriptionOffset) => {
  const stmt = await db.prepare('INSERT INTO description_entities VALUES (?, ?, ?, ?, ?)');
  for (const entity of entities ?? []) {
    if (entity.offset < descriptionOffset) {
      continue;
    }
    const additionalProperties = Object.entries(entity).filter(([ key ]) =>
      ![ 'type', 'offset', 'length' ].includes(key)
    );
    await stmt.run(
      itemId,
      entity.type,
      entity.offset - descriptionOffset,
      entity.length,
      JSON.stringify(
        additionalProperties.length > 0 ? Object.fromEntries(additionalProperties) : null,
      ),
    );
  }
};

const sendList = async (ctx, db) => {
  const messages = (await db.all(`
    SELECT id, priority, name, description, type, offset, length, additional
    FROM list
    LEFT JOIN (
      SELECT list_item_id, type, offset, length, additional FROM description_entities
    ) as description_entities ON list.id = description_entities.list_item_id
  `))
  .reduce((accum, current) => {
    const found = accum.find(({ id }) => id === current.id);
    if (found) {
      found.descriptionEntities.push({
        type: current.type,
        offset: current.offset,
        length: current.length,
        ...(JSON.parse(current.additional) ?? {}),
      });
    } else {
      const {
        id, priority, name, description, state,
        participants, type, offset, length, additional,
      } = current;
      accum.push({
        id, priority, name, description, state,
        participants: participants?.split(',') ?? [],
        descriptionEntities: [],
      });
      if (!!type) {
        accum.at(-1).descriptionEntities.push(
          { type, offset, length, ...(JSON.parse(additional) ?? {}) },
        );
      }
    }
    return accum;
  }, [])
  .sort((a, b) => a.id - b.id)
  .map((item) => {
    const idLine = `id: ${item.id}`;
    const priorityBlock = numberToEmoji(item.priority);
    const priorityAndNameLine = `${priorityBlock} ${item.name}`;
    const nameOffset = `${idLine}\n${priorityBlock} `.length;
    const descriptionOffset = `${idLine}\n${priorityAndNameLine}\n`.length;

    return [
      new Format.FmtString(
        `${idLine}\n${priorityAndNameLine}\n${item.description}`,
        [
          ...item.descriptionEntities.map((entity) => ({
            ...entity,
            offset: entity.offset + descriptionOffset,
          })),
          { offset: 0, length: idLine.length, type: 'italic' },
          { offset: nameOffset, length: item.name.length, type: 'bold' },
        ],
      ),

      Markup.inlineKeyboard([
        [ Markup.button.callback('Изменить приоритет', `update_priority ${item.id}`) ],
        [ Markup.button.callback('Изменить название', `update_name ${item.id}`) ],
        [ Markup.button.callback('Изменить описание', `update_description ${item.id}`) ],
        [ Markup.button.callback('Удалить', `delete ${item.id}`) ],
      ]),
    ];
  });

  await ctx.sendMessage('Актуальный список:');
  for (const message of messages) {
    await ctx.reply(...message);
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
      'Отправьте мне новое описание (произвольный текст с переносами строк и форматированием)\n' +
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

    await Promise.all([
      db.run('DELETE FROM description_entities WHERE list_item_id = ?', ctx.match[1]),
      db.run('DELETE FROM participants WHERE list_item_id = ?', ctx.match[1]),
    ]);
    await db.run('DELETE FROM list WHERE id = ?', ctx.match[1]);

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
      'Описание — произвольный текст с переносами строк и форматированием'
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

    if (ctx.session?.updateDescription && ctx.session?.updateDescriptionId) {
      const match = /^[\s\S]+$/.exec(ctx.update.message.text);
      const itemId = ctx.session.updateDescriptionId;

      delete ctx.session.updateDescription;
      delete ctx.session.updateDescriptionId;

      if (!match) {
        return ctx.reply('Ошибка в описании. Не могу обновить');
      }

      await db.run('UPDATE list SET description = ? WHERE id = ?', [ match[0], itemId ]);
      await db.run('DELETE FROM description_entities WHERE list_item_id = ?', itemId);
      await saveDescriptionEntities(db, itemId, ctx.update.message.entities, 0);

      await ctx.reply('Описание обновлено!');
      sendList(ctx, db);
      return;
    }

    if (ctx.session?.addItemToWishlist) {
      const match = /^([\d]+)\n(.+)\n([\s\S]+)$/.exec(ctx.update.message.text);
      delete ctx.session.addItemToWishlist;

      if (!match || match.length < 4) {
        return ctx.reply('Ошибка в описании подарка. Не могу добавить');
      }

      const descriptionOffset = match[1].length + match[2].length + 2;

      const { lastID } = await db.run(
        'INSERT INTO list (priority, name, description, state) VALUES (?, ?, ?, 0)',
        match.slice(1),
      );

      await saveDescriptionEntities(db, lastID, ctx.update.message.entities, descriptionOffset);

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

      const idsPlaceholders = new Array(ids.length).fill('?').join(', ');
      await Promise.all([
        db.run(`DELETE FROM description_entities WHERE list_item_id IN (${idsPlaceholders})`, ids),
        db.run(`DELETE FROM participants WHERE list_item_id IN (${idsPlaceholders})`, ids),
      ]);
      await db.run(`DELETE FROM list WHERE id IN (${idsPlaceholders})`, ids);

      await ctx.reply('Список очищен!');
      sendList(ctx, db);
      return;
    }

    next();
  });
};

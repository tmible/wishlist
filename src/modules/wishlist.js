import { Markup } from 'telegraf';
import {
  ListItemState,
  ListItemStateToEmojiMap,
} from '../constants.js';

const numberToEmoji = (number) => {
  return String.fromCodePoint(0x0030 + number, 0x20E3);
};

export const sendList = async (ctx, updatePropertyKey, db) => {
  const messages = (await db.all(`
    SELECT id, priority, name, description, state, participants
    FROM list LEFT JOIN (
      SELECT listItemId, GROUP_CONCAT(username) as participants
      FROM participants
      GROUP BY listItemId
    ) as participants ON list.id = participants.listItemId
  `))
  .map((item) => ({ ...item, participants: item.participants?.split(',') ?? [] }))
  .sort((a, b) => a.priority - b.priority)
  .map((item) => [

    ListItemStateToEmojiMap.get(item.state) + ' ' + numberToEmoji(item.priority) +
    ' ***' + item.name + '***\n' + item.description +
    (item.participants.length > 0 ?
      item.state === ListItemState.BOOKED ?
        `\n\nзабронировал @\\${item.participants[0].split('').join('\\')}` :
        `\n\nучастники: ${
          item.participants.map(
            (participant) => `@\\${participant.split('').join('\\')}`,
          ).join(', ')
        }` :
      ''
    ),

    Markup.inlineKeyboard([
      ...(
        item.state === ListItemState.FREE ?
          [ Markup.button.callback('Забронировать', `book ${item.id}`) ] :
          []
      ),
      ...(
        item.state === ListItemState.FREE ||
        (
          item.state === ListItemState.COOPERATIVE &&
          !item.participants.includes(ctx.update[updatePropertyKey].from.username)
        ) ?
          [ Markup.button.callback('Поучаствовать', `cooperate ${item.id}`) ] :
          []
      ),
      ...(
        (
          item.state === ListItemState.COOPERATIVE ||
          item.state === ListItemState.BOOKED
        ) && item.participants.includes(ctx.update[updatePropertyKey].from.username) ?
          [ Markup.button.callback('Отказаться', `retire ${item.id}`) ] :
          []
      ),
    ]),
  ]);

  await ctx.sendMessage('Актуальный список:');
  for (const message of messages) {
    await ctx.replyWithMarkdownV2(...message);
  }
};

export const configureWishlistModule = (bot, db) => {
  console.log('configuring wishlist module');

  bot.command('list', (ctx) => {
    if (
      ctx.update.message.chat.type === 'group' ||
      ctx.update.message.chat.id === 455852268
    ) {
      return;
    }
    sendList(ctx, 'message', db);
  });

  bot.action(/^book (\d+)$/, async (ctx) => {
    const id = ctx.match[1];

    if (
      (await db.get('SELECT state FROM list WHERE id = ?', [ id ])).state === ListItemState.FREE
    ) {
      await Promise.all([
        db.run(
          'INSERT INTO participants VALUES (?, ?)',
          [ id, ctx.update.callback_query.from.username ],
        ),
        db.run('UPDATE list SET state = ? WHERE id = ?', [ ListItemState.BOOKED, id ]),
      ]);
      await ctx.sendMessage('Забронировано!');
    } else {
      await ctx.sendMessage('Невозможно забронировать');
    }

    sendList(ctx, 'callback_query', db);
  });

  bot.action(/^cooperate (\d+)$/, async (ctx) => {
    const id = ctx.match[1];

    if (
      (await db.get('SELECT state FROM list WHERE id = ?', [ id ])).state !== ListItemState.BOOKED
    ) {
      await Promise.all([
        db.run(
          'INSERT INTO participants VALUES (?, ?)',
          [ id, ctx.update.callback_query.from.username ],
        ),
        db.run('UPDATE list SET state = ? WHERE id = ?', [ ListItemState.COOPERATIVE, id ]),
      ]);
      await ctx.sendMessage('Вы добавлены в кооперацию!');
    } else {
      await ctx.sendMessage('Уже забронировано');
    }

    sendList(ctx, 'callback_query', db);
  });

  bot.action(/^retire (\d+)$/, async (ctx) => {
    const id = ctx.match[1];
    await Promise.all([
      db.run(
        'DELETE FROM participants WHERE listItemId = ? AND username = ?',
        [ id, ctx.update.callback_query.from.username ],
      ),
      db.run(`
        WITH participantsList AS (
          SELECT id, participants
          FROM
            (SELECT id FROM list WHERE id = ?1) as list
            LEFT JOIN (
              SELECT listItemId, GROUP_CONCAT(username) as participants
              FROM participants
              GROUP BY listItemId
            ) as participants ON list.id = participants.listItemId
        )
        UPDATE list
        SET state = CASE WHEN EXISTS (
          SELECT *
          FROM participantsList
          WHERE participantsList.id = ?1 AND participantsList.participants IS NOT NULL
        ) THEN ?2 ELSE ?3 END
        WHERE id = ?1
      `, [ id, ListItemState.COOPERATIVE, ListItemState.FREE ]),
    ]);
    await ctx.sendMessage('Успешный отказ!');
    sendList(ctx, 'callback_query', db);
  });
};

import { Format, Markup } from 'telegraf';
import {
  ListItemState,
  ListItemStateToEmojiMap,
  TmibleId,
} from '../constants.js';
import { numberToEmoji } from '../utils.js';

export const sendList = async (ctx, updatePropertyKey, db) => {
  const messages = (await db.all(`
    SELECT id, priority, name, description, state, participants, type, offset, length, additional
    FROM list
    LEFT JOIN (
      SELECT list_item_id, GROUP_CONCAT(username) as participants
      FROM participants
      GROUP BY list_item_id
    ) as participants ON list.id = participants.list_item_id
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
  .sort((a, b) => a.priority - b.priority)
  .map((item) => {
    const stateBlock = ListItemStateToEmojiMap.get(item.state);
    const priorityBlock = numberToEmoji(item.priority);
    const nameOffset = `${stateBlock} ${priorityBlock} `.length;
    const descriptionOffset = `${stateBlock} ${priorityBlock} ${item.name}\n`.length;
    const participantsBlock =
      item.participants.length > 0 ?
        item.state === ListItemState.BOOKED ?
          `\n\nзабронировал @${item.participants[0]}` :
          `\n\nучастники: @${item.participants.join(', @')}` :
        '';

    return [
      new Format.FmtString(
        `${stateBlock} ${priorityBlock} ${item.name}\n${item.description}${participantsBlock}`,
        [
          ...item.descriptionEntities.map((entity) => ({
            ...entity,
            offset: entity.offset + descriptionOffset,
          })),
          { offset: nameOffset, length: item.name.length, type: 'bold' },
        ],
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
    ];
  });

  await ctx.sendMessage('Актуальный список:');
  for (const message of messages) {
    await ctx.reply(...message);
  }
};

export const configureWishlistModule = (bot, db) => {
  console.log('configuring wishlist module');

  bot.command('list', (ctx) => {
    if (
      ctx.update.message.chat.type === 'group' ||
      ctx.update.message.chat.id === TmibleId
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
        'DELETE FROM participants WHERE list_item_id = ? AND username = ?',
        [ id, ctx.update.callback_query.from.username ],
      ),
      db.run(`
        WITH participantsList AS (
          SELECT id, participants
          FROM
            (SELECT id FROM list WHERE id = ?1) as list
            LEFT JOIN (
              SELECT list_item_id, GROUP_CONCAT(username) as participants
              FROM participants
              GROUP BY list_item_id
            ) as participants ON list.id = participants.list_item_id
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

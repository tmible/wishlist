import { Format, Markup } from 'telegraf';

const LinkForGroupsMarkup = Markup.inlineKeyboard([
  Markup.button.callback('Мне нужна ссылка для групп', 'link_for_groups'),
]);

const LinkForPrivateMarkup = Markup.inlineKeyboard([
  Markup.button.callback('Мне нужна ссылка на чат с ботом', 'link_for_private'),
]);

const formLink = (ctx, linkText = '', isLinkForGroups = false) => {
  const link =
    `https://t.me/${ctx.botInfo.username}?start${isLinkForGroups ? 'group' : ''}=${ctx.from.id}`;
  if (!!linkText && ctx.callbackQuery?.message.entities[0]?.type !== 'url') {
    return new Format.FmtString(
      linkText,
      [{ type: 'text_link', offset: 0, length: linkText.length, url: link }],
    );
  }
  return link;
};

const configure = (bot) => {
  bot.action(/^link_for_(groups|private)$/, async (ctx) => {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      formLink(ctx, ctx.callbackQuery.message.text, ctx.match[1] === 'groups'),
      ctx.match[1] === 'groups' ? LinkForPrivateMarkup : LinkForGroupsMarkup,
    );
  });

  bot.command('link', async (ctx) => {
    await ctx.reply(formLink(ctx, ctx.payload), LinkForGroupsMarkup);
  });
};

export default { configure };

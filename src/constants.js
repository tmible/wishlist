export const ListItemState = Object.freeze({
  FREE: 0,
  COOPERATIVE: 1,
  BOOKED: 2,
});

export const ListItemStateToEmojiMap = new Map([
  [ ListItemState.FREE, '🟢' ],
  [ ListItemState.COOPERATIVE, '🟡' ],
  [ ListItemState.BOOKED, '🔴' ],
]);

export const DefaultHelpMessage =
`Этот бот может:
\\- показать список желаний,
\\- забронировать за вами позицию списка,
\\- отметить вас готовым к кооперации по позиции списка,
\\- отменить ваше участие в позиции списка,
\\- отправить сообщение мне \\(@tmible\\) анонимно,
\\- прислать вам ответ от меня\\.
Бронирование предполагает самостоятельную реализацию позиции, кооперация — совместную\\.

Список команд:
/list — получение актуального списка,
/message — отправить анонимное сообщение,
/cancel_message — отменить отправку анонимного сообщения,
/help — справка\\.

В любой непонятной ситуации можете писать мне: \\@tmible`;

export const GroupHelpMessage =
`Этот бот может:
\\- отправить сообщение мне \\(@tmible\\) анонимно,
\\- прислать вам ответ от меня\\.

Список команд:
/message — отправить анонимное сообщение,
/cancel_message — отменить отправку анонимного сообщения,
/help — справка\\.

В любой непонятной ситуации можете писать мне: \\@tmible`;

export const DefaultCommandSet = [{
  command: 'list',
  description: 'показать список',
}, {
  command: 'message',
  description: 'отправить анонимное сообщение',
}, {
  command: 'cancel_message',
  description: 'отменить отправку анонимного сообщения',
}, {
  command: 'help',
  description: 'справка',
}];

export const GroupCommandSet = [{
  command: 'message',
  description: 'отправить анонимное сообщение',
}, {
  command: 'cancel_message',
  description: 'отменить отправку анонимного сообщения',
}, {
  command: 'help',
  description: 'справка',
}];

export const TmibleCommandSet = [{
  command: 'cancel_answer',
  description: 'отменить отправку ответа',
}];

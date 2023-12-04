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

В списке, рядом с названиями позиций, есть 2 эмодзи\\.
Первый, круглый, обозначает статус:
\\- зелёный — никто не выбирал,
\\- жёлтый — есть кооперация по позиции,
\\- красный — забронировано\\.
Второй, с числом, обозначает приоритет, где 1 — наивысшее значение\\.
Список также отсортирован по приоритету\\.

Под описанием позиции можно найти либо список ссылок на участников кооперации, либо ссылку на забронировавшего, чтобы вы всегда могли договориться\\.

Список команд:
/list — получить актуальный список,
/message — отправить анонимное сообщение,
/cancel\\_message — отменить отправку анонимного сообщения,
/help — справка\\.

В любой непонятной ситуации можете писать мне: \\@tmible`;

export const GroupHelpMessage =
`Этот бот может:
\\- отправить сообщение мне \\(@tmible\\) анонимно,
\\- прислать вам ответ от меня\\.

Список команд:
/message — отправить анонимное сообщение,
/cancel\\_message — отменить отправку анонимного сообщения,
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
  command: 'edit',
  description: 'редактировать список',
}, {
  command: 'cancel_update_priority',
  description: 'отменить обновление значения приоритета',
}, {
  command: 'cancel_update_name',
  description: 'отменить обновление названия',
}, {
  command: 'cancel_update_description',
  description: 'отменить обновление описания',
}, {
  command: 'add',
  description: 'добавить подарок в список',
}, {
  command: 'cancel_add',
  description: 'отменить добавление подарка',
}, {
  command: 'clear_list',
  description: 'очистить список (удалить подаренное, очистить кооперацию)',
}, {
  command: 'cancel_clear_list',
  description: 'отменить очищение списка',
}, {
  command: 'cancel_answer',
  description: 'отменить отправку ответа',
}];

export const TmibleId = 455852268;

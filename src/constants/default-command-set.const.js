/**
 * Набор команд по умолчанию
 * @constant {{ command: string, description: string }[]}
 */
const DefaultCommandSet = [{
  command: 'list',
  description: 'получить список',
}, {
  command: 'edit',
  description: 'редактировать свой список',
}, {
  command: 'add',
  description: 'добавить подарок в свой список',
}, {
  command: 'clear_list',
  description: 'частично очистить свой список',
}, {
  command: 'link',
  description: 'получить ссылку на свой список желаний',
}, {
  command: 'message',
  description: 'отправить анонимное сообщение',
}, {
  command: 'my_nickname',
  description: 'получить свой никнейм',
}, {
  command: 'help',
  description: 'справка',
}, {
  command: 'start',
  description: 'перезапустить бота',
}];

export default DefaultCommandSet;

/**
 * Набор команд для групповых чатов
 * @constant {{ command: string, description: string }[]}
 */
const GroupCommandSet = [{
  command: 'list',
  description: 'получить список',
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

export default GroupCommandSet;

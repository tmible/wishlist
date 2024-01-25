/**
 * Справка для групповых чатов
 * @constant {string}
 */
const GroupHelpMessage =
`С помощью этого бота вы можете:
• смотреть списки желаний других пользователей:
  ◦ бронировать за собой подарки,
  ◦ отмечаться готовым к кооперации по подаркам,
  ◦ отменять участие в подарках,
• отправлять анонимные сообщения,
• получать на них ответы\\.
Бронирование предполагает самостоятельную реализацию подарка, кооперация — совместную\\.

В списке желаний других пользователей рядом с названиями подарков есть 2 эмодзи\\.
Первый обозначает статус:
🟢 — никто не выбирал,
🟡 — есть кооперация,
🔴 — забронировано\\.
Второй обозначает приоритет, где 1️⃣ — наивысшее значение\\.
Список отсортирован по приоритету\\.

Под описанием подарка можно найти либо список ссылок на участников кооперации, либо ссылку на забронировавшего, чтобы вы всегда могли договориться 😉

Если у пользователя, список которого вы смотрите или который участвует в кооперации или забронировал подарок, нет имени пользователя, он будет указан под случайным ником\\. Если у пользователя не скрыт аккаунт, ник будет кликабельным\\. Свой ник можно узнать, используя команду /my\\_nickname\\. Это может помочь найти владельца некликабельного ника 🙂

Если хотите, чтобы я закреплял сообщения со списками, обязательно сделайте меня администратором\\!

Список команд:
/list \\{userid \\| username\\} — получить актуальный список пользователя,
/message \\{userid \\| username\\} — отправить анонимное сообщение пользователю,
/my\\_nickname — получить свой никнейм,
/help — справка\\.

В любой непонятной ситуации можете писать мне: \\@tmible`;

export default GroupHelpMessage;

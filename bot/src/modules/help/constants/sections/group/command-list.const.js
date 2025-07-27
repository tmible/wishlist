/**
 * Раздел справки для групповых чатов со списком команд
 * @constant {string}
 */
const GroupHelpCommandListSection = `\
*Список команд*

/list \\{userid \\| username\\} — получить актуальный список желаний пользователя,
/link \`\\{текст ссылки\\}\` — получить ссылку на свой список желаний \\(текст ссылки можно не \
указывать\\),
/message \\{userid \\| username\\} — отправить анонимное сообщение пользователю,
/my\\_nickname — получить свой никнейм,
/help — справка\\.\
`;

export default GroupHelpCommandListSection;

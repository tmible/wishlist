/**
 * Раздел справки по умолчанию со списком команд
 * @constant {string}
 */
const DefaultHelpCommandListSection =
`*Список команд*

/list \`\\{userid \\| username\\}\` — получить актуальный список пользователя,
/edit — редактировать свой список,
/add — добавить подарок в свой список,
/clear\\_list — частично очистить свой список \\(удалить подаренное, очистить кооперацию\\),
/message \`\\{userid \\| username\\}\` — отправить анонимное сообщение пользователю,
/my\\_nickname — получить свой никнейм,
/help — справка\\.`;

export default DefaultHelpCommandListSection;

/**
 * Раздел справки по умолчанию со списком команд
 * @constant {string}
 */
const DefaultHelpCommandListSection =
`*Список команд*

/list \`\\{userid \\| username\\}\` — получить актуальный список желаний пользователя,
/my\\_list — получить свой список желаний для редактирования,
/clear\\_list — частично очистить свой список желаний \\(удалить подаренное, очистить кооперацию\\),
/link \`\\{текст ссылки\\}\` — ${
  'получить ссылку на свой список желаний \\(текст ссылки можно не указывать\\),'
}
/message \`\\{userid \\| username\\}\` — отправить анонимное сообщение пользователю,
/my\\_nickname — получить свой никнейм,
/help — справка\\.`;

export default DefaultHelpCommandListSection;

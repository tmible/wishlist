/**
 * Регулярное выражение для идентификатора или имени пользователя
 * [Ограничение длины userid]{@link https://core.telegram.org/bots/api#contact}
 * Ограничение длины username — из интерфейса Телеграма
 * @constant {RegExp}
 */
const UseridOrUsernameRegExp = /^(?<userid>\d{1,16})|@?(?<username>[a-z][\d_a-z]{4,31})$/;

export default UseridOrUsernameRegExp;

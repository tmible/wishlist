/**
 * Регулярное выражение для идентификатора или имени пользователя
 * @constant {RegExp}
 */
const UseridOrUsernameRegExp = /^(?<userid>\d+)|@?(?<username>[a-z][\d_a-z]+)$/;

export default UseridOrUsernameRegExp;

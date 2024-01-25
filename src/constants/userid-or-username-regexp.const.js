/**
 * Регулярное выражение для идентификатора или имени пользователя
 * @constant {RegExp}
 */
const UseridOrUsernameRegexp = /^([0-9]+)|@?([a-z]{1}[a-z0-9_]+)$/;

export default UseridOrUsernameRegexp;

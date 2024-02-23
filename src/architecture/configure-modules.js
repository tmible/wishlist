/**
 * @typedef {import('telegraf').Telegraf} Telegraf
 *
 * Функция настройки модуля (регистрации обработчиков команд и действий)
 * @typedef {(bot?: Telegraf) => ModuleMessageHandler | void} ModuleConfigureFunction
 *
 * Функция регистрации обработчика сообщений от пользователя
 * @typedef {(bot?: Telegraf) => void} ModuleMessageHandler
 *
 * Настраиваемые модули бота
 * @typedef {object} Module
 * @property {ModuleConfigureFunction} configure Метод настройки
 *   (регистрации обработчиков команд и действий)
 * @property {ModuleMessageHandler} messageHandler Метод регистрации обработчиков
 *   сообщений от пользователя
 */

/**
 * Настройка модулей бота
 * Для каждого модуля вызывает метод настройки (регистрации обработчиков команд и действий)
 * и возвращает функцию, вызывающую все методы регистрации
 * обработчиков сообщений от пользователя при наличии.
 * Так сделано, чтобы функция-агрегатор вызывалась один раз на верхнем уровне
 * после регистрации всех обработчиков команд и действий
 * @function configureModules
 * @param {Telegraf} bot Бот
 * @param {Module[]} modules Настраиваемые модули
 * @returns {ModuleMessageHandler} Функция-агрегатор,
 *   регистрирующая все обработчики сообщений в дереве модулей
 */
const configureModules = (bot, modules) => {
  const messageHandlers = modules
    .flatMap((module) => [ module.configure(bot), module.messageHandler ])
    .filter((messageHandler) => !!messageHandler);
  return (bot) => messageHandlers.forEach((messageHandler) => messageHandler(bot));
};

export default configureModules;

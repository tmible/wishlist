/**
 * Настройка модулей бота
 * Для каждого модуля вызывает метод настройки (регистрации обработчиков команд и действий)
 * и возвращает функцию, вызывающую все методы регистрации
 * обработчиков сообщений от пользователя при наличии.
 * Так сделано, чтобы функция-агрегатор вызывалась один раз на верхнем уровне
 * после регистрации всех обработчиков команд и действий
 * @function configureModules
 * @param {Telegraf} bot Бот
 * @param {{ configure: (Telegraf?) => void, messageHandler: (Telegraf?) => void }[]} modules Настраиваемые модули
 * @returns {(Telegraf?) => void} функция-агрегатор, регистрирующая все обработчики сообщений в дереве модулей
 */
const configureModules = (bot, modules) => {
  const messageHandlers = modules
    .flatMap((module) => [ module.configure(bot), module.messageHandler ])
    .filter((messageHandler) => !!messageHandler);
  return (bot) => messageHandlers.forEach((messageHandler) => messageHandler(bot));
};

export default configureModules;

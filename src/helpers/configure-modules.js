/**
 * Настройка модулей бота
 * Для каждого модуля вызывает метод настройки (регистрации обработчиков команд и действий)
 * и метод регистрации обработчика сообщений от пользователя при наличии
 * @function configureModules
 * @param {Telegraf} bot Бот
 * @param {{ configure: (Telegraf?) => void, messageHandler: (Telegraf?) => void }[]} modules Настраиваемые модули
 */
const configureModules = (bot, modules) => {
  modules
  .map((module) => {
    module.configure(bot);
    return module.messageHandler;
  })
  .filter((messageHandler) => !!messageHandler)
  .forEach((messageHandler) => messageHandler(bot));
};

export default configureModules;

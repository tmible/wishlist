const configureModules = (bot, modules) => {
  modules
  .map((module) => {
    module.configure(bot);
    return module.messageHandler;
  })
  .filter((messageHandler) => !!messageHandler)
  .forEach((messageHandler) => messageHandler(bot))
};

export default configureModules;

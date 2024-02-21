import { exec } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { replaceEsm } from 'testdouble';

/**
 * Определение абсолютного пути к модулю по адресу,
 * использующему сокращения из "exports" package.json
 * и подмена этого модуля с помощью {@link replaceEsm}
 * Используется только в юнит-тестах, при деплое удаляется
 * @function replaceModule
 * @param {string} moduleAlias Адрес модуля, использующий сокращения из "exports" package.json
 * @param {object} [moduleMocks] Объект для подмены экспортов модуля
 * @returns {Promise<unknown>} Экспорт по умолчанию или все именованные экспорты подменённого модуля
 * @async
 * @throws {Error} Ошибка, если ни одно сокращение из "exports" package.json не соответствует
 *   указанному адресу
 */
const replaceModule = async (moduleAlias, moduleMocks) => {
  const [ prefix, pkg ] = await Promise.all([
    promisify(exec)('npm prefix').then(({ stdout }) => stdout.replaceAll(/\s/g, '')),
    promisify(exec)('npm pkg get name exports').then(({ stdout }) => JSON.parse(stdout)),
  ]);

  const relativeModuleAlias = moduleAlias.replace(pkg.name, '.');
  let matchingPath;

  for (const [ key, value ] of Object.entries(pkg.exports)) {
    const keyConstantPart = key.replace('*', '');

    if (relativeModuleAlias.startsWith(keyConstantPart)) {
      matchingPath = value.replace('*', relativeModuleAlias.slice(keyConstantPart.length));
    }
  }

  if (!matchingPath) {
    throw new Error(`Cannot match any path in package.json "exports" with ${moduleAlias}`);
  }

  const replacedModule = await (moduleMocks ?
    replaceEsm(resolve(prefix, matchingPath), moduleMocks) :
    replaceEsm(resolve(prefix, matchingPath))
  );
  return replacedModule?.default ?? replacedModule;
};

export default replaceModule;

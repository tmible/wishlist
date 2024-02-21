import { exec } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

/**
 * Определение абсолютного пути к модулю по адресу,
 * использующему сокращения из "exports" package.json
 * Используется только в юнит-тестах, при деплое удаляется
 * @function resolveModule
 * @param {string} moduleAlias Адрес модуля, использующий сокращения из "exports" package.json
 * @returns {Promise<string>} Абсолютный путь к модулю
 * @async
 */
const resolveModule = async (moduleAlias) => {
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

  return resolve(prefix, matchingPath);
};

export default resolveModule;

import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

/**
 * Определение абсолютного пути к модулю по адресу,
 * использующему сокращения из "exports" package.json
 * Используется только в юнит-тестах
 * @async
 * @function resolveModule
 * @param {string} moduleAlias адресу модуля, использующий сокращения из "exports" package.json
 * @returns {Promise<string>} Абсолютный путь к модулю
 */
const resolveModule = async (moduleAlias) => {
  const prefix = (await promisify(exec)('npm prefix')).stdout.replaceAll(/\s/g, '');
  const pkg = JSON.parse(await readFile(resolve(prefix, 'package.json')));

  let matchingPath;
  for (const [ key, value ] of Object.entries(pkg.exports)) {
    const match = new RegExp(
      `^${key.replace('.', pkg.name).replace('*', '(.+)')}$`
    ).exec(moduleAlias);
    if (match !== null) {
      matchingPath = value.replaceAll('*', match[1]);
    }
  }

  return resolve(prefix, matchingPath);
};

export default resolveModule;

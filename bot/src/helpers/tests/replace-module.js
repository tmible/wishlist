import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { replaceEsm } from 'testdouble';

/**
 * @typedef {Record<string, string | ({ imports: string } & Record<string, string>)>} ExportAliases
 */

/**
 * Определение расположения пакета в обоих вариантах: если это ссылка на себя
 * и если это зависимость, установленная по протоколу "workspace"
 * @function locatePackage
 * @param {string} modulePackage Название пакета
 * @returns {Promise<[ string | undefined, ExportAliases | undefined ]>} Абсолютный путь к пакету
 * и свойство "exports" из package.json пакета
 * @async
 */
const locatePackage = async (modulePackage) => {
  const [ prefix, pkg ] = await Promise.all([
    promisify(exec)('pnpm prefix').then(({ stdout }) => stdout.replaceAll(/\s/g, '')),
    promisify(exec)('pnpm pkg get name exports dependencies').then(
      ({ stdout }) => JSON.parse(stdout),
    ),
  ]);

  if (modulePackage === pkg.name) {
    return [ prefix, pkg.exports ];
  } else if (
    Object
      .entries(pkg.dependencies)
      .some(([ name, version ]) => name === modulePackage && version.startsWith('workspace:'))
  ) {
    const absoluteModulePath = resolve(prefix, 'node_modules', modulePackage);
    return [
      absoluteModulePath,
      /* eslint-disable-next-line security/detect-non-literal-fs-filename --
        Используется только при разработке */
      JSON.parse(await readFile(resolve(absoluteModulePath, 'package.json'), 'utf8')).exports,
    ];
  }

  return [ undefined, undefined ];
};

/**
 * Определение расположения пакета в обоих вариантах: если это ссылка на себя
 * и если это зависимость, установленная по протоколу "workspace"
 * @function matchExportAlias
 * @param {string} moduleAlias Псевдоним модуля
 * @param {string} modulePackage Название пакета
 * @param {ExportAliases} exportAliases Сокращения из "exports" package.json пакета
 * @returns {string | undefined} Относительный (от корня пакета) путь к модулю
 */
const matchExportAlias = (moduleAlias, modulePackage, exportAliases) => {
  let matchingPath;
  const relativeModuleAlias = moduleAlias.replace(modulePackage, '.');

  for (const [ key, value ] of Object.entries(exportAliases)) {
    const keyConstantPart = key.replace('*', '');

    if (relativeModuleAlias.startsWith(keyConstantPart)) {
      matchingPath = (
        typeof value === 'string' ? value : value.import
      ).replace('*', relativeModuleAlias.slice(keyConstantPart.length));
    }
  }

  return matchingPath;
};

/**
 * Определение абсолютного пути к модулю по адресу,
 * использующему сокращения из "exports" package.json,
 * и подмена этого модуля с помощью {@link replaceEsm}.
 * Модуль может быть как частью того же пакета,
 * так и частью пакета, установленного по протоколу "workspace"
 * Используется только в юнит-тестах, при деплое удаляется
 * @function replaceModule
 * @param {string} moduleAlias Адрес модуля
 * @param {object} [moduleMocks] Объект для подмены экспортов модуля
 * @returns {Promise<unknown>} Экспорт по умолчанию или все именованные экспорты подменённого модуля
 * @async
 * @throws {Error} Ошибка, если модуль не является ни частью ни частью того же пакета, ни частью
 * пакета, установленного по протоколу "workspace"
 * @throws {Error} Ошибка, если ни одно сокращение из "exports" package.json не соответствует
 * указанному адресу
 */
const replaceModule = async (moduleAlias, moduleMocks) => {
  const [ , modulePackage ] = /^(@[\w-]*\/[\w-]*|[\w-]*)\//.exec(moduleAlias);
  const [ absoluteModulePath, exportAliases ] = await locatePackage(modulePackage);

  if (!exportAliases || !absoluteModulePath) {
    throw new Error(
      `Cannot replace ${moduleAlias} — it's neither self reference nor workspace dependency`,
    );
  }

  const matchingPath = matchExportAlias(moduleAlias, modulePackage, exportAliases);

  if (!matchingPath) {
    throw new Error(
      `Cannot match any path in ${modulePackage}/package.json "exports" with ${moduleAlias}`,
    );
  }

  const replacedModule = await (moduleMocks ?
    replaceEsm(resolve(absoluteModulePath, matchingPath), moduleMocks) :
    replaceEsm(resolve(absoluteModulePath, matchingPath))
  );

  return replacedModule?.default ?? replacedModule;
};

export default replaceModule;

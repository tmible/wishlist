import { readFile } from 'node:fs/promises';
import { HEALTH_CHECK_FILE_PATH } from '$env/static/private';

/**
 * Чтение из файла результатов проверки здоровья сервисов
 * @type {import('./$types').RequestHandler}
 */
export const GET = async () => new Response(
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- Переменная окружения
  await readFile(HEALTH_CHECK_FILE_PATH, 'utf8'),
  { status: 200 },
);

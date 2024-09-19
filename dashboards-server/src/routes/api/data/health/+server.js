import { readFile } from 'node:fs/promises';
import { HEALTH_CHECK_FILE_PATH } from '$env/static/private';

/**
 * Чтение из файла результатов проверки здоровья сервисов
 * @type {import('./$types').RequestHandler}
 */
export const GET = async () => new Response(
  await readFile(HEALTH_CHECK_FILE_PATH, 'utf8'),
  { status: 200 },
);

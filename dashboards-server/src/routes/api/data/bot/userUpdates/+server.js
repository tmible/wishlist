import { json } from '@sveltejs/kit';
import { getBotUserUpdates } from '$lib/server/bot-user-updates/use-cases/get.js';

/**
 * Получение из БД с логами части полученных ботом обновлений
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const timeLock = url.searchParams.get('timeLock');
  const index = url.searchParams.get('index');
  const filters = url.searchParams.get('filters');
  return json(
    getBotUserUpdates({
      timeLock: timeLock === null ? undefined : Number.parseInt(timeLock),
      index: index === null ? undefined : Number.parseInt(index),
      filters: filters === null ? undefined : JSON.parse(filters),
    }),
  );
};

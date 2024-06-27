import { json } from '@sveltejs/kit';
import { responseTimeStatement } from '$lib/server/response-time-statement.const.js';

/**
 * Получение из БД с логами метрики времени, потраченного ботом с получения обновления
 * до отправки ответа пользователю, для каждого обновления в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  return json(responseTimeStatement.all(periodStart));
};

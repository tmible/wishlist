import { json } from '@sveltejs/kit';
import { dauStatement } from '$lib/server/dau-statement.const.js';

/**
 * Получение из БД с логами метрики DAU для каждого дня указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }

  const periodEnd = Date.now();

  return json(dauStatement.all(
    new Date(periodEnd).setDate(new Date().getDate() - 1),
    { periodStart, periodEnd },
  ));
};

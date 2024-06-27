import { json } from '@sveltejs/kit';
import { mauStatement } from '$lib/server/mau-statement.const.js';

/**
 * Получение из БД с логами метрики MAU для каждого дня указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }

  const periodEnd = Date.now();

  return json(mauStatement.all(
    new Date(periodEnd).setMonth(new Date().getMonth() - 1),
    { periodStart, periodEnd },
  ));
};

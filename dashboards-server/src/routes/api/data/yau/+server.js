import { json } from '@sveltejs/kit';
import { yauStatement } from '$lib/server/yau-statement.const.js';

/**
 * Получение из БД с логами метрики YAU для каждого дня указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }

  const periodEnd = Date.now();

  return json(yauStatement.all(
    new Date(periodEnd).setFullYear(new Date().getFullYear() - 1),
    { periodStart, periodEnd },
  ));
};

import { json } from '@sveltejs/kit';
import { successRateStatement } from '$lib/server/success-rate-statement.const.js';

/**
 * Получение из БД с логами метрики доли успешно обработанных
 * ботом обновлений в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  const { successful, total } = successRateStatement.get({ periodStart });
  return json(successful / total);
};

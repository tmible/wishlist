import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetRPS } from '$lib/server/db/portal/events.js';

/**
 * Получение из БД с логами метрики RPS портала для каждой секунды указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  return json(emit(GetRPS, periodStart, Date.now()));
};

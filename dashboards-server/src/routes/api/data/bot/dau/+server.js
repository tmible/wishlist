import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetDAU } from '$lib/server/db/bot/events.js';

/**
 * Получение из БД с логами метрики DAU бота для каждого дня указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  return json(emit(GetDAU, periodStart, Date.now()));
};

import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetStartupTime } from '$lib/server/db/bot/events.js';

/**
 * Получение из БД с логами метрики времени, потраченного ботом с получения обновления
 * до начала его обработки, для каждого обновления в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  return json(emit(GetStartupTime, periodStart));
};

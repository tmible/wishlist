import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetSuccessRate } from '$lib/server/db/bot/events.js';

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
  const { successful, total } = emit(GetSuccessRate, { periodStart });
  return json(successful / total);
};

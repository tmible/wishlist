import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetResponseTime } from '$lib/server/db/portal/events.js';

/**
 * Получение из БД с логами метрики времени, потраченного серверной частью портала
 * с получения запроса до отправки ответа на него, для каждого запроса в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  return json(emit(GetResponseTime, periodStart));
};

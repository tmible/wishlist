import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetAuthenticationFunnel } from '$lib/server/db/portal/events.js';

/**
 * Получение из БД с логами доли пользователей,
 * прошедших аутентификацию после посещения лендинга портала
 * в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  const { authentications, landingVisits } = emit(GetAuthenticationFunnel, { periodStart });
  return json(authentications / landingVisits);
};

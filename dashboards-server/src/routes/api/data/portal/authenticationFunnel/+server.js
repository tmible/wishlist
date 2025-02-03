import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

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
  const { authentications, landingVisits } = inject(
    InjectionToken.PortalAuthenticationFunnelStatement,
  ).get(
    { periodStart },
  );
  return json(authentications / landingVisits);
};

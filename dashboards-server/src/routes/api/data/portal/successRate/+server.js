import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Получение из БД с логами метрики доли успешно обработанных
 * серверной частью портала запросов в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  const { successful, total } = inject(
    InjectionToken.PortalSuccessRateStatement,
  ).get(
    { periodStart },
  );
  return json(successful / total);
};

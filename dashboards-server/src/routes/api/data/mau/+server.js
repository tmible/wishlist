import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Получение из БД с логами метрики MAU для каждого дня указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }

  const periodEnd = Date.now();

  return json(inject(InjectionToken.MAUStatement).all(
    new Date(periodEnd).setMonth(new Date().getMonth() - 1),
    { periodStart, periodEnd },
  ));
};

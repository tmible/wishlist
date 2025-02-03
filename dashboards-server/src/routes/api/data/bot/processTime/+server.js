import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Получение из БД с логами метрики времени, потраченного ботом с получения обновления
 * до завершения его обработки, для каждого обновления в пределах указанного периода
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const periodStart = url.searchParams.get('periodStart');
  if (!periodStart) {
    return new Response('missing periodStart parameter', { status: 400 });
  }
  return json(inject(InjectionToken.BotProcessTimeStatement).all(periodStart));
};

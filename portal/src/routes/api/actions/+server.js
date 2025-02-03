import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Сохранение действия в БД
 * @type {import('./$types').RequestHandler}
 */
export const PUT = async ({ cookies, request }) => {
  const { timestamp, action } = await request.json();
  const unknownUserUuid = cookies.get('unknownUserUuid');
  inject(InjectionToken.AddActionStatement).run(timestamp, action, unknownUserUuid);
  return new Response(null, { status: 200 });
};

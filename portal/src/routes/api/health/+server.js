import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Разлогинивание пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = () => new Response(
  JSON.stringify({
    dbConnection: inject(InjectionToken.Database).open,
    hubConnection: inject(InjectionToken.IPCHub).isConnected(),
  }),
  {
    status: 200,
  },
);

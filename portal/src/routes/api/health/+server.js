import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Database } from '$lib/server/db/injection-tokens.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';

/**
 * Разлогинивание пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = () => new Response(
  JSON.stringify({
    dbConnection: inject(Database).open,
    hubConnection: inject(IPCHub).isConnected(),
  }),
  {
    status: 200,
  },
);

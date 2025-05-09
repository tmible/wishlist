import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { CheckSocketConnection } from '$lib/server/ipc-hub/events.js';

/**
 * Разлогинивание пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = () => Response.json({
  dbConnection: inject(Database).open,
  hubConnection: emit(CheckSocketConnection),
});

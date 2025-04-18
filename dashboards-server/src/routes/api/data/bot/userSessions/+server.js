import { json } from '@sveltejs/kit';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetUserSessions } from '$lib/server/db/bot/events.js';

/**
 * Получение из БД с логами всех полученных ботом обновлений
 * @type {import('./$types').RequestHandler}
 */
export const GET = () => json(emit(GetUserSessions));

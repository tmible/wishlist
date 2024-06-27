import { json } from '@sveltejs/kit';
import { userSessionsStatement } from '$lib/server/user-sessions-statement.const.js';

/**
 * Получение из БД с логами всех полученных ботом обновлений
 * @type {import('./$types').RequestHandler}
 */
export const GET = () => json(userSessionsStatement.all());

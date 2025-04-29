import { json } from '@sveltejs/kit';
import { getUser } from '$lib/server/user/use-cases/get-user.js';

/**
 * Получение пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ cookies }) => json(await getUser(cookies));

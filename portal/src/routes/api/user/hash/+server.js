import { getUserHash } from '$lib/server/user/use-cases/get-user-hash.js';

/**
 * Получение хэша пользователя из БД с вычислением и записью, если такового не было
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ locals }) => new Response(await getUserHash(locals.userid));

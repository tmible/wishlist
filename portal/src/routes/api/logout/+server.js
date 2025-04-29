import { logout } from '$lib/server/user/use-cases/logout.js';

/**
 * Разлогинивание пользователя
 * @type {import('./$types').RequestHandler}
 */
export const POST = ({ cookies }) => {
  logout(cookies);
  return new Response(null, { status: 200 });
};

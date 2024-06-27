import { redirect } from '@sveltejs/kit';

/**
 * Перенаправление на страницу с формой аутентификации при запросе несуществующей страницы
 * @type {import('./$types').PageLoad}
 */
export const load = () => redirect(308, '/login');

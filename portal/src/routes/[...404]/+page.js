import { redirect } from '@sveltejs/kit';

/**
 * Перенаправление на главную страницу при запросе несуществующей страницы
 * @type {import('./$types').PageLoad}
 */
export const load = () => redirect(308, '/');

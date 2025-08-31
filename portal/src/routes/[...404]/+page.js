import { error } from '@sveltejs/kit';

/**
 * Перенаправление на главную страницу при запросе несуществующей страницы
 * @type {import('./$types').PageLoad}
 */
export const load = () => error(404);

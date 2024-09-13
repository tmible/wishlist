import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Получение из БД с логами всех полученных ботом обновлений
 * @type {import('./$types').RequestHandler}
 */
export const GET = () => json(inject(InjectionToken.UserSessionsStatement).all());

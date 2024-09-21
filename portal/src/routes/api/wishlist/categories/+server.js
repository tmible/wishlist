import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Получение категорий пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ locals }) => {
  const { userid } = locals;
  return json(inject(InjectionToken.GetUserCategoriesStatement).all(userid));
};

/**
 * Добавление категории
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ request, locals }) => {
  const { userid } = locals;
  const name = await request.text();
  inject(InjectionToken.AddCategoryStatement).run(userid, name);
  return new Response(null, { status: 200 });
};

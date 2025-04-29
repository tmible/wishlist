import { json } from '@sveltejs/kit';
import { addCategory } from '$lib/server/categories/use-cases/add-category.js';
import { getCategories } from '$lib/server/categories/use-cases/get-categories.js';

/**
 * Получение категорий пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ locals }) => json(getCategories(locals.userid));

/**
 * Добавление категории
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ request, locals }) => {
  const { id } = addCategory(locals.userid, await request.text());
  return new Response(
    null,
    { status: 201, headers: { Location: `/api/wishlist/categories/${id}` } },
  );
};

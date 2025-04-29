import { deleteCategory } from '$lib/server/categories/use-cases/delete-category.js';
import { updateCategory } from '$lib/server/categories/use-cases/update-category.js';
import { protectedEndpoint } from '$lib/server/protected-endpoint.js';

/**
 * Изменение названия категории
 * @type {import('./$types').RequestHandler}
 */
export const PUT = async ({ locals, params, request }) => {
  const category = { id: params.id, name: await request.text() };
  return protectedEndpoint(() => updateCategory(locals.userid, category));
};

/**
 * Удаление категории
 * @type {import('./$types').RequestHandler}
 */
export const DELETE = ({ locals, params }) => protectedEndpoint(
  () => deleteCategory(locals.userid, params.id),
);

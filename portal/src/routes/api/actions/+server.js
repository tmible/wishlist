import { addAction } from '$lib/server/actions/use-cases/add-action.js';

/**
 * Сохранение действия в БД
 * @type {import('./$types').RequestHandler}
 */
export const PUT = async ({ cookies, request }) => {
  const { timestamp, action } = await request.json();
  addAction(timestamp, action, cookies);
  return new Response(null, { status: 200 });
};

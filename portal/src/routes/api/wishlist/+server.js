import { json } from '@sveltejs/kit';
import { protectedEndpoint } from '$lib/server/protected-endpoint.js';
import { addItem } from '$lib/server/wishlist/use-cases/add-item.js';
import { addItemExternally } from '$lib/server/wishlist/use-cases/add-item-externally.js';
import { deleteItems } from '$lib/server/wishlist/use-cases/delete-items.js';
import { getWishlist } from '$lib/server/wishlist/use-cases/get-wishlist.js';
import { reorderWishlist } from '$lib/server/wishlist/use-cases/reorder-wishlist.js';

/**
 * Получение списка желаний владельцем
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ locals }) => json(getWishlist(locals.userid));

/**
 * Добавление элемента в список желаний
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ locals, request, url }) => {
  const targetUserHash = url.searchParams.get('wishlist');
  const { userid } = locals;
  const item = await request.json();
  if (targetUserHash) {
    addItemExternally(targetUserHash, item, userid);
    return new Response(null, { status: 201 });
  }
  return new Response(
    JSON.stringify(addItem(userid, item)),
    { status: 201 },
  );
};

/**
 * Обновление нескольких элементов списка желаний.
 * Используется при изменении порядка элементов в списке
 * @type {import('./$types').RequestHandler}
 */
export const PATCH = async ({ locals, request }) => {
  reorderWishlist(locals.userid, await request.json());
  return new Response(null, { status: 200 });
};

/**
 * Удаление нескольких элементов из списка желаний
 * @type {import('./$types').RequestHandler}
 */
export const DELETE = async ({ locals, request }) => {
  const ids = await request.json();
  return protectedEndpoint(() => deleteItems(locals.userid, ids));
};

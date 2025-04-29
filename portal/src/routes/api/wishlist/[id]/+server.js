import { protectedEndpoint } from '$lib/server/protected-endpoint.js';
import { deleteItem } from '$lib/server/wishlist/use-cases/delete-item.js';
import { updateItem } from '$lib/server/wishlist/use-cases/update-item.js';

/**
 * Изменение элемента списка. Обновление свойств элемента списка в БД в соответствии с телом
 * запроса. При необходимости удаление всех элементов разметки описания и запись новых. Все операции
 * с БД происходят в рамках одной транзакции
 * @type {import('./$types').RequestHandler}
 */
export const PATCH = async ({ locals, params, request }) => {
  const body = await request.json();
  return protectedEndpoint(() => updateItem(locals.userid, params.id, body));
};

/**
 * Удаление одного элемента из списка желаний
 * @type {import('./$types').RequestHandler}
 */
export const DELETE = ({ locals, params }) => protectedEndpoint(
  () => deleteItem(locals.userid, params.id),
);

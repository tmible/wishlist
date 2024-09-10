import { fail } from '@sveltejs/kit';

/**
 * Проксирование полученой формы на добавление элемента в список или его изменение
 * @type {import('./$types').Actions}
 */
export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    const method = formData.get('method');
    const listItemId = formData.get('listItemId');

    if (method === 'POST') {
      await fetch(
        '/api/wishlist',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify(Object.fromEntries(formData)),
        },
      );
    } else if (method === 'PUT' && listItemId) {
      await fetch(
        `/api/wishlist/${listItemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify(Object.fromEntries(formData)),
        },
      );
    } else {
      return fail(400);
    }

    return { success: true };
  },
};

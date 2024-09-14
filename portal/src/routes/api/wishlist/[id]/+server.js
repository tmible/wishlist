import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';
import { parseAndInsertDescriptionEntities } from '$lib/parse-and-insert-description-entities.js';

/**
 * Названия атрибутов элемента списка. Используется
 * для отделения данных от метаданных в теле запроса
 * @constant {Set<string>}
 */
const LIST_ITEM_PROPERTIES = new Set([ 'name', 'description', 'priority' ]);

/**
 * Изменение элемента списка. Обновление свойств элемента списка в БД в соответствии с телом
 * запроса. При необходимости удаление всех элементов разметки описания и запись новых. Все операции
 * с БД происходят в рамках одной транзакции
 * @type {import('./$types').RequestHandler}
 */
export const PUT = async ({ params, request }) => {
  const body = await request.json();
  const keysToUpdate = Object.keys(body).filter((key) => LIST_ITEM_PROPERTIES.has(key));

  if (keysToUpdate.length === 0) {
    return new Response(null, { status: 400 });
  }

  const db = inject(InjectionToken.Database);
  db.transaction(() => {
    db.prepare(
      `UPDATE list SET ${
        keysToUpdate.map((key) => `${key} = '${body[key]}'`).join(', ')
      } WHERE id = ?`,
    ).run(
      params.id,
    );

    if (!keysToUpdate.includes('description')) {
      return;
    }

    db.prepare('DELETE FROM description_entities WHERE list_item_id = ?').run(params.id);

    parseAndInsertDescriptionEntities(db, params.id, JSON.parse(body.descriptionEntities ?? '[]'));
  })();

  inject(InjectionToken.IPCHub).sendMessage(`update ${body.userid}`);

  return new Response(null, { status: 200 });
};

import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';
import { parseAndInsertDescriptionEntities } from '$lib/parse-and-insert-description-entities.js';

/**
 * Названия атрибутов элемента списка. Используется
 * для отделения данных от метаданных в теле запроса
 * @constant {Set<string>}
 */
const LIST_ITEM_PROPERTIES = new Set([
  'name',
  'description',
  'descriptionEntities',
  'order',
  'categoryId',
]);

/**
 * Отображение названий атрибутов элемента списка из запроса в названия атрибутов в БД.
 * Не упомянутые совпадают
 * @constant {Map<string, string>}
 */
const LIST_ITEM_PROPERTIES_TO_DB_COLUMNS = new Map([
  [ 'categoryId', 'category_id' ],
]);

/**
 * Изменение элемента списка. Обновление свойств элемента списка в БД в соответствии с телом
 * запроса. При необходимости удаление всех элементов разметки описания и запись новых. Все операции
 * с БД происходят в рамках одной транзакции
 * @type {import('./$types').RequestHandler}
 */
export const PATCH = async ({ locals, params, request }) => {
  const body = await request.json();
  const keysToUpdate = Object.keys(body).filter((key) => LIST_ITEM_PROPERTIES.has(key));

  if (keysToUpdate.length === 0) {
    return new Response(null, { status: 400 });
  }

  const db = inject(InjectionToken.Database);
  db.transaction(() => {
    db.prepare(
      `UPDATE list SET ${
        keysToUpdate.filter((key) => key !== 'descriptionEntities').map(
          (key) => `${
            LIST_ITEM_PROPERTIES_TO_DB_COLUMNS.get(key) ?? key
          } = ${
            body[key] === null ? body[key] : `'${body[key]}'`
          }`,
        ).join(', ')
      } WHERE id = ?`,
    ).run(
      params.id,
    );

    if (!keysToUpdate.includes('descriptionEntities')) {
      return;
    }

    db.prepare('DELETE FROM description_entities WHERE list_item_id = ?').run(params.id);

    parseAndInsertDescriptionEntities(db, params.id, JSON.parse(body.descriptionEntities ?? '[]'));
  })();

  inject(InjectionToken.IPCHub).sendMessage(`update ${locals.userid}`);

  return new Response(null, { status: 200 });
};

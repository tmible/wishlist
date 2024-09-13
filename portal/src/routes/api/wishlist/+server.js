import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import { InjectionToken } from '$lib/architecture/injection-token';
import { parseAndInsertDescriptionEntities } from '$lib/parse-and-insert-description-entities.js';

/**
 * Получение списка желаний владельцем
 * @type {import('./$types').RequestHandler}
 */
export const GET = ({ url }) => {
  const userid = url.searchParams.get('userid');

  if (!userid) {
    return new Response('missing userid parameter', { status: 400 });
  }

  return json(
    inject(InjectionToken.GetUserWishlistStatement)
      .all(userid)
      /* eslint-disable-next-line unicorn/no-array-callback-reference --
        descriptionEntitiesReducer -- специально написанная для использования в reduce() функция
      */
      .reduce(descriptionEntitiesReducer, []),
  );
};

/**
 * Добавление элемента в список желаний
 * @type {import('./$types').RequestHandler}
 */
export const POST = async ({ request }) => {
  const {
    userid,
    priority,
    name,
    description,
    descriptionEntities,
  } = await request.json();

  const db = inject(InjectionToken.Database);

  db.transaction(() => {
    const itemId = inject(
      InjectionToken.AddItemStatement,
    ).get(
      userid,
      priority,
      name,
      description,
    ).id;

    parseAndInsertDescriptionEntities(db, itemId, JSON.parse(descriptionEntities));
  })();

  return new Response(null, { status: 200 });
};

/**
 * Удаление несколькиъ элементов из списка желаний. В рамках оодной транзакции с удалением
 * предварительно происходит подсчёт элементов списка, id которых входят во множество id, полученных
 * в запросе, и userid владельца которых совпадает с userid аутентифицированного пользователя. Если
 * количество таких элементов и количество id в запросе не совпадают, транзакция прерывается с
 * ошибкой авторизации. Таким образом обеспечивается эксклюзивность права пользователя на удаление
 * элементов своего списка
 * @type {import('./$types').RequestHandler}
 */
export const DELETE = async ({ request }) => {
  const { userid, ids } = await request.json();

  const db = inject(InjectionToken.Database);
  const idPlaceholders = ids.map(() => '?').join(', ');

  try {
    db.transaction(() => {
      const { number } = db.prepare(
        `SELECT COUNT(*) as number FROM list WHERE id IN (${idPlaceholders}) AND userid = ?`,
      ).get(
        ...ids,
        userid,
      );
      if (number !== ids.length) {
        throw new Error('Not authorized');
      }
      [
        `DELETE FROM description_entities WHERE list_item_id IN (${idPlaceholders})`,
        `DELETE FROM participants WHERE list_item_id IN (${idPlaceholders})`,
        `DELETE FROM list WHERE id IN (${idPlaceholders})`,
      ].forEach((statement) => db.prepare(statement).run(ids));
    })();
  } catch (e) {
    if (e.message !== 'Not authorized') {
      throw e;
    }
    return new Response(null, { status: 401 });
  }

  return new Response(null, { status: 200 });
};

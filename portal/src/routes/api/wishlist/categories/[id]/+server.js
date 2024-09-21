import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * Обновление или удаление категории. После выполнения соответствующего подготовленного
 * SQL выражения проверяется количество изменений в БД. Если оно меньше 1 (категории обновляются
 * и удаляются по одной), транзакция прерывается с ошибкой авторизации. Таким образом
 * обеспечивается эксклюзивность права пользователя на изменение и удаление своих категорий
 * @function handlePutOrDelete
 * @param {Statement} statement Подготовленное SQL выражение
 * @param {number} userid Идентификатор пользователя
 * @param {unknown[]} bindedParams Параметры для выполнения SQL выражения
 * @returns {Response} Ответ сервера
 */
const handlePutOrDelete = (statement, userid, ...bindedParams) => {
  const db = inject(InjectionToken.Database);

  try {
    db.transaction(() => {
      statement.run(...bindedParams);
      const { changes } = inject(InjectionToken.ChangesStatement).get();
      if (changes === 0) {
        throw new Error('Not authorized');
      }
    })();
  } catch (e) {
    if (e.message !== 'Not authorized') {
      throw e;
    }
    return new Response(null, { status: 401 });
  }

  inject(InjectionToken.IPCHub).sendMessage(`update ${userid}`);

  return new Response(null, { status: 200 });
};

/**
 * Изменение названия категории
 * @type {import('./$types').RequestHandler}
 */
export const PUT = async ({ locals, params, request }) => {
  const { userid } = locals;
  return handlePutOrDelete(
    inject(InjectionToken.UpdateCategoryStatement),
    userid,
    await request.text(),
    params.id,
    userid,
  );
};

/**
 * Удаление категории
 * @type {import('./$types').RequestHandler}
 */
export const DELETE = ({ locals, params }) => {
  const { userid } = locals;
  return handlePutOrDelete(
    inject(InjectionToken.DeleteCategoryStatement),
    userid,
    params.id,
    userid,
  );
};

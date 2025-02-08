import { inject } from '@tmible/wishlist-common/dependency-injector';
import sha256 from '@tmible/wishlist-common/sha-256';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Получение хэша пользователя из БД с вычислением и записью, если такового не было
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ locals }) => {
  const { userid } = locals;

  let hash = inject(InjectionToken.GetUserHashStatement).get(userid)?.hash;

  // eslint-disable-next-line security/detect-possible-timing-attacks -- Сравнение с null
  if (hash === null) {
    hash = await sha256(userid);
    hash = hash.slice(0, 7);
    inject(InjectionToken.SetUserHashStatement).run(hash, userid);
  }

  return new Response(hash);
};

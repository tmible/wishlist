import { inject } from '@tmible/wishlist-common/dependency-injector';
import { UNKNOWN_USER_UUID_COOKIE_NAME } from '$lib/constants/unknown-user-uuid-cookie-name.const.js';
import { initActionsFeature } from '$lib/server/actions/initialization.js';
import { initCategoriesFeature } from '$lib/server/categories/initialization.js';
import { chainMiddlewares } from '$lib/server/chain-middlewares.js';
import { initDB } from '$lib/server/db/initialization.js';
import initIPCHub from '$lib/server/ipc-hub/initialization.js';
import { connect } from '$lib/server/ipc-hub/use-cases/connect.js';
import { initLogger } from '$lib/server/logger/initialization.js';
import { Logger } from '$lib/server/logger/injection-tokens.js';
import { getLoggingMiddleware } from '$lib/server/logger/use-cases/get-logging-middleware.js';
import { initDB as initLogsDB } from '$lib/server/logs-db/initialization.js';
import initSupportFeature from '$lib/server/support/initialization.js';
import { authenticationMiddleware } from '$lib/server/user/authentication-middleware.js';
import { initUserFeature } from '$lib/server/user/initialization.js';
import { initWishlistFeature } from '$lib/server/wishlist/initialization.js';

// Открытие подключения к БД при старте приложения
initDB();

// Открытие подключения к БД с логами при старте приложения
initLogsDB();

// Создание логгера при старте приложения
initLogger();

// Подключение к IPC хабу при старте приложения
initIPCHub();
connect();

// Инициализация бизнес-модулей приложения
initActionsFeature();
initUserFeature();
initCategoriesFeature();
initWishlistFeature();
initSupportFeature();

// Цепочка обработчиков запросов к серверу
const handleApiRequest = chainMiddlewares(getLoggingMiddleware(), authenticationMiddleware);

/**
 * Обработчик, возвращающий ошибку, распределяющий запрсы к серверу по типу
 * @type {import('@sveltejs/kit').Handle}
 */
export const handle = async ({ event, resolve }) => (
  event.url.pathname.startsWith('/api') ?
    await handleApiRequest(event, resolve) :
    await resolve(event)
);

/**
 * Обработчик, логирующий ошибки
 * @type {import('@sveltejs/kit').HandleServerError}
 */
export const handleError = ({ error, event }) => {
  inject(
    Logger,
  ).error(
    {
      requestUuid: event.locals.requestUuid,
      unknownUserUuid: event.cookies.get(UNKNOWN_USER_UUID_COOKIE_NAME) ?? null,
      userid: event.locals.userid ?? null,
    },
    `error ${error.stack}`,
  );
};

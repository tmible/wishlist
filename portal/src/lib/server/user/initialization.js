import { provide } from '@tmible/wishlist-common/dependency-injector';
import { JWTService } from './injection-tokens.js';
import * as jwtService from './jwt.service.js';
import { initAddUserStatement } from './statements/add-user.js';
import { initDeleteRefreshTokenStatement } from './statements/delete-refresh-token.js';
import { initGetRefreshTokenStatement } from './statements/get-refresh-token.js';
import { initGetUserHashStatement } from './statements/get-user-hash.js';
import { initSetUserHashStatement } from './statements/set-user-hash.js';
import { initStoreRefreshTokenStatement } from './statements/store-refresh-token.js';

/**
 * Подготовка SQL выражений и регистрация зависимостей для работы с пользователем
 * @function initUserFeature
 * @returns {void}
 */
export const initUserFeature = () => {
  initAddUserStatement();
  initGetUserHashStatement();
  initSetUserHashStatement();
  initStoreRefreshTokenStatement();
  initGetRefreshTokenStatement();
  initDeleteRefreshTokenStatement();
  provide(JWTService, jwtService);
};

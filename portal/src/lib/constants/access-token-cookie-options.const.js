import { ACCESS_TOKEN_EXPIRATION } from './access-token-expiration.const.js';

/**
 * Свойства cookie файла, в котором хранится access токен аутентификации
 * @constant {{
 *   maxAge: number;
 *   path: string;
 *   httpOnly: boolean;
 *   secure: boolean;
 *   sameSite: boolean;
 * }}
 */
export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  maxAge: ACCESS_TOKEN_EXPIRATION,
  path: '/api',
  httpOnly: true,
  secure: true,
  sameSite: true,
};

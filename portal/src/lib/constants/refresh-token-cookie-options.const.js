import { REFRESH_TOKEN_EXPIRATION } from './refresh-token-expiration.const.js';

/**
 * Свойства cookie файла, в котором хранится refresh токен аутентификации
 * @constant {{
 *   maxAge: number;
 *   path: string;
 *   httpOnly: boolean;
 *   secure: boolean;
 *   sameSite: boolean;
 * }}
 */
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: REFRESH_TOKEN_EXPIRATION,
  path: '/api',
  httpOnly: true,
  secure: true,
  sameSite: true,
};

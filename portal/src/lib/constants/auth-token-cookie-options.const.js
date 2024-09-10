import { AUTH_TOKEN_EXPIRATION } from './auth-token-expiration.const.js';

/**
 * Свойства cookie файла, в котором хранится jwt-токен аутентификации
 * @constant {{
 *   maxAge: number;
 *   path: string;
 *   httpOnly: boolean;
 *   secure: boolean;
 *   sameSite: boolean;
 * }}
 */
export const AUTH_TOKEN_COOKIE_OPTIONS = {
  maxAge: AUTH_TOKEN_EXPIRATION,
  path: '/api',
  httpOnly: true,
  secure: true,
  sameSite: true,
};

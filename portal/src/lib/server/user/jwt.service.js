import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

/** @module Сервис работы с JWT */

/**
 * Асинхронная обёртка над библиотечной функцией
 * @type {(jwt: string) => Promise<object>}
 */
const verify = promisify(jwt.verify);

/**
 * Расшифровка JWT
 * @function decode
 * @param {string} token JWT
 * @returns {Promise<object>} Значение JWT
 * @async
 */
export const decode = async (token) => await verify(token, env.HMAC_SECRET);

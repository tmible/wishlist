/** @module Сетевой сервис действий */

/**
 * Отправка действия на сервер
 * @function sendAction
 * @param {string} action Название действия
 * @returns {Promise<void>}
 * @async
 */
export const sendAction = async (action) => {
  await fetch(
    '/api/actions',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        timestamp: Date.now(),
        action,
      }),
    },
  );
};

/**
 * Отправка POST запроса
 * @function post
 * @param {string} path Путь запроса
 * @param {unknown} body Тело запроса
 * @returns {Promise<Response>} Ответ сервера
 */
export const post = (path, body = {}) => fetch(path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  body: JSON.stringify(body),
});

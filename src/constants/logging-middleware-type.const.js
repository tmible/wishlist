/**
 * Тип промежуточного обработчика -- логгера
 * AUXILARY_ACTIVITIES -- добавляет сообщение в лог сразу при получении обновления
 *   и сразу после полного окончания его обработки
 * UPDATE_PROCESSING -- добавляет сообщение в лог сразу после окончания подготовки к обработке
 *   обновления и сразу после ответа пользователю
 * @enum {number}
 */
const LoggingMiddlewareType = Object.freeze({
  AUXILARY_ACTIVITIES: 0,
  UPDATE_PROCESSING: 1,
});

export default LoggingMiddlewareType;

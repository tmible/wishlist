/**
 * Построение цепочки обязанностей. Цепочка будет продолжать свою работу, пока либо закончатся
 * обработчики, либо один из них вернёт что-то. Во втором случае цепочка вернёт это значение
 * @template A = unknown
 * @function chainHandlers
 * @param {((...args: A[]) => unknown)[]} handlers Обработчики
 * @returns {(...args: A[]) => Promise<unknown>} Цепочка обязанностей
 * @async
 */
/* eslint-disable-next-line consistent-return --
  Механизм цепочки основан на разных возвращаемых значениях */
export const chainHandlers = (...handlers) => async (...args) => {
  for (const handler of handlers) {
    const returnValue = await handler(...args);
    if (returnValue !== undefined) {
      return returnValue;
    }
  }
};

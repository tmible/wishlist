/**
 * @template A
 * @template R
 * @callback Middleware
 * @param {A} [args] Аргументы промежуточного обработчика
 * @param {Middleware<A, R>} next Следующий промежуточный обработчик
 * @returns {R} Результат работы следующего промежуточного обработчика
 */

/**
 * @template A
 * @template R
 * @callback MiddlewareChainCaller
 * TS valid: [ ...A, (A) => R ]
 * @param {[ A | (A) => R ]} args
 *   Аргументы для вызова каждого помежуточного обработчика и финальный обработчик
 * @returns {R}
 * @throws {Error} Ошибка, если не передать хотя бы один аргумент
 * @throws {TypeError} Ошибка, если последний аргумент не является функцией
 */

/**
 * Построение цепочки из промежуточных обработчиков
 * @template A
 * @template R
 * @function chainMiddlewares
 * @param {Middleware<A, R>[]} middlewares Промежуточные обработчики
 * @returns {MiddlewareChainCaller<A, R>} Функиця запуска построенной цепочки
 */
export const chainMiddlewares = (...middlewares) => {
  let final;
  const chain = middlewares.reduceRight(
    (accum, middleware) => (...args) => middleware(...args, accum),
    (...args) => final(...args),
  );
  return (...args) => {
    if (args.length === 0) {
      throw new Error('Must have at least one argument');
    }
    if (typeof args.at(-1) !== 'function') {
      throw new TypeError('Last argument must be a function');
    }
    final = args.at(-1);
    return chain(...args.slice(0, -1));
  };
};

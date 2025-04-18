/**
 * Функция-обёртка для пропуска первого вызова целевой функции
 * Используется для пропуска первого вызова подписчика Svelte хранилища
 * @template {unknown} P
 * @function skipFirstCall
 * @param {(...args: P[]) => void} func Целевая функция
 * @returns {(...args: P[]) => void} Функция обёртка, игнорирующая первый вызов
 * @see {@link https://svelte.dev/docs/svelte/stores#Store-contract}
 */
export const skipFirstCall = (func) => {
  let calls = 0;
  return (...args) => {
    calls += 1;
    if (calls === 1) {
      return;
    }
    func(...args);
  };
};

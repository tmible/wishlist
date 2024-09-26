/**
 * Ожидание появления элемента в DOM
 * @function waitForElement
 * @param {string} selector Селектор элемента
 * @param {HTMLElement[]} [targets] Элементы, изменения внутри которых будут отслеживаться
 * @returns {Promise<HTMLElement>} Соответствующий селектору элемент
 */
export const waitForElement = (
  selector,
  targets = [ document.body ],
) => new Promise((resolve, reject) => {
  if (document.querySelector(selector)) {
    resolve(document.querySelector(selector));
  } else {
    const observers = [];

    const rejectTimeout = setTimeout(
      () => {
        for (const observer of observers) {
          observer.disconnect();
        }
        reject(new Error(`Waiting for ${selector} rejected after 10 seconds`));
      },
      10000,
    );

    observers.push(...targets.map(() => new MutationObserver(() => {
      if (document.querySelector(selector)) {
        clearTimeout(rejectTimeout);
        for (const observer of observers) {
          observer.disconnect();
        }
        resolve(document.querySelector(selector));
      }
    })));

    for (const [ i, observer ] of observers.entries()) {
      observer.observe(
        targets[i],
        {
          childList: true,
          subtree: true,
        },
      );
    }
  }
});

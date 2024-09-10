/**
 * Ожидание появления элемента в DOM
 * @function waitForElement
 * @param {string} selector Селектор элемента
 * @param {HTMLElement} [target] Элемент, изменения внутри которого будут отслеживаться
 * @returns {Promise<HTMLElement>} Соответствующий селектору элемент
 */
export const waitForElement = (
  selector,
  target = document.body,
) => new Promise((resolve, reject) => {
  if (document.querySelector(selector)) {
    resolve(document.querySelector(selector));
  } else {
    const rejectTimeout = setTimeout(
      () => reject(new Error(`Waiting for ${selector} rejected after 10 seconds`)),
      10000,
    );

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        clearTimeout(rejectTimeout);
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(
      target,
      {
        childList: true,
        subtree: true,
      },
    );
  }
});

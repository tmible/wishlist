/**
 * Формирование ссылки на список пользователя в диалоге с ботом или для групп, в которых есть бот.
 * По возможности вызов меню "Поделиться", иначе копирование ссылки в буфер обмена и индикация
 * в интерфейсе
 * @function shareLink
 * @param {HTMLElement} currentTarget Цель события клика по кнопке получения ссылки
 * @param {boolean} isLinkForGroups Признак необходимости формирования ссылки для групп
 * @param {string} hash Хэш пользователя
 * @returns {void}
 * @async
 */
export const shareLink = async (currentTarget, isLinkForGroups, hash) => {
  const link = `https://t.me/tmible_wishlist_bot?start${isLinkForGroups ? 'group' : ''}=${hash}`;

  try {
    await navigator.share({ url: link });
  } catch {
    await navigator.clipboard.writeText(link);
    currentTarget.classList.add('clicked', 'relative');
    setTimeout(() => currentTarget.classList.remove('clicked', 'relative'), 1000);
  }
};

import { toast } from 'svoast';

/**
 * Формирование ссылки на список пользователя в диалоге с ботом или для групп, в которых есть бот.
 * По возможности вызов меню "Поделиться", иначе копирование ссылки в буфер обмена и индикация
 * в интерфейсе
 * @function shareLink
 * @param {boolean} isLinkForGroups Признак необходимости формирования ссылки для групп
 * @param {string} hash Хэш пользователя
 * @returns {void}
 * @async
 */
export const shareLink = async (isLinkForGroups, hash) => {
  const link = `https://t.me/wishnibot?start${isLinkForGroups ? 'group' : ''}=${hash}`;

  try {
    await navigator.share({ url: link });
  } catch {
    await navigator.clipboard.writeText(link);
    toast.success('Скопировано', { duration: 1000 });
  }
};

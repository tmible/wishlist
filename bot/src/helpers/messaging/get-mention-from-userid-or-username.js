import { Format } from 'telegraf';
import getNickname from '@tmible/wishlist-bot/utils/get-nickname';

/**
 * Формирование упоминания пользователя по его идентификатору и/или имени
 * @function getMentionFromUseridOrUsername
 * @param {number} userid Идентификатор пользователя
 * @param {string} username Имя пользователя
 * @returns {Format.FmtString} Строка формата с упоминанием пользователя
 */
const getMentionFromUseridOrUsername = (userid, username) => {
  const mention = username ? `@${username}` : getNickname(userid);

  return new Format.FmtString(
    mention,
    username ?
      [{
        type: 'mention',
        offset: 0,
        length: mention.length,
      }] :
      [{
        type: 'text_link',
        offset: 0,
        length: mention.length,
        url: `tg://user?id=${userid}`,
      }, {
        type: 'underline',
        offset: 0,
        length: mention.length,
      }],
  );
};

export default getMentionFromUseridOrUsername;

import UseridOrUsernameRegexp from '@tmible/wishlist-bot/constants/userid-or-username-regexp';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';

/**
 * Получение идентификатора и имени пользователя из пользовательского ввода
 * @function getUseridFromInput
 * @param {string} input Пользовательский ввод
 * @returns {[ number | undefined, string | undefined ] | [ null, null ]} Идентификатор и имя пользователя
 */
const getUseridFromInput = (input) => {
  const match = UseridOrUsernameRegexp.exec(input);

  if (!match) {
    return [ null, null ];
  }

  const [ _, userid, username ] = match;

  return !!userid ?
    emit(Events.Usernames.GetUseridAndUsernameIfPresent, userid) :
    [ emit(Events.Usernames.GetUseridByUsername, username), username ];
};

export default getUseridFromInput;

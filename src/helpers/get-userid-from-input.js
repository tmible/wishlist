import UseridOrUsernameRegexp from 'wishlist-bot/constants/userid-or-username-regexp';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';

/**
 * Получение идентификатора и имени пользователя из пользовательского ввода
 * @function getUseridFromInput
 * @param {string} input пользовательский ввод
 * @returns {[ string | undefined, string | undefined ] | [ null, null ]} идентификатор и имя пользователя
 */
const getUseridFromInput = (input) => {
  const match = UseridOrUsernameRegexp.exec(input);

  if (!match) {
    return [ null, null ];
  }

  const [ _, userid, username ] = match;

  return !!userid ?
    [ userid, emit(Events.Usernames.GetUsernameByUserid, userid) ] :
    [ emit(Events.Usernames.GetUseridByUsername, username), username ];
};

export default getUseridFromInput;

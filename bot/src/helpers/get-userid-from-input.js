import Events from '@tmible/wishlist-bot/architecture/events';
import UseridOrUsernameRegExp from '@tmible/wishlist-bot/constants/userid-or-username-regexp';

/** @typedef {import('@tmible/wishlist-common/event-bus').EventBus} EventBus */

/**
 * Получение идентификатора и имени пользователя из пользовательского ввода
 * @function getUseridFromInput
 * @param {EventBus} eventBus Шина событий
 * @param {string} input Пользовательский ввод
 * @returns {[ number | undefined, string | undefined ] | [ null, null ]}
 *   Идентификатор и имя пользователя
 */
const getUseridFromInput = (eventBus, input) => {
  const match = UseridOrUsernameRegExp.exec(input);

  if (!match) {
    return [ null, null ];
  }

  const { userid, username } = match.groups;

  return userid ?
    eventBus.emit(Events.Usernames.GetUseridAndUsernameIfPresent, userid) :
    [ eventBus.emit(Events.Usernames.GetUseridByUsername, username), username ];
};

export default getUseridFromInput;

import UseridOrUsernameRegexp from 'wishlist-bot/constants/userid-or-username-regexp';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';

const getUseridFromInput = async (input) => {
  const match = UseridOrUsernameRegexp.exec(input);

  if (!match) {
    return [ null, null ];
  }

  const [ _, userid, username ] = match;

  let usernameFromStore;
  if (!!userid) {
    usernameFromStore = await emit(Events.Usernames.GetUsernameByUserid, userid);
  }

  return !!userid ?
    [ userid, usernameFromStore ] :
    [ await emit(Events.Usernames.GetUseridByUsername, username), username ];
};

export default getUseridFromInput;

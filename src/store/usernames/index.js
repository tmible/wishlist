import { subscribe } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import checkIfUseridIsPresent from './check-if-userid-is-present.js';
import getUseridByUsername from './get-userid-by-username.js';
import getUsernameByUserid from './get-username-by-userid.js';
import storeUsername from './store-username.js';

[
  [ Events.Usernames.GetUseridByUsername, getUseridByUsername ],
  [ Events.Usernames.GetUsernameByUserid, getUsernameByUserid ],
  [ Events.Usernames.CheckIfUseridIsPresent, checkIfUseridIsPresent ],
  [ Events.Usernames.StoreUsername, storeUsername ],
].forEach(([ event, handler ]) => subscribe(event, handler));

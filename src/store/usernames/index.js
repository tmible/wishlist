import { subscribe } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import getUseridByUsername from './get-userid-by-username.js';
import checkIfUsernameIsPresent from './check-if-username-is-present.js';
import storeUsername from './store-username.js';

[
  [ Events.Usernames.GetUseridByUsername, getUseridByUsername ],
  [ Events.Usernames.CheckIfUsernameIsPresent, checkIfUsernameIsPresent ],
  [ Events.Usernames.StoreUsername, storeUsername ],
].forEach(([ event, handler ]) => subscribe(event, handler));

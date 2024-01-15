import { db } from 'wishlist-bot/store';

const checkIfUsernameIsPresent = async (userid) => {
  return !!(await db.get('SELECT * FROM usernames WHERE userid = ?', userid));
};

export default checkIfUsernameIsPresent;

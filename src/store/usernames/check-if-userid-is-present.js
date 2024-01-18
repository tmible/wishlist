import { db } from 'wishlist-bot/store';

const checkIfUseridIsPresent = async (userid) => {
  return !!(await db.get('SELECT userid FROM usernames WHERE userid = ?', userid))?.userid;
};

export default checkIfUseridIsPresent;

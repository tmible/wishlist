import { db } from 'wishlist-bot/store';

const getUseridByUsername = async (username) => {
  return (await db.get('SELECT userid FROM usernames WHERE username = ?', username))?.userid;
};

export default getUseridByUsername;

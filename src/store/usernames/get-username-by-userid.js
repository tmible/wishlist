import { db } from 'wishlist-bot/store';

const getUsernameByUserid = async (userid) => {
  return (await db.get('SELECT username FROM usernames WHERE userid = ?', userid))?.username;
};

export default getUsernameByUserid;

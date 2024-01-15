import { db } from 'wishlist-bot/store';

const storeUsername = async (userid, username) => {
  await db.run('INSERT INTO usernames VALUES (?, ?)', [ userid, username ]);
};

export default storeUsername;

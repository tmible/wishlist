import { db } from 'wishlist-bot/store';

let statement;

const prepare = () => statement = db.prepare('SELECT userid FROM usernames WHERE userid = ?');

const eventHandler = (userid) => !!statement.get(userid)?.userid;

export default { eventHandler, prepare };

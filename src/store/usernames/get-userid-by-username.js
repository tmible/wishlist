import { db } from 'wishlist-bot/store';

let statement;

const prepare = () => statement = db.prepare('SELECT userid FROM usernames WHERE username = ?');

const eventHandler = (username) => statement.get(username)?.userid;

export default { eventHandler, prepare };

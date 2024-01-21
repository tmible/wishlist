import { Format } from 'telegraf';
import getNickname from 'wishlist-bot/utils/get-nickname';

const getMentionFromUseridOrUsername = (userid, username) => {
  const mention = !!username ? `@${username}` : getNickname(parseInt(userid));

  return new Format.FmtString(
    mention,
    !!username ?
      [{
        type: 'mention',
        offset: 0,
        length: mention.length,
      }] :
      [{
        type: 'text_link',
        offset: 0,
        length: mention.length,
        url: `tg://user?id=${userid}`,
      }, {
        type: 'underline',
        offset: 0,
        length: mention.length,
      }],
  );
};

export default getMentionFromUseridOrUsername;

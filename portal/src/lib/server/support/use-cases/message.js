import { inject } from '@tmible/wishlist-common/dependency-injector';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { MessageDeliveryStatus } from '../injection-tokens.js';

/**
 * Срок ожидания доставки сообщения в милисекундах
 * @constant {number}
 */
const MESSAGE_DELIVERY_TIMEOUT = 10000;

const messageSupport = (userid, message) => {
  const ipcHub = inject(IPCHub);
  const messageUUID = crypto.randomUUID();
  let timeout;

  const unsubscribe = ipcHub.subscribeOnceTo(
    new RegExp(`${messageUUID} support (?<status>.+)`),
    ({ groups }) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      inject(MessageDeliveryStatus).set(messageUUID, groups.status);
    },
  );

  ipcHub.sendMessage(`${messageUUID} support ${userid} ${message}`);
  timeout = setTimeout(() => unsubscribe(), MESSAGE_DELIVERY_TIMEOUT);

  return messageUUID;
};

export default messageSupport;

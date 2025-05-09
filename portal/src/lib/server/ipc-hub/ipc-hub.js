import { emit } from '@tmible/wishlist-common/event-bus';
import { WriteToSocket } from './events.js';

const subscriptions = new Map();

export const ipcHub = {
  sendMessage: (...args) => emit(WriteToSocket, ...args),
  subscribeOnceTo: (trigger, handler) => {
    subscriptions.set(trigger, (match) => {
      handler(match);
      subscriptions.delete(trigger);
    });
    return () => subscriptions.delete(trigger);
  },
};

export const onMessage = (data) => {
  const handlers = Array.from(
    subscriptions,
    ([ trigger, handler ]) => [ handler, trigger.exec(data.toString()) ],
  ).filter(
    ([ , match ]) => !!match,
  );
  for (const [ handler, match ] of handlers) {
    handler(match);
  }
};

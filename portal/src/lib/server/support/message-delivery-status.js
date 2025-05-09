/**
 * Срок хранения статуса доставки в милисекундах
 * @constant {number}
 */
const DELIVERY_STATUS_TTL = 10000;

const statusStore = new Map();

const subscriptions = new Map();

const messageDeliveryStatus = {
  subscribeOnceTo: (key, subscriber) => {
    const value = statusStore.get(key);

    if (value !== undefined) {
      subscriber(value);
      return () => {};
    }

    subscriptions.set(key, (value) => {
      subscriber(value);
      subscriptions.delete(key);
    });

    return () => subscriptions.delete(key);
  },

  set: (key, value) => {
    statusStore.set(key, value);
    for (const subscriber of subscriptions.values()) {
      subscriber(value);
    }
    setTimeout(() => statusStore.delete(key), DELIVERY_STATUS_TTL);
  },
};

export default messageDeliveryStatus;

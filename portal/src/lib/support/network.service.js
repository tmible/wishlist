/**
 * Срок ожидания доставки сообщения в милисекундах
 * @constant {number}
 */
const MESSAGE_DELIVERY_TIMEOUT = 10000;

const messageDeliveries = new Map();

export const stopMessageWaiting = (messageUUID) => {
  const { eventSource, timeout } = messageDeliveries.get(messageUUID) ?? {};
  if (timeout) {
    clearTimeout(timeout);
  }
  if (eventSource === undefined) {
    return;
  }
  eventSource.close();
  messageDeliveries.delete(messageUUID);
};

export const messageSupport = async (message) => {
  const response = await fetch('/api/supportMessage', { method: 'POST', body: message });
  const messageUUID = response.headers.get('Location')?.match(/\/[\w-]{36}$/)?.[0].slice(1);

  if (!messageUUID) {
    throw new Error('Server did not return UUID of message');
  }

  const messageDelivery = {
    eventSource: new EventSource(`/api/supportMessage/delivery/${messageUUID}`),
  };
  messageDeliveries.set(messageUUID, messageDelivery);

  return [
    messageUUID,
    Promise.race([
      new Promise((resolve, reject) => {
        messageDelivery.timeout = setTimeout(
          () => {
            stopMessageWaiting(messageUUID);
            reject(new Error('Support message delivery timed out'));
          },
          MESSAGE_DELIVERY_TIMEOUT,
        );
      }),
      ...[ 'fail', 'success' ].map((event) => new Promise((resolve) => {
        messageDelivery.eventSource.addEventListener(event, () => {
          stopMessageWaiting(messageUUID);
          resolve(event);
        });
      })),
      new Promise((resolve, reject) => {
        messageDelivery.eventSource.addEventListener('close', () => {
          stopMessageWaiting(messageUUID);
          reject(new Error('Support message delivery waiting stopped by server'));
        });
      }),
    ]),
  ];
};

const subscribers = new Map();

export const subscribe = (event, handler) => {
  subscribers.set(event, handler);
};

export const emit = (event, ...args) => {
  return subscribers.get(event)?.(...args);
};

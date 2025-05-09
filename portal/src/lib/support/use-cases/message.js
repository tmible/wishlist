import { inject } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService } from '../injection-tokens.js';

const messageSupport = async (message) => {
  const networkService = inject(NetworkService);
  const [ messageUUID, messageDelivery ] = await networkService.messageSupport(message);
  return [ messageDelivery, () => networkService.stopMessageWaiting(messageUUID) ];
};

export default messageSupport;

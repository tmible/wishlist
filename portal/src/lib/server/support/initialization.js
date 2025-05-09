import { provide } from '@tmible/wishlist-common/dependency-injector';
import { MessageDeliveryStatus } from './injection-tokens.js';
import messageDeliveryStatus from './message-delivery-status.js';

/**
 * Регистрация зависимостей для работы с поддержкой
 * @function initSupportFeature
 * @returns {void}
 */
const initSupportFeature = () => {
  provide(MessageDeliveryStatus, messageDeliveryStatus);
};

export default initSupportFeature;

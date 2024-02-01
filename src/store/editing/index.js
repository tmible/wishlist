import { subscribe } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import AddItem from './add-item.js';
import DeleteItems from './delete-items.js';
import GetList from './get-list.js';
import UpdateItemDescription from './update-item-description.js';
import UpdateItemName from './update-item-name.js';
import UpdateItemPriority from './update-item-priority.js';

/**
 * @module Модуль хранилища для обеспечения работы
 * пользователей с собственными списками желаний
 */

/**
 * Настройка модуля хранилища
 * [Подписка]{@link subscribe} на [события]{@link Events} и подготовка выражений запроса БД
 * @function configure
 */
const configure = () => {
  [
    [ Events.Editing.AddItem, AddItem ],
    [ Events.Editing.DeleteItems, DeleteItems ],
    [ Events.Editing.GetList, GetList ],
    [ Events.Editing.UpdateItemDescription, UpdateItemDescription ],
    [ Events.Editing.UpdateItemName, UpdateItemName ],
    [ Events.Editing.UpdateItemPriority, UpdateItemPriority ],
  ].forEach(([ event, { eventHandler } ]) => subscribe(event, eventHandler));

  [
    AddItem,
    GetList,
    UpdateItemDescription,
    UpdateItemName,
    UpdateItemPriority,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };

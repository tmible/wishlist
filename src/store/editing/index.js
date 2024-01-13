import { subscribe } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import addItem from './add-item.js';
import deleteItems from './delete-items.js';
import getList from './get-list.js';
import saveItemDescriptionEntities from './save-item-description-entities.js';
import updateItemDescription from './update-item-description.js';
import updateItemName from './update-item-name.js';
import updateItemPriority from './update-item-priority.js';

[
  [ Events.Editing.AddItem, addItem ],
  [ Events.Editing.DeleteItems, deleteItems ],
  [ Events.Editing.GetList, getList ],
  [ Events.Editing.SaveItemDescriptionEntities, saveItemDescriptionEntities ],
  [ Events.Editing.UpdateItemDescription, updateItemDescription ],
  [ Events.Editing.UpdateItemName, updateItemName ],
  [ Events.Editing.UpdateItemPriority, updateItemPriority ],
].forEach(([ event, handler ]) => subscribe(event, handler));

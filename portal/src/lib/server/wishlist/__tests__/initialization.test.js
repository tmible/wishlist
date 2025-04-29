import { describe, expect, it, vi } from 'vitest';
import { initWishlistFeature } from '../initialization.js';
import { initAddItemStatement } from '../statements/add-item.js';
import { initDeleteDescriptionEntitiesStatement } from '../statements/delete-description-entities.js';
import { initDeleteItemStatements } from '../statements/delete-item.js';
import { initDeleteItemsStatements } from '../statements/delete-items.js';
import { initGetItemStatement } from '../statements/get-item.js';
import { initGetWishlistStatement } from '../statements/get-wishlist.js';
import { initInsertDescriptionEntitiesStatement } from '../statements/insert-description-entities.js';
import { initReorderWishlistStatement } from '../statements/reorder-wishlist.js';
import { initUpdateItemStatement } from '../statements/update-item.js';

vi.mock('../statements/add-item.js');
vi.mock('../statements/delete-description-entities.js');
vi.mock('../statements/delete-item.js');
vi.mock('../statements/delete-items.js');
vi.mock('../statements/get-item.js');
vi.mock('../statements/get-wishlist.js');
vi.mock('../statements/insert-description-entities.js');
vi.mock('../statements/reorder-wishlist.js');
vi.mock('../statements/update-item.js');

describe('wishlist / initialization', () => {
  it('should init get wishlist statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initGetWishlistStatement)).toHaveBeenCalled();
  });

  it('should init add item statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initAddItemStatement)).toHaveBeenCalled();
  });

  it('should init get item statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initGetItemStatement)).toHaveBeenCalled();
  });

  it('should init insert description entities statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initInsertDescriptionEntitiesStatement)).toHaveBeenCalled();
  });

  it('should init reorder wishlist statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initReorderWishlistStatement)).toHaveBeenCalled();
  });

  it('should init delete items statements', () => {
    initWishlistFeature();
    expect(vi.mocked(initDeleteItemsStatements)).toHaveBeenCalled();
  });

  it('should init update item statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initUpdateItemStatement)).toHaveBeenCalled();
  });

  it('should init delete description entities statement', () => {
    initWishlistFeature();
    expect(vi.mocked(initDeleteDescriptionEntitiesStatement)).toHaveBeenCalled();
  });

  it('should init delete item statements', () => {
    initWishlistFeature();
    expect(vi.mocked(initDeleteItemStatements)).toHaveBeenCalled();
  });
});

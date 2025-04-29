import { describe, expect, it, vi } from 'vitest';
import { initCategoriesFeature } from '../initialization.js';
import { initAddCategoryStatement } from '../statements/add-category.js';
import { initDeleteCategoryStatement } from '../statements/delete-category.js';
import { initGetCategoriesStatement } from '../statements/get-categories.js';
import { initUpdateCategoryStatement } from '../statements/update-category.js';

vi.mock('../statements/add-category.js');
vi.mock('../statements/delete-category.js');
vi.mock('../statements/get-categories.js');
vi.mock('../statements/update-category.js');

describe('categories / initialization', () => {
  it('should init get categories statement', () => {
    initCategoriesFeature();
    expect(vi.mocked(initGetCategoriesStatement)).toHaveBeenCalled();
  });

  it('should init add category statement', () => {
    initCategoriesFeature();
    expect(vi.mocked(initAddCategoryStatement)).toHaveBeenCalled();
  });

  it('should init update category statement', () => {
    initCategoriesFeature();
    expect(vi.mocked(initUpdateCategoryStatement)).toHaveBeenCalled();
  });

  it('should init delete category statement', () => {
    initCategoriesFeature();
    expect(vi.mocked(initDeleteCategoryStatement)).toHaveBeenCalled();
  });
});

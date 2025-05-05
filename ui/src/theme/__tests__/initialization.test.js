import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initThemeFeature } from '../initialization.js';
import { ThemeService } from '../injection-tokens.js';
import * as themeService from '../service.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-ui/theme/injection-tokens', () => ({ ThemeService: 'theme service' }));
vi.mock('../injection-tokens.js', () => ({ ThemeService: 'theme service' }));

describe('theme / initialization', () => {
  let destroyThemeFeature;

  beforeEach(() => {
    destroyThemeFeature = initThemeFeature();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide network service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(ThemeService), themeService);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      destroyThemeFeature();
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(ThemeService));
    });
  });
});

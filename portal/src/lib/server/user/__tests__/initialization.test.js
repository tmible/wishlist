import { provide } from '@tmible/wishlist-common/dependency-injector';
import { describe, expect, it, vi } from 'vitest';
import { initUserFeature } from '../initialization.js';
import { JWTService } from '../injection-tokens.js';
import * as jwtService from '../jwt.service.js';
import { initAddUserStatement } from '../statements/add-user.js';
import { initDeleteRefreshTokenStatement } from '../statements/delete-refresh-token.js';
import { initGetRefreshTokenStatement } from '../statements/get-refresh-token.js';
import { initGetUserHashStatement } from '../statements/get-user-hash.js';
import { initSetUserHashStatement } from '../statements/set-user-hash.js';
import { initStoreRefreshTokenStatement } from '../statements/store-refresh-token.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../injection-tokens.js', () => ({ JWTService: 'jwt service' }));
vi.mock('../jwt.service.js');
vi.mock('../statements/add-user.js');
vi.mock('../statements/delete-refresh-token.js');
vi.mock('../statements/get-refresh-token.js');
vi.mock('../statements/get-user-hash.js');
vi.mock('../statements/set-user-hash.js');
vi.mock('../statements/store-refresh-token.js');

describe('user / initialization', () => {
  it('should init add user statement', () => {
    initUserFeature();
    expect(vi.mocked(initAddUserStatement)).toHaveBeenCalled();
  });

  it('should init get user hash statement', () => {
    initUserFeature();
    expect(vi.mocked(initGetUserHashStatement)).toHaveBeenCalled();
  });

  it('should init set user hash statement', () => {
    initUserFeature();
    expect(vi.mocked(initSetUserHashStatement)).toHaveBeenCalled();
  });

  it('should init store refresh token statement', () => {
    initUserFeature();
    expect(vi.mocked(initStoreRefreshTokenStatement)).toHaveBeenCalled();
  });

  it('should init get refresh token statement', () => {
    initUserFeature();
    expect(vi.mocked(initGetRefreshTokenStatement)).toHaveBeenCalled();
  });

  it('should init delete refresh token statement', () => {
    initUserFeature();
    expect(vi.mocked(initDeleteRefreshTokenStatement)).toHaveBeenCalled();
  });

  it('should provide JWT service', () => {
    initUserFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(JWTService, jwtService);
  });
});

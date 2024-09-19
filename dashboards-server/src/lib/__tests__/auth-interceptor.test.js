// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated.js';
import { authInterceptor } from '../auth-interceptor.js';

vi.mock('$app/navigation');
vi.mock('$lib/store/is-authenticated.js');

describe('auth interceptor', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('if response code is 401', () => {
    let error;

    beforeEach(() => {
      try {
        authInterceptor({ status: 401 });
      } catch (e) {
        error = e;
      }
    });

    it('should update isAuthenticated store', () => {
      expect(vi.mocked(isAuthenticated).set).toHaveBeenCalledWith(false);
    });

    it('should redirect to /login', () => {
      expect(vi.mocked(goto)).toHaveBeenCalledWith('/login');
    });

    it('should ', () => {
      expect(error.message).toBe('Got 401 response');
    });
  });

  it('should return response', () => {
    const response = { status: 'status' };
    expect(authInterceptor(response)).toBe(response);
  });
});

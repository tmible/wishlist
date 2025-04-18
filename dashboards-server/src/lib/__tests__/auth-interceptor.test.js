import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { logout } from '$lib/user/use-cases/logout.js';

vi.mock('$lib/user/use-cases/logout.js');

describe('auth interceptor', () => {
  let authInterceptor;

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('unhandledrejection event listener', () => {
    let eventListener;
    let error;

    beforeAll(async () => {
      globalThis.addEventListener = vi.fn((event, listener) => eventListener = listener);
      authInterceptor = await import(
        '../auth-interceptor.js',
      ).then(
        ({ authInterceptor }) => authInterceptor,
      );
    });

    beforeEach(() => {
      try {
        authInterceptor({ status: 401 });
      } catch (e) {
        error = e;
      }
    });

    it('should add', () => {
      expect(
        globalThis.addEventListener,
      ).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function),
      );
    });

    it('should catch error', () => {
      const event = {
        reason: error,
        preventDefault: vi.fn(),
      };
      eventListener(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should pass other errors', () => {
      const event = {
        reason: { message: 'message' },
        preventDefault: vi.fn(),
      };
      eventListener(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('if response code is 401', () => {
    let error;

    beforeAll(async () => {
      authInterceptor = await import(
        '../auth-interceptor.js',
      ).then(
        ({ authInterceptor }) => authInterceptor,
      );
    });

    beforeEach(() => {
      try {
        authInterceptor({ status: 401 });
      } catch (e) {
        error = e;
      }
    });

    it('should invoke logout use case', () => {
      expect(vi.mocked(logout)).toHaveBeenCalledWith();
    });

    it('should throw error', () => {
      expect(error.message).toBe('Got 401 response');
    });
  });

  it('should return response', async () => {
    const response = { status: 'status' };
    authInterceptor = await import(
      '../auth-interceptor.js',
    ).then(
      ({ authInterceptor }) => authInterceptor,
    );
    expect(authInterceptor(response)).toBe(response);
  });
});

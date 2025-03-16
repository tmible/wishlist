import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initUnknownUserUuid } from '../unknown-user-uuid.js';

vi.mock('$app/environment', () => ({ browser: true }));

const localStorageStub = { getItem: vi.fn(), setItem: vi.fn() };
const cookieGetter = vi.fn();
const cookieSetter = vi.fn();
const documentStub = {
  get cookie() {
    return cookieGetter();
  },
  set cookie(value) {
    cookieSetter(value);
  },
};
const cryptoStub = { randomUUID: vi.fn() };
const windowStub = { addEventListener: vi.fn() };

describe('unknown user UUID', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageStub);
    vi.stubGlobal('document', documentStub);
    vi.stubGlobal('crypto', cryptoStub);
    vi.stubGlobal('window', windowStub);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const testSuits = [{
    condition: 'if there is unknown user UUID in localStorage',
    setUp: () => {
      localStorageStub.getItem.mockReturnValueOnce('unknownUserUuid from localStorage');
    },
    initializationExpectations: () => {
      expect(localStorageStub.getItem).toHaveBeenCalledWith('unknownUserUuid');
      expect(cookieGetter).not.toHaveBeenCalled();
      expect(cryptoStub.randomUUID).not.toHaveBeenCalled();
    },
    unknownUserUuid: 'unknownUserUuid from localStorage',
  }, {
    condition: 'if there is no unknown user UUID in localStorage',
    setUp: () => {
      localStorageStub.getItem.mockReturnValueOnce(null);
      cookieGetter.mockReturnValueOnce('unknownUserUuid=unknownUserUuid from cookies');
    },
    initializationExpectations: () => {
      expect(localStorageStub.getItem).toHaveBeenCalledWith('unknownUserUuid');
      expect(cookieGetter).toHaveBeenCalled();
      expect(cryptoStub.randomUUID).not.toHaveBeenCalled();
    },
    unknownUserUuid: 'unknownUserUuid from cookies',
  }, {
    condition: 'if there is no unknown user UUID neither in localStorage, nor in cookies',
    setUp: () => {
      localStorageStub.getItem.mockReturnValueOnce(null);
      cookieGetter.mockReturnValueOnce('');
      cryptoStub.randomUUID.mockReturnValueOnce('unknownUserUuid from crypto');
    },
    initializationExpectations: () => {
      expect(localStorageStub.getItem).toHaveBeenCalledWith('unknownUserUuid');
      expect(cookieGetter).toHaveBeenCalled();
      expect(cryptoStub.randomUUID).toHaveBeenCalled();
    },
    unknownUserUuid: 'unknownUserUuid from crypto',
  }];

  for (const { condition, setUp, initializationExpectations, unknownUserUuid } of testSuits) {
    describe(condition, () => {
      beforeEach(() => {
        setUp();
      });

      /* eslint-disable-next-line sonarjs/assertions-in-tests --
        Проверки внутри initializationExpectations */
      it('should initialize unknown user UUID', () => {
        initUnknownUserUuid();
        initializationExpectations();
      });

      it('should store unknown user UUID in localStorage', () => {
        initUnknownUserUuid();
        expect(localStorageStub.setItem).toHaveBeenCalledWith('unknownUserUuid', unknownUserUuid);
      });

      it('should store unknown user UUID in cookies', () => {
        initUnknownUserUuid();
        expect(
          cookieSetter,
        ).toHaveBeenCalledWith(
          `unknownUserUuid=${unknownUserUuid}; path=/; max-age=525600; secure; samesite`,
        );
      });

      it('should add event listener', () => {
        initUnknownUserUuid();
        expect(
          windowStub.addEventListener,
        ).toHaveBeenCalledWith(
          'beforeunload',
          expect.any(Function),
        );
      });

      describe('on beforeunload event', () => {
        let event;

        beforeEach(() => {
          let unloadEventListener;
          windowStub.addEventListener.mockImplementationOnce(
            (event, listener) => unloadEventListener = listener,
          );
          event = { returnValue: 'returnValue' };
          initUnknownUserUuid();
          unloadEventListener(event);
        });

        it('should store unknown user UUID in localStorage', () => {
          expect(localStorageStub.setItem).toHaveBeenCalledWith('unknownUserUuid', unknownUserUuid);
        });

        it('should store unknown user UUID in cookies', () => {
          expect(
            cookieSetter,
          ).toHaveBeenCalledWith(
            `unknownUserUuid=${unknownUserUuid}; path=/; max-age=525600; secure; samesite`,
          );
        });

        it('should set event return value', () => {
          expect(event.returnValue).toBe('');
        });
      });
    });
  }
});

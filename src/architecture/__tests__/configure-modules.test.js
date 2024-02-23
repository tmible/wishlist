import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import configureModules from '../configure-modules.js';

describe('configureModules', () => {
  let modules;

  beforeEach(() => modules = [{
    configure: mock.fn(),
    messageHandler: mock.fn(),
  /* eslint-disable @stylistic/js/object-curly-newline --
    Переносы строк для консистентности с другими элементами массива
  */
  }, {
    configure: mock.fn(),
  }]);
  /* eslint-enable @stylistic/js/object-curly-newline */

  afterEach(() => mock.reset());

  it('should configure modules', () => {
    configureModules({}, modules);
    assert.deepEqual(
      modules.map(({ configure }) => configure.mock.calls.length),
      modules.map(() => 1),
    );
  });

  it('should register modules message handlers if provided', () => {
    configureModules({}, modules)();
    assert.deepEqual(
      modules.filter(
        ({ messageHandler }) => !!messageHandler,
      ).map(
        ({ messageHandler }) => messageHandler.mock.calls.length,
      ),
      modules.filter(({ messageHandler }) => !!messageHandler).map(() => 1),
    );
  });

  it('should register all message handlers after all modules configured', (testContext) => {
    let isLastConfigureCalled = false;
    modules = [{
      configure: testContext.mock.fn(() => configureModules({}, [{
        configure: testContext.mock.fn(),
        messageHandler: testContext.mock.fn(() => {
          if (!isLastConfigureCalled) {
            throw new Error('message handler is registered before last module was configured');
          }
        }),
      }])),
      messageHandler: testContext.mock.fn(() => {
        if (!isLastConfigureCalled) {
          throw new Error('message handler is registered before last module was configured');
        }
      }),
    }, {
      configure: testContext.mock.fn(() => {
        isLastConfigureCalled = true;
      }),
    }];
    assert.doesNotThrow(() => configureModules({}, modules)());
  });
});

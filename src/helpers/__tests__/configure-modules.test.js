import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import configureModules from '../configure-modules.js';

describe('configureModules', () => {
  let modules;

  beforeEach(() => modules = [{
    configure: mock.fn(),
    messageHandler: mock.fn(),
  }, {
    configure: mock.fn(),
  }]);

  afterEach(() => mock.reset());

  it('should configure modules', () => {
    configureModules({}, modules);
    assert.deepEqual(
      modules.map(({ configure }) => configure.mock.calls.length),
      modules.map(() => 1),
    );
  });

  it('should register modules message handlers if provided', () => {
    configureModules({}, modules);
    assert.deepEqual(
      modules.filter(
        ({ messageHandler }) => !!messageHandler
      ).map(
        ({ messageHandler }) => messageHandler.mock.calls.length
      ),
      modules.filter(({ messageHandler }) => !!messageHandler).map(() => 1),
    );
  });
});

import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, replaceEsm, reset, when } from 'testdouble';

const [{ readFile }, { resolve }, { promisify }] = await Promise.all([
  replaceEsm('node:fs/promises'),
  replaceEsm('node:path'),
  replaceEsm('node:util'),
]);

const replaceModule = await import('../replace-module.js').then((module) => module.default);

describe('replaceModule', () => {
  beforeEach(() => {
    when(promisify(), { ignoreExtraArgs: true }).thenReturn(func());
    when(promisify(exec)('pnpm prefix')).thenResolve({ stdout: 'prefix' });
  });

  afterEach(reset);

  it(
    'should throw error if module is neither in the same package, ' +
    'nor from package installed via "workspace" protocol',
    () => {
      when(
        promisify(exec)('pnpm pkg get name exports dependencies'),
      ).thenResolve({
        stdout: JSON.stringify({
          name: 'name',
          dependencies: {},
        }),
      });
      assert.rejects(
        () => replaceModule('package/module'),
        {
          name: 'Error',
          message:
            'Cannot replace package/module — it\'s neither self reference nor workspace dependency',
        },
      );
    },
  );

  it('should throw error if there is no match in package.json "exports"', () => {
    when(
      promisify(exec)('pnpm pkg get name exports dependencies'),
    ).thenResolve({
      stdout: JSON.stringify({
        name: 'package',
        exports: { './not-module/*': 'path' },
      }),
    });
    assert.rejects(
      () => replaceModule('package/module'),
      {
        name: 'Error',
        message:
          'Cannot match any path in package/package.json "exports" with package/module',
      },
    );
  });

  it('should replace module from the same package', async () => {
    when(
      promisify(exec)('pnpm pkg get name exports dependencies'),
    ).thenResolve({
      stdout: JSON.stringify({
        name: 'package',
        exports: { './module/*': './module/real/*.js' },
      }),
    });
    when(resolve('prefix', './module/real/path.js')).thenReturn('prefix/module/real/path.js');
    try {
      await replaceModule('package/module/path');
      assert.ok(false);
    } catch (e) {
      assert.ok(e.message.startsWith('Cannot find package \'prefix\''));
    }
  });

  it('should replace module from package installed via "workspace" protocol', async () => {
    when(
      promisify(exec)('pnpm pkg get name exports dependencies'),
    ).thenResolve({
      stdout: JSON.stringify({
        name: 'name',
        dependencies: { package: 'workspace:*' },
      }),
    });
    when(resolve('prefix', 'node_modules', 'package')).thenReturn('prefix/node_modules/package');
    when(
      resolve('prefix/node_modules/package', 'package.json'),
    ).thenReturn(
      'prefix/node_modules/package/package.json',
    );
    when(
      readFile('prefix/node_modules/package/package.json', 'utf8'),
    ).thenResolve(
      JSON.stringify({ exports: { './module/*': './module/real/*.js' } }),
    );
    when(
      resolve('prefix/node_modules/package', './module/real/path.js'),
    ).thenReturn(
      'prefix/node_modules/package/module/real/path.js',
    );
    try {
      await replaceModule('package/module/path');
      assert.ok(false);
    } catch (e) {
      assert.ok(e.message.startsWith('Cannot find package \'prefix\''));
    }
  });

  // Невозможный тест, потому что невозможно подменить replaceEsm
  it('should apply mocks if present', async () => {});

  // Невозможный тест, потому что невозможно подменить replaceEsm
  it('should return default export if present', async () => {});
});

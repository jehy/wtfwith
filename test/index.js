'use strict';

/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const {assert} = require('chai');
const funcs = require('../lib');

const testPackage = require('./package');
const testPackageLock = require('./package-lock-v1');
const expected = require('./expected');

describe('Test with npm package file', () => {

  let deps;

  before(() => {
    deps = {
      dev: testPackage.devDependencies || {},
      direct: testPackage.devDependencies || {},
      bundle: testPackage.bundleDependencies || [],
    };
  });

  it('should correctly parse prod  deps with arg everything', () => {
    const options = {arg: 'everything'};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash', 'readable-stream', 'string_decoder', 'yallist']);
  });


  it('should correctly parse dev deps with no args', () => {
    const options = {arg: 'everything', showDev: true};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst,
      [
        'lodash',
        'semver',
        'kind-of',
        'string_decoder',
        'load-json-file',
        'lru-cache',
        'readable-stream',
        'resolve-from',
        'find-up',
        'source-map',
        'glob',
        'supports-color',
        'wordwrap',
        'yallist',
        'yargs',
        'define-property',
        'debug',
      ]);
  });


  it('should correctly parse prod deps with arg lodash', () => {
    const options = {arg: 'lodash'};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash']);
  });


  it('should correctly parse dev deps with arg lodash', () => {
    const options = {arg: 'lodash', showDev: true};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash']);
  });


  it('should correctly parse prod deps with arg "min"', () => {
    const options = {arg: 'everything', minSearch: 4};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash']);
  });


  it('should correctly parse dev deps with arg "min"', () => {
    const options = {arg: 'everything', showDev: true, minSearch: 4};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash', 'semver', 'kind-of']);
  });

  it('should be able to get some advices', () => {
    for (let i = 0; i < 1000; i++)
    {
      funcs.getAdvice('badModuleName', true);
      funcs.getAdvice('badModuleName', false);
    }
  });

  it('should be able to show modules info as text', () => {
    const options = {arg: 'everything', showDev: true, minSearch: 4};
    const {worst, unique} = funcs.processData(testPackageLock, deps, options);
    const res = funcs.getModulesInfoInner(worst, unique);
    assert.deepEqual(res, expected);
  });
});

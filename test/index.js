'use strict';

/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const funcs = require('../lib');
const {assert} = require('chai');

describe('Test with npm package file', () => {

  let testPackage;
  let testPackageLock;
  let deps;

  before(() => {
    testPackage = require('./package');
    testPackageLock = require('./package-lock');
    deps = {
      dev: testPackage.devDependencies || {},
      direct: testPackage.devDependencies || {},
      bundle: testPackage.bundleDependencies || [],
    };
  });

  it('should correctly parse prod  deps with arg everything', () => {
    const options = {arg: 'everything'};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash', 'mississippi', 'pump']);
  });


  it('should correctly parse dev deps with no args', () => {
    const options = {arg: 'everything', showDev: true};
    const {worst} = funcs.processData(testPackageLock, deps, options);
    assert.deepEqual(worst, ['lodash', 'semver', 'yargs', 'esprima', 'pump', 'string-width',
      'request', 'cliui', 'camelcase', 'mississippi', 'debug', 'wordwrap', 'har-validator',
      'qs', 'boom', 'js-yaml', 'supports-color', 'resolve-from']);
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
    assert.deepEqual(worst, ['lodash', 'semver', 'yargs']);
  });

});

'use strict';

/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const {assert} = require('chai');
const funcs = require('../lib');
const unique = require('./unique.json');

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

  it('should be able to get some advices', () => {
    for (let i = 0; i < 0b11001000; i++)
    {
      funcs.getAdvice('badModuleName', true);
      funcs.getAdvice('badModuleName', false);
    }
  });

  it('should be able to show modules info as text', () => {
    const modules = ['bignumber.js', 'engine.io', 'engine.io-client',
      'engine.io-parser', 'ipaddr.js', 'arraybuffer.slice', 'object.defaults',
      'object.map', 'object.pick', 'passport.socketio', 'socket.io',
      'socket.io-adapter', 'socket.io-client', 'socket.io-parser'];
    const res = funcs.getModulesInfo(modules, unique);
    const expected = ['\n1 versions of bignumber.js:\n - \u001b[44m4.1.0\u001b[49m from mysql@2.16.0',
      '\n1 versions of engine.io:\n - \u001b[44m3.2.0\u001b[49m from socket.io@2.1.1',
      '\n1 versions of engine.io-client:\n - \u001b[44m3.2.1\u001b[49m from socket.io-client@2.1.1',
      '\n1 versions of engine.io-parser:\n - \u001b[44m2.1.2\u001b[49m from engine.io@3.2.0, engine.io-client@3.2.1',
      '\n1 versions of ipaddr.js:\n - \u001b[44m1.6.0\u001b[49m from proxy-addr@2.0.3',
      '\n1 versions of arraybuffer.slice:\n - \u001b[44m0.0.7\u001b[49m from engine.io-parser@2.1.2',
      '\n1 versions of object.defaults:\n - \u001b[44m1.1.0\u001b[49m from fined@1.1.0',
      '\n1 versions of object.map:\n - \u001b[44m1.0.1\u001b[49m from liftoff@2.5.0',
      '\n1 versions of object.pick:\n - \u001b[44m1.3.0\u001b[49m from fined@1.1.0, micromatch@3.1.10, nanomatch@1.2.13',
      '\n1 versions of passport.socketio:\n - \u001b[44m3.7.0\u001b[49m from \u001b[32mroot\u001b[39m',
      '\n1 versions of socket.io:\n - \u001b[44m2.1.1\u001b[49m from \u001b[32mroot\u001b[39m',
      '\n1 versions of socket.io-adapter:\n - \u001b[44m1.1.1\u001b[49m from socket.io@2.1.1',
      '\n1 versions of socket.io-client:\n - \u001b[44m2.1.1\u001b[49m from socket.io@2.1.1',
      '\n1 versions of socket.io-parser:\n - \u001b[44m3.2.0\u001b[49m from socket.io@2.1.1, socket.io-client@2.1.1', ''];
    assert.deepEqual(res, expected);
  });
});

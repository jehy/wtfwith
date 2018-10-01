'use strict';

/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const {assert} = require('chai');
const funcs = require('../lib');

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
    const options = {arg: 'everything', showDev: true, minSearch: 4};
    const {worst, unique} = funcs.processData(testPackageLock, deps, options);
    const res = funcs.getModulesInfo(worst, unique);
    const expected = [
      '\n15 versions of lodash:\n - \u001b[44m3.10.1\u001b[49m from cli-table2@0.2.0'
      + '\n - \u001b[44m4.17.4\u001b[49m from eslint@2.2.0, inquirer@0.12.0, table@3.8.3, nyc@11.4.1, babel-generator@6.26.0,'
      + ' babel-template@6.26.0, babel-traverse@6.26.0, babel-types@6.26.0\n - \u001b[44mlodash._baseindexof:3.1.0\u001b[49m from'
      + ' \u001b[32mroot\u001b[39m\n - \u001b[44mlodash._baseuniq:4.6.0\u001b[49m from \u001b[32mroot\u001b[39m\n'
      + ' - \u001b[44mlodash._bindcallback:3.0.1\u001b[49m '
      + 'from \u001b[32mroot\u001b[39m\n - \u001b[44mlodash._cacheindexof:3.0.2\u001b[49m from'
      + ' \u001b[32mroot\u001b[39m\n - \u001b[44mlodash._createcache:3.1.2\u001b[49m from \u001b[32mroot\u001b[39m\n'
      + ' - \u001b[44mlodash._createset:4.0.3\u001b[49m from lodash._baseuniq@4.6.0\n - \u001b[44mlodash._getnative:3.9.1\u001b[49m from'
      + ' \u001b[32mroot\u001b[39m, lodash._createcache@3.1.2\n - \u001b[44mlodash._root:3.0.1\u001b[49m from lodash._baseuniq@4.6.0\n'
      + ' - \u001b[44mlodash.clonedeep:4.5.0\u001b[49m from \u001b[32mroot\u001b[39m\n - \u001b[44mlodash.restparam:3.6.1\u001b[49m from'
      + ' \u001b[32mroot\u001b[39m\n - \u001b[44mlodash.union:4.6.0\u001b[49m from'
      + ' \u001b[32mroot\u001b[39m\n - \u001b[44mlodash.uniq:4.5.0\u001b[49m from'
      + ' \u001b[32mroot\u001b[39m\n - \u001b[44mlodash.without:4.4.0\u001b[49m from \u001b[32mroot\u001b[39m',
      '\n4 versions of semver:\n - \u001b[44m4.3.6\u001b[49m from npm-registry-couchapp@2.7.1\n - \u001b[44m5.3.0\u001b[49m from'
      + ' node-gyp@3.6.2\n - \u001b[44m5.4.1\u001b[49m from nyc@11.4.1, istanbul-lib-instrument@1.9.1, normalize-package-data@2.4.0\n'
      + ' - \u001b[44m5.5.0\u001b[49m from \u001b[32mroot\u001b[39m, init-package-json@1.10.3, npm-package-arg@5.1.2, lock-verify@2.0.0,'
      + ' normalize-package-data@2.4.0, npm-install-checks@3.0.0, npm-package-arg@6.0.0, npm-registry-client@8.5.1,'
      + ' npm-pick-manifest@2.1.0, pacote@7.6.1, read-installed@4.0.3, package-json@4.0.1, semver-diff@2.1.0',
      '\n4 versions of yargs:\n - \u001b[44m10.0.3\u001b[49m from nyc@11.4.1\n - \u001b[44m11.0.0\u001b[49m from'
      + ' libnpx@10.0.1\n - \u001b[44m3.10.0\u001b[49m from uglify-js@2.8.29\n - \u001b[44m3.32.0\u001b[49m from tacks@1.2.6',
      '',
    ];
    assert.deepEqual(res, expected);
  });
});

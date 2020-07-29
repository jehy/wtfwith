/* eslint-disable import/no-extraneous-dependencies */

'use strict';

const {assert} = require('chai');
const funcs = require('../lib');

const testPackage = require('./package');
const testPackageLock1 = require('./package-lock-v1');
const testPackageLock2 = require('./package-lock-v2');
const expected1 = require('./expected');
const expected2 = require('./expected2');

const lockFiles = [testPackageLock1, testPackageLock2];
const expectedData = [expected1, expected2];
const testNames = ['old lock file format', 'new lock file format'];

describe('Test with npm package file', () => {

  let deps;

  before(() => {
    deps = {
      dev: testPackage.devDependencies || {},
      direct: testPackage.devDependencies || {},
      bundle: testPackage.bundleDependencies || [],
    };
  });

  for (let i = 0; i < 2; i++)
  {
    const expected = expectedData[i];
    const testPackageLock = lockFiles[i];
    const testTitle = testNames[i];
    // eslint-disable-next-line no-loop-func
    describe(testTitle, ()=>{

      it('should correctly parse prod  deps with arg everything', () => {
        const options = {arg: 'everything'};
        const {worst} = funcs.processData(testPackageLock, deps, options);
        assert.deepEqual(worst, ['readable-stream', 'string_decoder', 'yallist']);
      });

      it('should correctly parse dev deps with no args', () => {
        const options = {arg: 'everything', showDev: true};
        const {worst} = funcs.processData(testPackageLock, deps, options);
        assert.deepEqual(worst.sort(),
          [
            'semver',
            'kind-of',
            'find-up',
            'lru-cache',
            'yallist',
            'glob',
            'debug',
            'readable-stream',
            'string_decoder',
            'yargs',
            'load-json-file',
            'resolve-from',
            'supports-color',
            'source-map',
            'define-property',
            'wordwrap',
          ].sort());
      });

      it('should correctly parse prod deps with arg string_decoder', () => {
        const options = {arg: 'string_decoder'};
        const {worst} = funcs.processData(testPackageLock, deps, options);
        assert.deepEqual(worst, ['string_decoder']);
      });

      it('should correctly parse dev deps with arg semver', () => {
        const options = {arg: 'semver', showDev: true};
        const {worst} = funcs.processData(testPackageLock, deps, options);
        assert.deepEqual(worst, ['semver']);
      });

      it('should correctly parse prod deps with arg "min"', () => {
        const options = {arg: 'everything', minSearch: 3};
        const {worst} = funcs.processData(testPackageLock, deps, options);
        assert.deepEqual(worst, ['readable-stream', 'string_decoder', 'yallist']);
      });

      it('should correctly parse dev deps with arg "min"', () => {
        const options = {arg: 'everything', showDev: true, minSearch: 4};
        const {worst} = funcs.processData(testPackageLock, deps, options);
        assert.deepEqual(worst, ['semver', 'kind-of']);
      });

      it('should be able to get some advices', () => {
        for (let n = 0; n < 1000; n++)
        {
          const advice1 = funcs.getAdvice('badModuleName', true);
          const advice2 = funcs.getAdvice('badModuleName', false);
          const advice3 = funcs.getAdvice('everything', false);
          assert.isOk(advice1);
          assert.isOk(advice2);
          assert.isOk(advice3);
        }
      });

      it('should be able to show modules info as text', () => {
        const options = {arg: 'everything', showDev: true, minSearch: 4};
        const {worst, unique} = funcs.processData(testPackageLock, deps, options);
        const res = funcs.getModulesInfoInner(worst, unique);
        // console.log(JSON.stringify(res));
        assert.deepEqual(res, expected);
      });
    });
  }
});

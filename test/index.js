/* eslint-disable import/no-extraneous-dependencies */

'use strict';

const {assert} = require('chai');
const fs = require('fs');
const path = require('path');

const funcs = require('../lib');

describe('WtfWith', () => {

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

  const options = {minSearch: 3, arg: 'everything'};
  let worst;
  let data;
  it('should be able to process data', () => {
    const files = JSON.parse(fs.readFileSync(path.join(__dirname, './packageDataSample.json'), 'utf8'));
    const res = funcs.processData(files, options);
    worst = res.worst;
    data = res.data;
  });
  it('should be able to output data', () => {
    funcs.output(worst, data, options);
  });
});

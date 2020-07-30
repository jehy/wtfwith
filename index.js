#!/usr/bin/env node

'use strict';

const program = require('commander');
const {init, processData, output} = require('./lib.js');

program
  .usage('[moduleName] [options]')
  .version(require('./package.json').version)
  .option('-m, --min [min]', 'min deps for warning')
  .parse(process.argv);

const options = init(program);
const {worst, data} = processData(options);
output(worst, data, options);

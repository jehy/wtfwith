#!/usr/bin/env node

'use strict';

const program = require('commander');
const {init, processData, output} = require('./lib.js');

program
  .usage('[moduleName] [options]')
  .version(require('./package.json').version)
  .option('-d, --dev', 'show dev deps')
  .option('-m, --min [min]', 'min deps for warning')
  .parse(process.argv);

const {lockData, packageData, options} = init(program);
const {worst, unique} = processData(lockData, packageData, options);
output(worst, unique, options);

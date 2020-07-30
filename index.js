#!/usr/bin/env node

'use strict';

const program = require('commander');
const {init, processData, output, getPackageFiles} = require('./lib.js');

program
  .usage('[moduleName] [options]')
  .version(require('./package.json').version)
  .option('-m, --min [min]', 'min deps for warning')
  .parse(process.argv);

const options = init(program);
const allPackageFiles = getPackageFiles();
const {worst, data} = processData(allPackageFiles, options);
output(worst, data, options);

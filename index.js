#!/usr/bin/env node

'use strict';

const {init, processData, output} = require('./lib.js');
const program = require('commander');

let moduleArg;
program
  .usage('[moduleName] [options]')
  .version(require('./package.json').version)
  .option('-d, --dev', 'show dev deps')
  .option('-m, --min [min]', 'min deps for warning')
  .parse(process.argv);

const {lockFile, deps, options} = init(Object.assign(program, moduleArg));
const {worst, unique} = processData(lockFile, deps, options);
output(worst, unique, options);

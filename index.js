#!/usr/bin/env node

'use strict';

const {init, processData, output} = require('./lib.js');
const program = require('commander');

program
  .option('-d, --dev', 'show dev deps')
  .option('-m, --min', 'min deps for warning')
  .option('-T, --no-tests', 'ignore test hook')
  .parse(process.argv);

let searchFor = process.argv[2];
if (searchFor && searchFor.includes('--')) {
  searchFor = 'everything';
}

const {lockFile, deps, options} = init(Object.assign(program, {searchFor}));
const {worst, unique} = processData(lockFile, deps, options);
output(worst, unique, options);

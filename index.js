#!/usr/bin/env node

'use strict';

const {init, processData, output} = require('./lib.js');

const {lockFile, deps, options} = init();
const {worst, unique} = processData(lockFile, deps, options);
output(worst, unique, options);

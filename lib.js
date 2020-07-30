'use strict';

/* eslint-disable no-console */

const colors = require('colors/safe');
const crypto = require('crypto');
const debug = require('debug')('wtfwith');
const stringify = require('json-stringify-safe');
const glob = require('glob');
const fs = require('fs');
const advices = require('./advices');

const rootPackageName = 'root';
const minSearchDefault = 3;

function getAdvice(worst, good = true) {
  const currAdvices = good && advices.good || advices.bad;
  const randHex = crypto.randomBytes(4)
    .toString('hex');
  const randIndex = parseInt(randHex, 16) % (currAdvices.length);
  let advice = currAdvices[randIndex];
  if (worst && worst !== 'everything') {
    advice = advice.replace('XXX', worst);
  }
  else {
    advice = advice.replace('XXX', 'deps');
  }
  return advice;
}

/* istanbul ignore next */
function showAdvice(worst, good = true) {
  console.log(colors.magenta(`Advice: ${getAdvice(worst, good)}`));
}

/* istanbul ignore next */
function init(opts = {}) {
  debug(`commander parse result: ${stringify(opts, null, 3)}`);
  // debug(`commander opts events: ${JSON.stringify(opts.args)}`);

  let arg = opts.args[0];
  if (!arg || arg.includes('--')) {
    arg = 'everything';
  }

  let minSearch = opts.min || minSearchDefault;
  if (arg !== 'everything' && arg) {
    console.log(colors.yellow(`Searching for ${arg}`));
    minSearch = 1;
  }
  else {
    arg = 'everything';
    console.log(colors.yellow(`Searching modules which occur more then ${minSearch} times`));
  }

  const options = {arg, minSearch};
  debug(`Init options: ${stringify(options)}`);
  return options;
}

/* istanbul ignore next */
function getPackageFiles()
{
  return glob.sync('node_modules/**/package.json', process.cwd());
}

function processData(allPackageFiles, options) {
  const data = allPackageFiles.reduce((res, file)=>{
    const child = JSON.parse(fs.readFileSync(file, 'utf8'));
    let parent;
    const lastNodeModules = file.lastIndexOf('/node_modules/');
    if (lastNodeModules === -1)
    {
      parent = {name: rootPackageName, version: ''};
    }
    else {
      const parentPath = `${file.substr(0, lastNodeModules)}/package.json`;
      // console.log(`file ${file}`);
      // console.log(`parentPath ${parentPath}`);
      if (!fs.existsSync(parentPath))
      {
        if (!file.split('/').includes('test')) // some motherfuckers put package.json to test data
        {
          console.log(`smth possibly went wrong for ${file} parent`);
        }
        return res;
      }
      parent = JSON.parse(fs.readFileSync(parentPath, 'utf8'));
    }

    if (!res[child.name])
    {
      res[child.name] = {};
    }
    if (!res[child.name][child.version])
    {
      res[child.name][child.version] = [];
    }
    res[child.name][child.version].push(`${parent.name}@${parent.version}`);
    return res;
  }, {});
  if (!options.minSearch) {
    options.minSearch = minSearchDefault;
  }
  let worst = Object.keys(data)
    .filter(item => Object.keys(data[item]).length >= options.minSearch);
  if (options.arg !== 'everything') {
    worst = worst
      .filter(itemName => itemName.includes(options.arg));
  }
  return {worst, data};
}

/* istanbul ignore next */
function printModulesInfo(worst, data) {
  const sorted = Object.keys(data)
    .sort((a, b) => Object.keys(data[b]).length - Object.keys(data[a]).length);
  const toShow = worst.length ? sorted.filter(name=>worst.includes(name)) : sorted;
  const log = toShow.map(module=>{
    const versions = Object.keys(data[module]).map(version=>{
      return `${colors.bgBlue(version)} at ${data[module][version].join(', ')}`;
    });
    return (`\n${Object.keys(data[module]).length} versions of ${module}:\n - ${versions.join('\n - ')}`);
  }).concat('').join('\n');
  console.log(log);
}

/* istanbul ignore next */
function output(worst, data, options) {
  if (!worst.length) {
    console.log(colors.green('You are okay... for now'));
    if (options.arg !== 'everything') {
      printModulesInfo(worst, data);
    }
    showAdvice(options.arg, true);
    process.exit(0);
  }
  console.log(colors.red('Huston, we have a problem:'));
  printModulesInfo(worst, data);
  showAdvice(worst[0], false);
}

module.exports = {
  init,
  processData,
  output,
  getAdvice,
  printModulesInfo,
  getPackageFiles,
};

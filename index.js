'use strict';

/* eslint-disable no-console */

const colors = require('colors/safe');
const advices = require('./advices');
const crypto = require('crypto');

// detect packages which are broken to damn pieces
function getBaseName(pkg) {
  const baseNames = ['lodash', 'undescore'];
  const baseName = baseNames.find(item => pkg.includes(item));
  if (baseName) {
    return baseName;
  }
  return false;
}

function getDeps(obj) {
  const deps = obj.dependencies;
  if (!deps || !Object.keys(deps).length) {
    return [];
  }
  const directDeps = Object.keys(deps)
    .map((item) => {
      return {name: item, version: deps[item].version, dev: deps[item.dev]};
    })
    .filter(item => !item.dev);
  const childDeps = Object.keys(deps)
  // eslint-disable-next-line no-use-before-define
    .map(item => getAll(deps[item]))
    .reduce((res, item) => {
      return res.concat(item);
    }, []);
  return directDeps.concat(childDeps);
}

function getRequires(obj) {
  const deps = obj.requires;
  if (!deps || !Object.keys(deps).length) {
    return [];
  }
  return Object.keys(deps)
    .map((item) => {
      return {name: item, version: deps[item]};
    });
}

function getAll(obj) {
  return getDeps(obj).concat(getRequires(obj));
}

function getUniqueDeps(all) {
  return all.reduce((res, item) => {

    const searchName = getBaseName(item.name) || item.name;
    const version = (searchName === item.name && item.version || `${item.name}:${item.version}`);
    if (!res[searchName]) {
      res[searchName] = {count: 1, versions: [version]};
    }
    else if (!res[searchName].versions.includes(version)) {
      res[searchName].versions.push(version);
    }
    return res;
  }, {});
}

function showAdvice(arg, good = true) {
  const currAdvices = good && advices.good || advices.bad;
  const randHex = crypto.randomBytes(4)
    .toString('hex');
  const randIndex = parseInt(randHex, 16) % (currAdvices.length - 1);
  let advice = currAdvices[randIndex];
  if (arg && arg !== 'everything') {
    advice = advice.replace('XXX', arg);
  }
  console.log(colors.magenta(`Advice: ${advice}`));
}

let arg = process.argv[2];

if (arg !== 'everything' && arg) {
  console.log(colors.yellow(`Searching for ${arg}`));
}
else {
  arg = 'everything';
  console.log(colors.yellow('Searching all strange things...'));
}
let file;
try {
// eslint-disable-next-line global-require,import/no-dynamic-require
  file = require(`${process.cwd()}/package-lock.json`);
}
catch (e) {
  console.log(colors.red(`Failed to read package-lock file:\n${e}`));
  process.exit(0);
}

const all = getAll(file);
const unique = getUniqueDeps(all);
let worst = Object.keys(unique)
  .filter(item => unique[item].versions.length > 2)
  .sort((a, b) => unique[b].versions.length - unique[a].versions.length);
if (arg !== 'everything') {
  worst = worst
    .filter(itemName => itemName.includes(arg));
}
if (worst.length !== 0) {
  console.log(colors.red('Huston, we have a problem:'));
  worst
    .forEach((itemName) => {
      const item = unique[itemName];
      console.log(`\n${item.versions.length} versions of ${itemName}:\n - ${item.versions.sort().join('\n - ')}`);
    });
  console.log('');
  showAdvice(worst[0], false);
}
else {
  console.log(colors.green('You are okay... For now'));
  showAdvice(arg);
}

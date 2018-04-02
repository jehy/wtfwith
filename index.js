#!/usr/bin/env node

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
    .filter(item => !item.dev)
    .map((item) => {
      return {name: item, version: deps[item].version};
    });
  const childDeps = Object.keys(deps)
    .filter(item => !deps[item].dev)
  // eslint-disable-next-line no-use-before-define
    .map(item => getAll(deps[item], `${item}@${deps[item].version}`))
    .reduce((res, item) => {
      return res.concat(item);
    }, []);
  return directDeps.concat(childDeps);
}

function getRequires(obj, parentName) {
  const deps = obj.requires;
  if (!deps || !Object.keys(deps).length) {
    return [];
  }
  return Object.keys(deps)
    .map((item) => {
      return {name: item, version: deps[item], parent: parentName};
    });
}

function getAll(obj, item = 'main') {
  return getDeps(obj).concat(getRequires(obj, item));
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
    if (!item.parent) {
      return res;
    }
    res[searchName].parents = res[searchName].parents || {};
    res[searchName].parents[version] = res[searchName].parents[version] || [];
    res[searchName].parents[version].push(item.parent);

    return res;
  }, {});
}

function showAdvice(worst, good = true) {
  const currAdvices = good && advices.good || advices.bad;
  const randHex = crypto.randomBytes(4)
    .toString('hex');
  const randIndex = parseInt(randHex, 16) % (currAdvices.length - 1);
  let advice = currAdvices[randIndex];
  if (worst && worst !== 'everything') {
    advice = advice.replace('XXX', worst);
  }
  else
  {
    advice = advice.replace('XXX', 'deps');
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
  const path = `${process.cwd()}/package-lock.json`;
  console.log(colors.yellow(`Checking path ${path}`));
  // eslint-disable-next-line global-require,import/no-dynamic-require
  file = require(path);
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
      const versions = `${item.versions
        .sort()
        .map(((version) => {
          if (unique[itemName].parents && unique[itemName].parents[version]) {
            const parents = unique[itemName].parents[version]
              .filter((value, index, self) => self.indexOf(value) === index)
              .join(', ');
            return `${colors.bgBlue(version)} from ${parents}`;
          }
          return colors.bgBlue(version);
        }))
        .join('\n - ')}`;
      console.log(`\n${item.versions.length} versions of ${itemName}:\n - ${versions}`);
    });
  console.log('');
  showAdvice(worst[0], false);
}
else {
  console.log(colors.green('You are okay... For now'));
  showAdvice(arg);
}

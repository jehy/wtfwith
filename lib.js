'use strict';

/* eslint-disable no-console */

const colors = require('colors/safe');
const advices = require('./advices');
const crypto = require('crypto');
const semver = require('semver');

const rootPackageName = 'root';

// detect packages which are broken to damn pieces
function getBaseName(pkg) {
  const baseNames = ['lodash', 'underscore'];
  const baseName = baseNames.find(item => pkg.includes(item));
  if (baseName) {
    return baseName;
  }
  return false;
}

function getDeps(obj, parent, options) {
  const deps = obj.dependencies;
  if (!deps || !Object.keys(deps).length) {
    return [];
  }
  const directDeps = Object.keys(deps);
  const directDepsItems = directDeps.map((item) => {
    return {name: item, version: deps[item].version, parent, dev: deps[item].dev};
  });
  const childDeps = directDeps.map((item) => {
    const parentData = {name: item, version: deps[item].version, dev: deps[item].dev};
    // eslint-disable-next-line no-use-before-define
    return getAll(deps[item], parentData, options);
  })
    .reduce((res, item) => {
      return res.concat(item);
    }, []);
  return directDepsItems.concat(childDeps);
}

function getRequires(obj, parent, options) {
  if (obj.dev && !options.showDev) {
    return [];
  }
  const deps = obj.requires;
  if (!deps || !Object.keys(deps).length) {
    return [];
  }
  return Object.keys(deps)
    .map((item) => {
      return {name: item, version: deps[item], parent, dev: parent.dev};
    });
}

function getAll(obj, parent, options) {
  return getDeps(obj, parent, options).concat(getRequires(obj, parent, options));
}

function getUniqueDeps(all, deps, options) {
  return all.reduce((res, item) => {

    if (!options.showDev && item.dev) { // filter out dev deps
      return res;
    }
    const searchName = getBaseName(item.name) || item.name;
    const version = (searchName === item.name && item.version || `${item.name}:${item.version}`);
    if (!res[searchName]) {
      res[searchName] = {count: 1, versions: [version]};
    }
    else if (!res[searchName].versions.includes(version)) {
      res[searchName].versions.push(version);
    }
    res[searchName].parents = res[searchName].parents || {};
    res[searchName].parents[version] = res[searchName].parents[version] || [];
    if (item.parent.name === rootPackageName) {
      const isDirect = deps.direct[item.name] && semver.satisfies(item.version, deps.direct[item.name]);
      const isBundle = deps.bundle.includes(item.name);
      const isDev = deps.dev[item.name] && semver.satisfies(item.version, deps.dev[item.name]);
      if (!isBundle && !isDirect && !(options.showDev && isDev)) {
        return res;
      }
      res[searchName].parents[version].push(`${item.parent.name}`);
    }
    else {
      res[searchName].parents[version].push(`${item.parent.name}@${item.parent.version}`);
    }

    return res;
  }, {});
}

function showAdvice(worst, good = true) {
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
  console.log(colors.magenta(`Advice: ${advice}`));
}


/* istanbul ignore next */
function init() {
  let arg = process.argv[2];
  if (arg && arg.includes('--')) {
    arg = 'everything';
  }
  const showDev = process.argv.some(item => item === '--dev');
  if (arg !== 'everything' && arg) {
    console.log(colors.yellow(`Searching for ${arg}`));
  }
  else {
    arg = 'everything';
    console.log(colors.yellow('Searching all strange things...'));
  }
  let lockFile;
  try {
    const path = `${process.cwd()}/package-lock.json`;
    console.log(colors.yellow(`Checking path ${path}`));
    // eslint-disable-next-line global-require,import/no-dynamic-require
    lockFile = require(path);
  }
  catch (e) {
    console.log(colors.red(`Failed to read package-lock file:\n${e}`));
    process.exit(0);
  }

  const deps = {};
  try {
    const path = `${process.cwd()}/package.json`;
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const packageData = require(path);
    deps.direct = packageData.dependencies || {};
    deps.dev = packageData.devDependencies || {};
    deps.bundle = packageData.bundleDependencies || [];
  }
  catch (e) {
    console.log(colors.red(`Failed to read package file:\n${e}`));
    process.exit(0);
  }
  const options = {arg, showDev};
  return {lockFile, deps, options};
}

function processData(lockFile, deps, options) {
  const all = getAll(lockFile, {name: rootPackageName}, options);
  const unique = getUniqueDeps(all, deps, options);
  let worst = Object.keys(unique)
    .filter(item => unique[item].versions.length > 2)
    .sort((a, b) => unique[b].versions.length - unique[a].versions.length);
  if (options.arg !== 'everything') {
    worst = worst
      .filter(itemName => itemName.includes(options.arg));
  }
  return {worst, unique};
}

/* istanbul ignore next */
function output(worst, unique, options) {
  if (!worst.length) {
    console.log(colors.green('You are okay... for now'));
    showAdvice(options.arg, true);
    process.exit(0);
  }
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
              .map((parentName) => {
                if (parentName === rootPackageName) {
                  return colors.green(parentName);
                }
                return parentName;
              })
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

module.exports = {
  init, processData, output,
};

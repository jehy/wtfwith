'use strict';

/* eslint-disable no-console */

const colors = require('colors/safe');
const crypto = require('crypto');
const debug = require('debug')('wtfwith');
const {checkExactVersion} = require('check-exact');
const advices = require('./advices');
const semver = require('./semverCustom');

const rootPackageName = 'root';
const minSearchDefault = 3;

/* detect packages which are broken to damn pieces
function getBaseName(pkg) {
  const baseNames = ['lodash', 'underscore'];
  const baseName = baseNames.find(item => pkg.includes(item));
  if (baseName) {
    return baseName;
  }
  return false;
} */


function getRequires(obj, parent) {
  const deps = obj.requires;
  if (!deps || !Object.keys(deps).length) {
    return [];
  }
  return Object.keys(deps)
    .map((item) => {
      return {name: item, version: semver.clean(deps[item]), parent, dev: parent.dev};
    });
}

function getDeps(obj, parent, options) {
  const deps = obj.dependencies;
  const requires = getRequires(obj, parent, options);
  if (!deps || !Object.keys(deps).length) {
    return requires;
  }
  const directDepsItems = Object.keys(deps).reduce((res, item) => {
    const direct = {name: item, version: semver.clean(deps[item].version), parent, dev: deps[item].dev};
    if (!options.showDev && direct.dev) { // filter out dev deps
      return res;
    }
    const childDeps = getDeps(deps[item], direct, options);
    return res.concat(direct).concat(childDeps);
  }, []);
  return directDepsItems.concat(requires);
}

function getUniqueDeps(all, packageData) {
  return all.reduce((res, item) => {
    // const searchName = getBaseName(item.name) || item.name; TODO fix getBaseName
    const searchName = item.name; // replace with upper
    const version = (searchName === item.name && item.version || `${item.name}:${item.version}`);
    const isInstalledVersion = checkExactVersion(searchName, version, {log: [], result: true}).result;
    if (!res[searchName]) {
      res[searchName] = {installedVersions: [], requestedVersions: []};
    }

    if (isInstalledVersion && !res[searchName].installedVersions.includes(version))
    {
      res[searchName].installedVersions.push(version);
    }
    if (!res[searchName].requestedVersions.includes(version))
    {
      res[searchName].requestedVersions.push(version);
    }
    res[searchName].parents = res[searchName].parents || {};
    res[searchName].parents[version] = res[searchName].parents[version] || [];
    if (item.parent.name !== rootPackageName) {
      res[searchName].parents[version].push(`${item.parent.name}@${item.parent.version}`);
      return res;
    }
    const isDirect = packageData.direct[item.name] && semver.satisfies(item.version, packageData.direct[item.name]);
    const isBundle = packageData.bundle.includes(item.name);
    const isDev = packageData.dev[item.name] && semver.satisfies(item.version, packageData.dev[item.name]);

    if (isDirect || isBundle || isDev)
    {
      res[searchName].parents[version].push(rootPackageName);
      return res;
    }
    // it is some dependency's dependency and not root,
    const realParent = all.find(item2=>item !== item2 && item2.name === item.name && semver.satisfies(item.version, item2.version));
    if (!realParent || !realParent.parent) {
      /* istanbul ignore next */
      throw new Error(`Not found parent for ${JSON.stringify(item)}`);
    }
    res[searchName].parents[version].push(`${realParent.parent.name}@${realParent.parent.version}`);
    return res;
  }, {});
}

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
  debug(`commander parse result: ${JSON.stringify(opts, null, 3)}`);
  // debug(`commander opts events: ${JSON.stringify(opts.args)}`);

  let arg = opts.args[0];
  if (!arg || arg.includes('--')) {
    arg = 'everything';
  }

  const showDev = opts.dev;
  let minSearch = opts.min || minSearchDefault;
  if (arg !== 'everything' && arg) {
    console.log(colors.yellow(`Searching for ${arg}`));
    minSearch = 1;
  }
  else {
    arg = 'everything';
    console.log(colors.yellow(`Searching modules which occur more then ${minSearch} times`));
  }
  let lockData;
  try {
    const path = `${process.cwd()}/package-lock.json`;
    console.log(colors.yellow(`Checking path ${path}`));
    // eslint-disable-next-line global-require,import/no-dynamic-require
    lockData = require(path);
  }
  catch (e) {
    try {
      const path = `${process.cwd()}/npm-shrinkwrap.json`;
      console.log(colors.yellow(`Checking path ${path}`));
      // eslint-disable-next-line global-require,import/no-dynamic-require
      lockData = require(path);
    }
    catch (err) {
      console.log(colors.red(`Failed to read package-lock file:\n${e}`));
      process.exit(0);
    }
  }

  const packageData = {};
  try {
    const path = `${process.cwd()}/package.json`;
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const data = require(path);
    packageData.direct = data.dependencies || {};
    packageData.dev = data.devDependencies || {};
    packageData.bundle = data.bundleDependencies || [];
  }
  catch (e) {
    console.log(colors.red(`Failed to read package file:\n${e}`));
    process.exit(0);
  }
  const options = {arg, showDev, minSearch};
  debug(`Init options: ${JSON.stringify(options)}`);
  return {lockData, packageData, options};
}

function processData(lockData, packageData, options) {
  const all = getDeps(lockData, {name: rootPackageName}, options);
  const unique = getUniqueDeps(all, packageData, options);
  // console.log(JSON.stringify(unique));
  // process.exit(0);
  if (!options.minSearch) {
    options.minSearch = minSearchDefault;
  }
  let worst = Object.keys(unique)
    .filter(item => unique[item].installedVersions.length >= options.minSearch)
    .sort((a, b) => unique[b].installedVersions.length - unique[a].installedVersions.length);
  if (options.arg !== 'everything') {
    worst = worst
      .filter(itemName => itemName.includes(options.arg));
  }
  return {worst, unique};
}

function getModulesInfoInner(worst, unique) {
  // require('fs').writeFileSync('unique.json', JSON.stringify(unique, null, 2));
  return worst.map((itemName) => {
    const item = unique[itemName];
    const versions = item.installedVersions
      .sort()
      .map(((version) => {
        // console.log(`${itemName}@${version} exact ${exact}`);
        if (unique[itemName].parents && unique[itemName].parents[version]) {
          const parents = unique[itemName].parents[version]
            .filter((value, index, self) => self.indexOf(value) === index);
          return {version, parents};
        }
        /* istanbul ignore next */
        throw new Error(`No parents! Item: ${JSON.stringify(unique[itemName])}`);
        // return {version};
      }));
    const versionsWithRequested = versions.map((itemVersion)=>{
      const allCompatible = item.requestedVersions.filter(range=>semver.satisfies(itemVersion.version, range));
      // check if this installed version is max for requested

      const addRequested = allCompatible.filter((range)=>{
        const maxCompatibe = versions.reduce((res, ver)=>{
          const compatible = semver.satisfies(ver.version, range);
          const isMore = semver.gt(ver.version, res);
          if (compatible && isMore)
          {
            return ver.version;
          }
          return res;
        }, itemVersion.version);
        return maxCompatibe === itemVersion.version;
      });
      const allParents = addRequested.reduce((res, add)=>res.concat(unique[itemName].parents[add]), itemVersion.parents);
      const uniqueParents = allParents.filter((el, index, arr)=>arr.indexOf(el) === index);
      return Object.assign({}, itemVersion, {parents: uniqueParents});
    });
    return {itemName, item, versions: versionsWithRequested};
  });
}


/* istanbul ignore next */
function printModulesInfo(worst, unique) {
  const data = getModulesInfoInner(worst, unique);
  const toLog = data.map(({itemName, item, versions})=>{
    const versionsPrintable = versions.map((versionData)=>{
      const {version, parents} = versionData;
      const parentsPrintable = parents.map((parent)=>{
        const parentName = parent;
        if (parentName === rootPackageName)
        {
          return colors.green(parentName);
        }
        return parentName;
      });
      return `${colors.bgBlue(version)} from ${parentsPrintable.join(', ')}`;
    });
    return (`\n${item.installedVersions.length} versions of ${itemName}:\n - ${versionsPrintable.join('\n - ')}`);
  });
  console.log(toLog.concat('').join('\n'));
}

/* istanbul ignore next */
function output(worst, unique, options) {
  if (!worst.length) {
    console.log(colors.green('You are okay... for now'));
    if (options.arg !== 'everything') {
      printModulesInfo(worst, unique);
    }
    showAdvice(options.arg, true);
    process.exit(0);
  }
  console.log(colors.red('Huston, we have a problem:'));
  printModulesInfo(worst, unique);
  showAdvice(worst[0], false);
}

module.exports = {
  init,
  processData,
  output,
  getAdvice,
  getModulesInfoInner,
  printModulesInfo,
};

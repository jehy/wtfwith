'use strict';

const semver = require('semver');

function clean(version) {
  return semver.clean(version) || version; // semver.clean returns null on non-cleanable, so...
}

function satisfies(ver, range) {
  if (ver === range)// for really fucked up packages with github links
  {
    return true;
  }
  return semver.satisfies(ver, range);
}

function gt(a, b)
{
  if (a === b)
  {
    return false;
  }
  return semver.gt(a, b);
}
module.exports = {
  clean,
  satisfies,
  gt,
};

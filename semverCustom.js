'use strict';

const semver = require('semver');

class semverCustom extends semver {

  static clean(version) {
    return semver.clean(version) || version; // semver.clean returns null on non-cleanable, so...
  }

  static satisfies(ver, range) {
    if (ver === range)// for really fucked up packages with github links
    {
      return true;
    }
    return semver.satisfies(ver, range);
  }
}

module.exports = semverCustom;

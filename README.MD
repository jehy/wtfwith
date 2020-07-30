# WTF WITH
[![npm](https://img.shields.io/npm/v/wtfwith.svg)](https://npm.im/wtfwith)
[![license](https://img.shields.io/npm/l/wtfwith.svg)](https://npm.im/wtfwith)
[![Build Status](https://travis-ci.org/jehy/wtfwith.svg?branch=master)](https://travis-ci.org/jehy/wtfwith)
[![dependencies Status](https://david-dm.org/jehy/wtfwith/status.svg)](https://david-dm.org/jehy/wtfwith)
[![devDependencies Status](https://david-dm.org/jehy/wtfwith/dev-status.svg)](https://david-dm.org/jehy/wtfwith?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/jehy/wtfwith/badge.svg?branch=master)](https://coveralls.io/github/jehy/wtfwith?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jehy/wtfwith/badge.svg)](https://snyk.io/test/github/jehy/wtfwith)

`wtfwith` is a module we were all waiting for!

It checks your `node_modules` for repeated dependencies with different versions.

## Installation

Not required, use `npx`. Or run `npm i -g wtfwith` if you really want.

## Usage

1) Change to your project directory: `cd /your/project/dir`;

2) Check that you have `node_modules` there (or `run npm i`);

3) Run `npx wtfwith moduleName` or `npx wtfwith everything`!

4) Enjoy!

## More options

* You can use any module name, or my favorite command:
`npx wtfwith everything`!

* Use `npm prune` to check production-only deps.

* Use `--min x` option to check for more then `x` duplicates of dependencies.

## Live example

![live](https://github.com/jehy/wtfwith/raw/master/tty.gif)

## Changelog

* `3.0.0` Analyze `node_modules` instead of lock file. Much simpler, much better.
* `2.0.2` some fixes to show more deps
* `2.0.1` some fixes for broken semver and hardcore package locks
* `2.0.0` support for new npm lock format with loose deps
* `1.1.1`, `1.1.2`: some more tests and decomposition
* `1.1.0`: added support for `npm-shrinkwrap.json`
* `1.0.20`: many small fixes

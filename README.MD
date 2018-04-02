# WTF WITH

[![Build Status](https://travis-ci.org/jehy/wtfwith.svg?branch=master)](https://travis-ci.org/jehy/wtfwith)
[![dependencies Status](https://david-dm.org/jehy/wtfwith/status.svg)](https://david-dm.org/jehy/wtfwith)
[![devDependencies Status](https://david-dm.org/jehy/wtfwith/dev-status.svg)](https://david-dm.org/jehy/wtfwith?type=dev)

`wtfwith` is a module we were all waiting for!

It checks your `package-lock.json` for repeated dependencies with different versions.

## Installation

Not required. Or run `npm i -g wtfwith` if you really want.

## Usage

1)Change to your project directory: `cd /your/project/dir`;

2)Check that you have `package-lock.json` there (or `run npm i`);

3)Run `npx wtfwith moduleName` or `npx wtfwith everything`!

4)Enjoy!

## More options

You can use any module name, or my favorite command:
`npx wtfwith everything`!

## Live example

![live](https://github.com/jehy/wtfwith/raw/master/tty.gif)

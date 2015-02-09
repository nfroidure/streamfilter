# filterstream

`filterstream` is a function based filter for streams inspired per gulp-filter
 but no limited to Gulp nor to objectMode streams.

[![NPM version](https://badge.fury.io/js/filterstream.png)](https://npmjs.org/package/filterstream) [![Build status](https://secure.travis-ci.org/nfroidure/filterstream.png)](https://travis-ci.org/nfroidure/filterstream) [![Dependency Status](https://david-dm.org/nfroidure/filterstream.png)](https://david-dm.org/nfroidure/filterstream) [![devDependency Status](https://david-dm.org/nfroidure/filterstream/dev-status.png)](https://david-dm.org/nfroidure/filterstream#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/filterstream/badge.png?branch=master)](https://coveralls.io/r/nfroidure/filterstream?branch=master) [![Code Climate](https://codeclimate.com/github/nfroidure/filterstream.png)](https://codeclimate.com/github/nfroidure/filterstream)

## Installation

First install `filterstream` in you project:
```sh
npm install --save filterstream
```

## Getting started

There are 3 scenarios of use :

### Simple filter

```js
var FilterStream = require('filterstream');

var filter = new FilterStream(function(chunk, encoding, cb) {
  if(itmustbefiltered) {
    cb(true);
  } else {
    cb(false);
  }
});

// Print to stdout a filtered stdin
process.stdin
  .pipe(filter)
  .pipe(process.stdout);
```

### Filter and restore

```js
var FilterStream = require('filterstream');

var filter = new FilterStream(function(chunk, encoding, cb) {
    if(itmustbefiltered) {
      cb(true);
    } else {
      cb(false);
    }
}, {
  restore: true
});

// Print accepted chunks in stdout
filter.pipe(process.stdout);

// Print filtered one to stderr
filter.restore.pipe(process.stderr);
```

### Filter and restore as a passthrough stream
Let's be hype!

```js
var FilterStream = require('filterstream');

// Filter values
var filter = new FilterStream(function(chunk, encoding, cb) {
    if(itmustbefiltered) {
      cb(true);
    } else {
      cb(false);
    }
}, {
  restore: true,
  passthrough: true
});

// Pipe stdin
process.stdin.pipe(filter)
  // Edit kept chunks
  .pipe(mySuperTransformStream)
  // Restore filtered chunks
  .pipe(filter.restore)
  // and output!
  .pipe(process.stdout)
```

Note that in this case, this is *your* responsibility to end the restore stream
 by piping in another stream or ending him manually.

## API

### stream:Stream FilterStream(filterCallback:Function, options:Object)

Filter piped in streams according to the given `filterCallback`. Options are
 passed in as is in the various stream instances spawned by this module. So,
 to use the objectMode, simply pass in the `options.objectMode` value set to
 `true`.

#### options.restore
Set to `true`, this option create a readable stream allowing you to use the
 filtered chunks elsewhere. The restore stream is exposed in the `FilterStream`
 instance as a `restore` named property.

#### options.passthrough
Set to `true`, this option change the restore stream nature from a readable
 stream to a passthrough one, allowing you to reuse the filtered chunks in an
 existing pipeline.

## Contribute

Feel free to submit us your improvements. To do so, you must accept to publish
 your code under the MIT license.

To start contributing, first run the following to setup the development
 environment:
```sh
git clone git@github.com:nfroidure/filterstream.git
cd filterstream
npm install
```

Then, run the tests:
```sh
npm test
```

## Stats
[![NPM](https://nodei.co/npm/filterstream.png?downloads=true&stars=true)](https://nodei.co/npm/filterstream/)
[![NPM](https://nodei.co/npm-dl/filterstream.png)](https://nodei.co/npm/filterstream/)


[//]: # ( )
[//]: # (This file is automatically generated by a `metapak`)
[//]: # (module. Do not change it  except between the)
[//]: # (`content:start/end` flags, your changes would)
[//]: # (be overridden.)
[//]: # ( )
# streamfilter
> Filtering streams.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nfroidure/streamfilter/blob/main/LICENSE)


[//]: # (::contents:start)

`streamfilter` is a function based filter for streams inspired per gulp-filter
but no limited to Gulp nor to objectMode streams.

## Installation

First, install `streamfilter` in your project:

```sh
npm install --save streamfilter
```

## Getting started

There are 3 common usages:

### Simple filter

```js
import { StreamFilter } from 'streamfilter';

const filter = new StreamFilter((chunk, encoding, cb) => {
  const mustBeFiltered = chunk.length() > 128;

  if (mustBeFiltered) {
    cb(true);
    return;
  }
  cb(false);
});

// Print to stdout a filtered stdin
process.stdin.pipe(filter).pipe(process.stdout);
```

### Filter and restore

```js
import { filterStream } from 'streamfilter';

// Here we use the functional helper
const filter = filterStream(
  // Here we use an async callback instead
  async (chunk, encoding) => {
    const mustBeFiltered = chunk.length() > 128;

    if (await mustBeFiltered()) {
      return true;
    }
    return false;
  },
  {
    restore: true,
  },
);

// Print accepted chunks in stdout
filter.pipe(process.stdout);

// Print filtered one to stderr
filter.restore.pipe(process.stderr);
```

### Filter and restore as a passthrough stream

Let's reach total hype!

```js
import { StreamFilter } from 'streamfilter';
import { Transform } from 'stream';

// Filter values
const filter = new StreamFilter(
  (chunk, encoding, cb) => {
    const mustBeFiltered = chunk.length() > 128;
    if (mustBeFiltered) {
      cb(true);
      return;
    }
    cb(false);
  },
  {
    restore: true,
    passthrough: true,
  },
);

// Uppercase strings
const mySuperTransformStream = new Transform({
  transform: (chunk, encoding, cb) =>
    cb(null, Buffer.from(chunk.toString(encoding).toUpperCase(), encoding)),
});

// Pipe stdin
process.stdin
  .pipe(filter)
  // Edit kept chunks
  .pipe(mySuperTransformStream)
  // Restore filtered chunks
  .pipe(filter.restore)
  // and output!
  .pipe(process.stdout);
```

Note that in this case, this is _your_ responsibility to end the restore stream
by piping in another stream or ending it manually.

[//]: # (::contents:end)

# API
## Classes

<dl>
<dt><a href="#StreamFilter">StreamFilter</a></dt>
<dd><p>Filter piped in streams according to the given <code>filterCallback</code>.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#filterStream">filterStream(filterCallback, options)</a> ⇒</dt>
<dd><p>Utility function if you prefer a functional way of using this lib</p>
</dd>
</dl>

<a name="StreamFilter"></a>

## StreamFilter
Filter piped in streams according to the given `filterCallback`.

**Kind**: global class  
<a name="new_StreamFilter_new"></a>

### new StreamFilter(filterCallback, options)
Options are passed in as is in the various stream instances spawned by this
 module. So, to use the objectMode, simply pass in the `options.objectMode`
 value set to `true`.

**Returns**: [<code>StreamFilter</code>](#StreamFilter) - The filtering stream  

| Param | Type | Description |
| --- | --- | --- |
| filterCallback | <code>function</code> | Callback applying the filters |
| options | <code>Object</code> | Filtering options |
| options.passthrough | <code>boolean</code> | Set to `true`, this option changes the restore stream nature from a readable  stream to a passthrough one, allowing you to reuse the filtered chunks in an  existing pipeline. |
| options.restore | <code>boolean</code> | Set to `true`, this option create a readable stream allowing you to use the  filtered chunks elsewhere. The restore stream is exposed in the `FilterStream`  instance as a `restore` named property. |

<a name="filterStream"></a>

## filterStream(filterCallback, options) ⇒
Utility function if you prefer a functional way of using this lib

**Kind**: global function  
**Returns**: Stream  

| Param |
| --- |
| filterCallback | 
| options | 


# Authors
- [Nicolas Froidure](http://insertafter.com/en/index.html)

# License
[MIT](https://github.com/nfroidure/streamfilter/blob/main/LICENSE)

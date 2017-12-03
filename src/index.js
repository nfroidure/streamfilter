'use strict';

const stream = require('readable-stream');
const util = require('util');

/**
 * [StreamFilter description]
 * @param {Function} filterCallback    Callback applying the filters
 * @param {Object} options           Filtering options
 * @returns {Stream}                 The filtering stream
 */
function StreamFilter(filterCallback, options) {
  const _this = this;

  // Ensure new is called
  if (!(this instanceof StreamFilter)) {
    return new StreamFilter(filterCallback, options);
  }

  // filter callback is required
  if (!(filterCallback instanceof Function)) {
    throw new Error('filterCallback must be a function.');
  }

  // Manage options
  options = options || {};
  options.restore = options.restore || false;
  options.passthrough = (options.restore && options.passthrough) || false;

  this._filterStreamEnded = false;
  this._restoreStreamCallback = null;

  this._transform = function streamFilterTransform(chunk, encoding, done) {
    filterCallback(chunk, encoding, function StreamFilterCallback(filter) {
      if (!filter) {
        _this.push(chunk, encoding);
        done();
        return;
      }
      if (options.restore) {
        _this._restoreManager.programPush(chunk, encoding, () => {
          done();
        });
        return;
      }
      done();
    });
  };

  this._flush = function streamFilterFlush(done) {
    this._filterStreamEnded = true;
    done(); // eslint-disable-line
    if (options.restore) {
      if (!options.passthrough) {
        this._restoreManager.programPush(null, {}.undef, () => {
          done();
        });
      } else if (this._restoreStreamCallback) {
        this._restoreStreamCallback();
      }
    }
  };

  stream.Transform.call(this, options);

  // Creating the restored stream if necessary
  if (options.restore) {
    if (options.passthrough) {
      this.restore = new stream.Duplex(options);
      this._restoreManager = createReadStreamBackpressureManager(this.restore);
      this.restore._write = function streamFilterRestoreWrite(
        chunk,
        encoding,
        done
      ) {
        _this._restoreManager.programPush(chunk, encoding, done);
      };

      this.restore.on('finish', function streamFilterRestoreFinish() {
        _this._restoreStreamCallback = () => {
          _this._restoreManager.programPush(null, {}.undef, () => {});
        };
        if (_this._filterStreamEnded) {
          _this._restoreStreamCallback();
        }
      });
    } else {
      this.restore = new stream.Readable(options);
      this._restoreManager = createReadStreamBackpressureManager(this.restore);
    }
  }
}

util.inherits(StreamFilter, stream.Transform);

// Utils to manage readable stream backpressure
function createReadStreamBackpressureManager(readableStream) {
  const manager = {
    waitPush: true,
    programmedPushs: [],
    programPush: function programPush(chunk, encoding, done) {
      // Store the current write
      manager.programmedPushs.push([chunk, encoding, done]);
      // Need to be async to avoid nested push attempts
      // Programm a push attempt
      setImmediate(manager.attemptPush);
      // Let's say we're ready for a read
      readableStream.emit('readable');
      readableStream.emit('drain');
    },
    attemptPush: function attemptPush() {
      let nextPush;

      if (manager.waitPush) {
        if (manager.programmedPushs.length) {
          nextPush = manager.programmedPushs.shift();
          manager.waitPush = readableStream.push(nextPush[0], nextPush[1]);
          nextPush[2]();
        }
      } else {
        setImmediate(() => {
          // Need to be async to avoid nested push attempts
          readableStream.emit('readable');
        });
      }
    },
  };

  // Patch the readable stream to manage reads
  readableStream._read = function streamFilterRestoreRead() {
    manager.waitPush = true;
    // Need to be async to avoid nested push attempts
    setImmediate(manager.attemptPush);
  };

  return manager;
}

module.exports = StreamFilter;

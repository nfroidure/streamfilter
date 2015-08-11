'use strict';

var stream = require('readable-stream');
var util = require('util');

function StreamFilter(filterCallback, options) {
  var _this = this;

  // Ensure new is called
  if(!(this instanceof StreamFilter)) {
    return new StreamFilter(filterCallback, options);
  }

  // filter callback is required
  if(!(filterCallback instanceof Function)) {
    throw new Error('filterCallback must be a function.');
  }

  // Manage options
  options = options || {};
  options.restore = options.restore || false;
  options.passthrough = options.restore && options.passthrough || false;

  this._filterStreamEnded = false;
  this._restoreStreamCallback = null;

  this._transform = function streamFilterTransform(chunk, encoding, done) {
    filterCallback(chunk, encoding, function StreamFilterCallback(filter) {
      if(!filter) {
        _this.push(chunk, encoding);
        done();
      } else if(options.restore) {
        if(options.passthrough) {
          _this.restore.write(chunk, encoding, done);
        } else {
          _this.restore.__programPush(chunk, encoding, function() {
            done();
          });
        }
      } else {
        done();
      }
    });
  };

  this._flush = function streamFilterFlush(done) {
    this._filterStreamEnded = true;
    done();
    if(options.restore) {
      if(!options.passthrough) {
        this.restore.push(null);
      } else if(this._restoreStreamCallback) {
        this._restoreStreamCallback();
      }
    }
  };

  stream.Transform.call(this, options);

  // Creating the restored stream if necessary
  if(options.restore) {
    if(options.passthrough) {
      this.restore = new stream.Transform(options);

      this.restore._transform = function streamFilterRestoreTransform(chunk, encoding, done) {
        _this.restore.push(chunk, encoding);
        done();
      };

      this.restore._flush = function streamFilterRestoreFlush(done) {
        _this._restoreStreamCallback = done;
        if(_this._filterStreamEnded) {
          done();
        }
      };
    } else {
      this.restore = new stream.Readable(options);
      this.restore.__waitPush = true;
      this.restore.__programmedPush = null;

      this.restore.__programPush = function streamFilterRestoreProgramPush(chunk, encoding, done) {
        if(_this.restore.__programmedPush) {
          _this.restore.emit('error', new Error('Not supposed to happen!'));
        }
        _this.restore.__programmedPush = [chunk, encoding, done];
        // Need to be async to avoid nested push attempts
        setImmediate(_this.restore.__attemptPush.bind(_this.restore));
        _this.restore.emit('readable');
        _this.restore.emit('drain');
      };

      this.restore.__attemptPush = function streamFilterRestoreAttemptPush() {
        var cb = null;

        if(_this.restore.__waitPush) {
          if(_this.restore.__programmedPush) {
            cb = _this.restore.__programmedPush[2];
            _this.restore.__waitPush = _this.restore.push(
              _this.restore.__programmedPush[0],
              _this.restore.__programmedPush[1]
            );
            _this.restore.__programmedPush = null;
            cb();
          }
        } else {
          setImmediate(function() {
            // Need to be async to avoid nested push attempts
            _this.restore.emit('readable');
          });
        }
      };

      this.restore._read = function streamFilterRestoreRead() {
        _this.restore.__waitPush = true;
        // Need to be async to avoid nested push attempts
        setImmediate(_this.restore.__attemptPush.bind(this));
      };
    }
  }
}

util.inherits(StreamFilter, stream.Transform);

module.exports = StreamFilter;

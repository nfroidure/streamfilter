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
  
  this._transform = function(chunk, encoding, done) {
    filterCallback(chunk, encoding, function StreamFilterCallback(filter) {
      if(!filter) {
        _this.push(chunk, encoding);
      } else if(_this.restore) {
        _this.restore.push(chunk);
      }
      done();
    });
  };

  this._flush = function(done) {
    this._filterStreamEnded = true;
    done();
    if(options.restore && !options.passthrough) {
      this.restore.end();
    }
    if(options.restore && this._restoreStreamCallback) {
      this._restoreStreamCallback();
    }
  };

  stream.Transform.call(this, options);

  if(options.restore) {
    this.restore = new stream.Transform(options);

    this.restore._transform = function(chunk, encoding, done) {
      _this.restore.push(chunk);
      done();
    };

    this.restore._flush = function(done) {
      _this._restoreStreamCallback = done;
      if(_this._filterStreamEnded) {
        done();
      }
    };
  }
}

util.inherits(StreamFilter, stream.Transform);

module.exports = StreamFilter;


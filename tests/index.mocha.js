var assert = require('assert');
var StreamTest = require('streamtest');
var StreamFilter = require('../src/index');

describe('StreamFilter', function () {

  describe('should fail', function () {

    it('if options.filter is not a function', function() {
      assert.throws(function() {
        new StreamFilter();
      });
    }, /Error/);

  });
  
  // Iterating through versions
  StreamTest.versions.forEach(function(version) {

    describe('for ' + version + ' streams', function() {

      describe('in object mode', function () {

        describe('should work', function () {
          var object1 = {test: 'plop'};
          var object2 = {test: 'plop2'};
          var object3 = {test: 'plop3'};

          it('with no restore option', function(done) {
            var inputStream = StreamTest[version].fromObjects([object1, object2]);
            var filter = new StreamFilter(function(chunk, encoding, cb) {
              if(chunk == object2) {
                return cb(true);
              }
              return cb(false);
            }, {
              objectMode: true
            });
            var outputStream = StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(objs, [object1]);
              done();
            });
            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore option', function(done) {
            var inputStream = StreamTest[version].fromObjects([object1, object2]);
            var filter = new StreamFilter(function(chunk, encoding, cb) {
              if(chunk == object2) {
                return cb(true);
              }
              return cb(false);
            }, {
              objectMode: true,
              restore: true
            });
            var outputStream = StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(objs, [object1]);
              filter.restore.pipe(StreamTest[version].toObjects(function(err, objs) {
                if(err) {
                  return done(err);
                }
                assert.deepEqual(objs, [object2]);
                done();
              }));
            });
            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore and passthrough option', function(done) {
            var inputStream = StreamTest[version].fromObjects([object1, object2]);
            var filter = new StreamFilter(function(chunk, encoding, cb) {
              if(chunk == object2) {
                return cb(true);
              }
              return cb(false);
            }, {
              objectMode: true,
              restore: true,
              passthrough: true
            });
            var outputStream = StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(objs, [object1]);
              filter.restore.pipe(StreamTest[version].toObjects(function(err, objs) {
                if(err) {
                  return done(err);
                }
                assert.deepEqual(objs, [object3, object2]);
                done();
              }));
            });
            var restoreInputStream = StreamTest[version].fromObjects([object3]);
            inputStream.pipe(filter).pipe(outputStream);
            restoreInputStream.pipe(filter.restore);
          });

        });

      });

      describe('in buffer mode', function () {

        describe('should work', function () {
          var buffer1 = Buffer('plop');
          var buffer2 = Buffer('plop2');
          var buffer3 = Buffer('plop3');

          it('with no restore option', function(done) {
            var inputStream = StreamTest[version].fromChunks([buffer1, buffer2]);
            var filter = new StreamFilter(function(chunk, encoding, cb) {
              if(chunk == buffer1) {
                return cb(true);
              }
              return cb(false);
            });
            var outputStream = StreamTest[version].toText(function(err, text) {
              if(err) {
                return done(err);
              }
              assert.equal(text, buffer2.toString());
              done();
            });
            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore option', function(done) {
            var inputStream = StreamTest[version].fromChunks([buffer1, buffer2]);
            var filter = new StreamFilter(function(chunk, encoding, cb) {
              if(chunk == buffer2) {
                return cb(true);
              }
              return cb(false);
            }, {
              restore: true
            });
            var outputStream = StreamTest[version].toText(function(err, text) {
              if(err) {
                return done(err);
              }
              assert.equal(text, buffer1.toString());
              filter.restore.pipe(StreamTest[version].toText(function(err, text) {
                if(err) {
                  return done(err);
                }
                assert.equal(text, buffer2.toString());
                done();
              }));
            });
            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore and passthrough option', function(done) {
            var inputStream = StreamTest[version].fromChunks([buffer1, buffer2]);
            var filter = new StreamFilter(function(chunk, encoding, cb) {
              if(chunk == buffer2) {
                return cb(true);
              }
              return cb(false);
            }, {
              restore: true,
              passthrough: true
            });
            var outputStream = StreamTest[version].toText(function(err, text) {
              if(err) {
                return done(err);
              }
              assert.equal(text, buffer1.toString());
              filter.restore.pipe(StreamTest[version].toText(function(err, text) {
                if(err) {
                  return done(err);
                }
                assert.deepEqual(text, [buffer3.toString(), buffer2.toString()].join(''));
                done();
              }));
            });
            var restoreInputStream = StreamTest[version].fromChunks([buffer3]);
            inputStream.pipe(filter).pipe(outputStream);
            restoreInputStream.pipe(filter.restore);
          });

        });

      });

    });

  });

});


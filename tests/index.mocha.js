/* eslint max-nested-callbacks:[0], no-magic-numbers:[0] */
'use strict';

const assert = require('assert');
const Stream = require('stream');
const StreamTest = require('streamtest');
const StreamFilter = require('../src/index');

describe('StreamFilter', () => {
  describe('should fail', () => {
    it(
      'if options.filter is not a function',
      () => {
        assert.throws(() => {
          new StreamFilter(); // eslint-disable-line
        });
      },
      /Error/
    );
  });

  describe('should work', () => {
    it('should work without new', () => {
      const createFilter = StreamFilter;

      assert(createFilter(() => {}) instanceof StreamFilter);
    });
  });

  // Iterating through versions
  StreamTest.versions.forEach(version => {
    describe('for ' + version + ' streams', () => {
      describe('in object mode', () => {
        describe('should work', () => {
          const object1 = { test: 'plop' };
          const object2 = { test: 'plop2' };
          const object3 = { test: 'plop3' };

          it('with no restore option', done => {
            const inputStream = StreamTest[version].fromObjects([
              object1,
              object2,
            ]);
            const filter = new StreamFilter(
              (obj, unused, cb) => {
                if (obj === object2) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                objectMode: true,
              }
            );
            const outputStream = StreamTest[version].toObjects((err, objs) => {
              if (err) {
                done(err);
                return;
              }
              assert.deepEqual(objs, [object1]);
              done();
            });

            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore option', done => {
            const inputStream = StreamTest[version].fromObjects([
              object1,
              object2,
            ]);
            const filter = new StreamFilter(
              (obj, unused, cb) => {
                if (obj === object2) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                objectMode: true,
                restore: true,
              }
            );
            const outputStream = StreamTest[version].toObjects((err, objs) => {
              if (err) {
                done(err);
                return;
              }
              assert.deepEqual(objs, [object1]);
              filter.restore.pipe(
                StreamTest[version].toObjects((err2, objs2) => {
                  if (err2) {
                    done(err2);
                    return;
                  }
                  assert.deepEqual(objs2, [object2]);
                  done();
                })
              );
            });

            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore option and more than 16 nested objects', done => {
            let nDone = 0;
            const inputStream = StreamTest[version].fromObjects([
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
              object1,
              object2,
            ]);
            const filter = new StreamFilter(
              (obj, unused, cb) => {
                if (obj === object2) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                objectMode: true,
                restore: true,
              }
            );
            const outputStream = StreamTest[version].toObjects((err, objs) => {
              if (err) {
                done(err);
                return;
              }
              assert.equal(objs.length, 32);
              if (2 === ++nDone) {
                done();
                return;
              }
            });

            filter.restore.pipe(
              StreamTest[version].toObjects((err2, objs2) => {
                if (err2) {
                  done(err2);
                  return;
                }
                assert.equal(objs2.length, 32);
                if (2 === ++nDone) {
                  done();
                  return;
                }
              })
            );

            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore option and more than 16 objects', done => {
            let nDone = 0;
            const inputStream = StreamTest[version].fromObjects([
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object1,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
              object2,
            ]);
            const filter = new StreamFilter(
              (obj, unused, cb) => {
                if (obj === object2) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                objectMode: true,
                restore: true,
              }
            );
            const outputStream = StreamTest[version].toObjects((err, objs) => {
              if (err) {
                done(err);
                return;
              }
              assert.equal(objs.length, 24);
              if (2 === ++nDone) {
                done();
                return;
              }
            });

            filter.restore.pipe(
              StreamTest[version].toObjects((err2, objs2) => {
                if (err2) {
                  done(err2);
                  return;
                }
                assert.equal(objs2.length, 24);
                if (2 === ++nDone) {
                  done();
                  return;
                }
              })
            );

            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore and passthrough option in a different pipeline', done => {
            const inputStream = StreamTest[version].fromObjects([
              object1,
              object2,
            ]);
            const filter = new StreamFilter(
              (obj, unused, cb) => {
                if (obj === object2) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                objectMode: true,
                restore: true,
                passthrough: true,
              }
            );
            const outputStream = StreamTest[version].toObjects((err, objs) => {
              if (err) {
                done(err);
                return;
              }
              assert.deepEqual(objs, [object1]);
              filter.restore.pipe(
                StreamTest[version].toObjects((err2, objs2) => {
                  if (err2) {
                    done(err2);
                    return;
                  }
                  assert.deepEqual(objs2, [object3, object2]);
                  done();
                })
              );
            });
            const restoreInputStream = StreamTest[version].fromObjects([
              object3,
            ]);

            inputStream.pipe(filter).pipe(outputStream);
            restoreInputStream.pipe(filter.restore);
          });

          it('with restore and passthrough option in the same pipeline', done => {
            let passThroughStream1Ended = false;
            let passThroughStream2Ended = false;
            let duplexStreamEnded = false;
            const inputStream = StreamTest[version].fromObjects([
              object1,
              object2,
              object3,
            ]);
            const filter = new StreamFilter(
              (chunk, encoding, cb) => {
                if (chunk === object2) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                objectMode: true,
                restore: true,
                passthrough: true,
              }
            );
            const outputStream = StreamTest[version].toObjects((err, objs) => {
              if (err) {
                done(err);
                return;
              }
              assert.deepEqual(objs, [object1, object2, object3]);
              setImmediate(done);
            });
            const duplexStream = new Stream.Duplex({ objectMode: true });

            duplexStream._write = (obj, unused, cb) => {
              duplexStream.push(obj);
              setImmediate(cb);
            };
            duplexStream._read = () => {};
            duplexStream.on('finish', () => {
              setTimeout(() => {
                duplexStream.push(null);
              }, 100);
            });
            outputStream.on('end', () => {
              assert(
                passThroughStream1Ended,
                'PassThrough stream ends before the output one.'
              );
              assert(
                passThroughStream2Ended,
                'PassThrough stream ends before the output one.'
              );
              assert(
                duplexStreamEnded,
                'Duplex stream ends before the output one.'
              );
            });
            filter.restore.on('end', () => {
              assert(
                passThroughStream1Ended,
                'PassThrough stream ends before the restore one.'
              );
              assert(
                passThroughStream2Ended,
                'PassThrough stream ends before the restore one.'
              );
              assert(
                duplexStreamEnded,
                'Duplex stream ends before the restore one.'
              );
            });
            inputStream
              .pipe(filter)
              .pipe(new Stream.PassThrough({ objectMode: true }))
              .on('end', () => {
                passThroughStream1Ended = true;
              })
              .pipe(new Stream.PassThrough({ objectMode: true }))
              .on('end', () => {
                passThroughStream2Ended = true;
              })
              .pipe(duplexStream)
              .on('end', () => {
                duplexStreamEnded = true;
              })
              .pipe(filter.restore)
              .pipe(outputStream);
          });

          it(
            'with restore and passthrough option in the same' +
              ' pipeline and a buffered stream',
            done => {
              let passThroughStream1Ended = false;
              let passThroughStream2Ended = false;
              let duplexStreamEnded = false;
              const inputStream = StreamTest[version].fromObjects([
                object1,
                object2,
                object3,
              ]);
              const filter = new StreamFilter(
                (chunk, encoding, cb) => {
                  if (chunk === object2) {
                    return cb(true);
                  }
                  return cb(false);
                },
                {
                  objectMode: true,
                  restore: true,
                  passthrough: true,
                }
              );
              const outputStream = StreamTest[version].toObjects(
                (err, objs) => {
                  if (err) {
                    done(err);
                    return;
                  }
                  assert.equal(objs.length, 3);
                  setImmediate(done);
                }
              );
              const duplexStream = new Stream.Duplex({ objectMode: true });

              duplexStream._objs = [];
              duplexStream._write = (obj, unused, cb) => {
                duplexStream._objs.push(obj);
                cb();
              };
              duplexStream._read = () => {
                let obj;

                if (duplexStream._hasFinished) {
                  while (duplexStream._objs.length) {
                    obj = duplexStream._objs.shift();
                    if (!duplexStream.push(obj)) {
                      break;
                    }
                  }
                  if (0 === duplexStream._objs.length) {
                    duplexStream.push(null);
                  }
                }
              };
              duplexStream.on('finish', () => {
                duplexStream._hasFinished = true;
                duplexStream._read();
              });
              outputStream.on('end', () => {
                assert(
                  passThroughStream1Ended,
                  'PassThrough stream ends before the output one.'
                );
                assert(
                  passThroughStream2Ended,
                  'PassThrough stream ends before the output one.'
                );
                assert(
                  duplexStreamEnded,
                  'Duplex stream ends before the output one.'
                );
              });
              filter.restore.on('end', () => {
                assert(
                  passThroughStream1Ended,
                  'PassThrough stream ends before the restore one.'
                );
                assert(
                  passThroughStream2Ended,
                  'PassThrough stream ends before the restore one.'
                );
                assert(
                  duplexStreamEnded,
                  'Duplex stream ends before the restore one.'
                );
              });
              inputStream
                .pipe(filter)
                .pipe(new Stream.PassThrough({ objectMode: true }))
                .on('end', () => {
                  passThroughStream1Ended = true;
                })
                .pipe(new Stream.PassThrough({ objectMode: true }))
                .on('end', () => {
                  passThroughStream2Ended = true;
                })
                .pipe(duplexStream)
                .on('end', () => {
                  duplexStreamEnded = true;
                })
                .pipe(filter.restore)
                .pipe(outputStream);
            }
          );
        });
      });

      describe('in buffer mode', () => {
        describe('should work', () => {
          const buffer1 = new Buffer('plop');
          const buffer2 = new Buffer('plop2');
          const buffer3 = new Buffer('plop3');

          it('with no restore option', done => {
            const inputStream = StreamTest[version].fromChunks([
              buffer1,
              buffer2,
            ]);
            const filter = new StreamFilter((chunk, encoding, cb) => {
              if (chunk.toString() === buffer1.toString()) {
                return cb(true);
              }
              return cb(false);
            });
            const outputStream = StreamTest[version].toText((err, text) => {
              if (err) {
                done(err);
                return;
              }
              assert.equal(text, buffer2.toString());
              done();
            });

            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore option', done => {
            const inputStream = StreamTest[version].fromChunks([
              buffer1,
              buffer2,
            ]);
            const filter = new StreamFilter(
              (chunk, encoding, cb) => {
                if (chunk.toString() === buffer2.toString()) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                restore: true,
              }
            );
            const outputStream = StreamTest[version].toText((err, text) => {
              if (err) {
                done(err);
                return;
              }
              assert.equal(text, buffer1.toString());
              filter.restore.pipe(
                StreamTest[version].toText((err2, text2) => {
                  if (err2) {
                    done(err2);
                    return;
                  }
                  assert.equal(text2, buffer2.toString());
                  done();
                })
              );
            });

            inputStream.pipe(filter).pipe(outputStream);
          });

          it('with restore and passthrough option', done => {
            const inputStream = StreamTest[version].fromChunks([
              buffer1,
              buffer2,
            ]);
            const filter = new StreamFilter(
              (chunk, encoding, cb) => {
                if (chunk.toString() === buffer2.toString()) {
                  return cb(true);
                }
                return cb(false);
              },
              {
                restore: true,
                passthrough: true,
              }
            );
            const outputStream = StreamTest[version].toText((err, text) => {
              if (err) {
                done(err);
                return;
              }
              assert.equal(text, buffer1.toString());
              filter.restore.pipe(
                StreamTest[version].toText((err2, text2) => {
                  if (err2) {
                    done(err2);
                    return;
                  }
                  assert.deepEqual(
                    text2,
                    [buffer3.toString(), buffer2.toString()].join('')
                  );
                  done();
                })
              );
            });
            const restoreInputStream = StreamTest[version].fromChunks([
              buffer3,
            ]);

            inputStream.pipe(filter).pipe(outputStream);
            restoreInputStream.pipe(filter.restore);
          });
        });
      });
    });
  });
});

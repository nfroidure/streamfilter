import { describe, test, expect } from '@jest/globals';
import assert from 'assert';
import Stream from 'stream';
import StreamTest from 'streamtest';
import { StreamFilter, filterStream } from './index.js';
import { YError } from 'yerror';

describe('StreamFilter', () => {
  describe('should fail', () => {
    test('if options.filter is not a function', () => {
      try {
        // ts-ignore-next-line
        new StreamFilter(undefined as any); // eslint-disable-line
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect((err as YError).code).toEqual('E_BAD_FILTER_CALLBACK');
      }
    });
  });

  describe('should work', () => {
    test('should work without new', () => {
      assert(filterStream(() => {}) instanceof StreamFilter);
    });
  });

  describe('in object mode', () => {
    describe('should work', () => {
      const object1 = { test: 'plop' };
      const object2 = { test: 'plop2' };
      const object3 = { test: 'plop3' };

      test('with no restore option', async () => {
        const inputStream = StreamTest.fromObjects([object1, object2]);
        const filter = new StreamFilter(
          (obj: { test: string }, _unused, cb) => {
            if (obj === object2) {
              return cb(true);
            }
            return cb(false);
          },
          {
            objectMode: true,
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();

        inputStream.pipe(filter).pipe(outputStream);

        assert.deepEqual(await resultPromise, [object1]);
      });

      test('with no restore option ans an async filter callback', async () => {
        const inputStream = StreamTest.fromObjects([object1, object2]);
        const filter = new StreamFilter(
          async (obj: { test: string }) => {
            if (obj === object2) {
              return true;
            }
            return false;
          },
          {
            objectMode: true,
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();

        inputStream.pipe(filter).pipe(outputStream);

        assert.deepEqual(await resultPromise, [object1]);
      });

      test('with restore option', async () => {
        const inputStream = StreamTest.fromObjects([object1, object2]);
        const filter = new StreamFilter(
          (obj: { test: string }, _unused, cb) => {
            if (obj === object2) {
              return cb(true);
            }
            return cb(false);
          },
          {
            objectMode: true,
            restore: true,
          },
        );

        const [outputStream, resultPromise] = StreamTest.toObjects();
        const [restoreOutputStream, restoreResultPromise] =
          StreamTest.toObjects();

        inputStream.pipe(filter).pipe(outputStream);
        filter.restore.pipe(restoreOutputStream);

        assert.deepEqual(await resultPromise, [object1]);
        assert.deepEqual(await restoreResultPromise, [object2]);

        inputStream.pipe(filter).pipe(outputStream);
      });

      test('with restore option and more than 16 nested objects', async () => {
        const inputStream = StreamTest.fromObjects([
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
          (obj: { test: string }, _unused, cb) => {
            if (obj === object2) {
              return cb(true);
            }
            return cb(false);
          },
          {
            objectMode: true,
            restore: true,
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();
        const [restoreOutputStream, restoreResultPromise] =
          StreamTest.toObjects();

        inputStream.pipe(filter).pipe(outputStream);
        filter.restore.pipe(restoreOutputStream);

        assert.deepEqual((await resultPromise).length, 32);
        assert.deepEqual((await restoreResultPromise).length, 32);
      });

      test('with restore option and more than 16 objects', async () => {
        const inputStream = StreamTest.fromObjects([
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
          (obj: { test: string }, _unused, cb) => {
            if (obj === object2) {
              return cb(true);
            }
            return cb(false);
          },
          {
            objectMode: true,
            restore: true,
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();
        const [restoreOutputStream, restoreResultPromise] =
          StreamTest.toObjects();

        inputStream.pipe(filter).pipe(outputStream);
        filter.restore.pipe(restoreOutputStream);

        assert.deepEqual((await resultPromise).length, 24);
        assert.deepEqual((await restoreResultPromise).length, 24);
      });

      test('with restore and passthrough option in a different pipeline', async () => {
        const inputStream = StreamTest.fromObjects([object1, object2]);
        const filter = new StreamFilter(
          (obj: { test: string }, _unused, cb) => {
            if (obj === object2) {
              return cb(true);
            }
            return cb(false);
          },
          {
            objectMode: true,
            restore: true,
            passthrough: true,
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();
        const [restoreOutputStream, restoreResultPromise] =
          StreamTest.toObjects();
        const restoreInputStream = StreamTest.fromObjects([object3]);

        inputStream.pipe(filter).pipe(outputStream);
        filter.restore.pipe(restoreOutputStream);
        restoreInputStream.pipe(filter.restore);

        assert.deepEqual(await resultPromise, [object1]);
        assert.deepEqual(await restoreResultPromise, [object3, object2]);
      });

      test('with restore and passthrough option in the same pipeline', async () => {
        let passThroughStream1Ended = false;
        let passThroughStream2Ended = false;
        let duplexStreamEnded = false;
        const inputStream = StreamTest.fromObjects([object1, object2, object3]);
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
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();
        const duplexStream = new Stream.Duplex({ objectMode: true });

        duplexStream._write = (obj: { test: string }, _unused, cb) => {
          duplexStream.push(obj);
          setImmediate(cb);
        };
        duplexStream._read = () => {};
        duplexStream.on('finish', () => {
          setTimeout(() => {
            duplexStream.push(null);
          }, 100);
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

        outputStream.on('end', () => {
          assert(
            passThroughStream1Ended,
            'PassThrough stream ends before the output one.',
          );
          assert(
            passThroughStream2Ended,
            'PassThrough stream ends before the output one.',
          );
          assert(
            duplexStreamEnded,
            'Duplex stream ends before the output one.',
          );
        });

        filter.restore.on('end', () => {
          assert(
            passThroughStream1Ended,
            'PassThrough stream ends before the restore one.',
          );
          assert(
            passThroughStream2Ended,
            'PassThrough stream ends before the restore one.',
          );
          assert(
            duplexStreamEnded,
            'Duplex stream ends before the restore one.',
          );
        });

        assert.deepEqual(await resultPromise, [object1, object2, object3]);
      });

      test('with restore and passthrough option in the same pipeline and a buffered stream', async () => {
        let passThroughStream1Ended = false;
        let passThroughStream2Ended = false;
        let duplexStreamEnded = false;
        const inputStream = StreamTest.fromObjects([object1, object2, object3]);
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
          },
        );
        const [outputStream, resultPromise] = StreamTest.toObjects();
        const duplexStream = new Stream.Duplex({ objectMode: true });
        const duplexStreamSpy = {
          objs: [] as { test: string }[],
          hasFinished: false,
        };

        duplexStream._write = (obj: { test: string }, _unused, cb) => {
          duplexStreamSpy.objs.push(obj);
          cb();
        };
        duplexStream._read = () => {
          let obj;

          if (duplexStreamSpy.hasFinished) {
            while (duplexStreamSpy.objs.length) {
              obj = duplexStreamSpy.objs.shift();
              if (!duplexStream.push(obj)) {
                break;
              }
            }
            if (0 === duplexStreamSpy.objs.length) {
              duplexStream.push(null);
            }
          }
        };
        duplexStream.on('finish', () => {
          duplexStreamSpy.hasFinished = true;
          duplexStream._read(1);
        });
        outputStream.on('end', () => {
          assert(
            passThroughStream1Ended,
            'PassThrough stream ends before the output one.',
          );
          assert(
            passThroughStream2Ended,
            'PassThrough stream ends before the output one.',
          );
          assert(
            duplexStreamEnded,
            'Duplex stream ends before the output one.',
          );
        });
        filter.restore.on('end', () => {
          assert(
            passThroughStream1Ended,
            'PassThrough stream ends before the restore one.',
          );
          assert(
            passThroughStream2Ended,
            'PassThrough stream ends before the restore one.',
          );
          assert(
            duplexStreamEnded,
            'Duplex stream ends before the restore one.',
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
        assert.deepEqual(await resultPromise, [object2, object1, object3]);
      });
    });
  });

  describe('in buffer mode', () => {
    describe('should work', () => {
      const buffer1 = Buffer.from('plop', 'utf-8');
      const buffer2 = Buffer.from('plop2', 'utf-8');
      const buffer3 = Buffer.from('plop3', 'utf-8');

      test('with no restore option', async () => {
        const inputStream = StreamTest.fromChunks([buffer1, buffer2]);
        const filter = new StreamFilter((chunk, encoding, cb) => {
          if (chunk.toString() === buffer1.toString()) {
            return cb(true);
          }
          return cb(false);
        });
        const [outputStream, resultPromise] = StreamTest.toText();

        inputStream.pipe(filter).pipe(outputStream);

        assert.deepEqual(await resultPromise, buffer2.toString());
      });

      test('with restore option', async () => {
        const inputStream = StreamTest.fromChunks([buffer1, buffer2]);
        const filter = new StreamFilter(
          (chunk, encoding, cb) => {
            if (chunk.toString() === buffer2.toString()) {
              return cb(true);
            }
            return cb(false);
          },
          {
            restore: true,
          },
        );
        const [outputStream, resultPromise] = StreamTest.toText();
        const [restoreOutputStream, restoreResultPromise] = StreamTest.toText();

        inputStream.pipe(filter).pipe(outputStream);
        filter.restore.pipe(restoreOutputStream);

        assert.deepEqual(await resultPromise, buffer1.toString());
        assert.deepEqual(await restoreResultPromise, buffer2.toString());
      });

      test('with restore and passthrough option', async () => {
        const inputStream = StreamTest.fromChunks([buffer1, buffer2]);
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
          },
        );
        const [outputStream, resultPromise] = StreamTest.toText();
        const [restoreOutputStream, restoreResultPromise] = StreamTest.toText();
        const restoreInputStream = StreamTest.fromChunks([buffer3]);

        inputStream.pipe(filter).pipe(outputStream);
        filter.restore.pipe(restoreOutputStream);
        restoreInputStream.pipe(filter.restore);

        assert.deepEqual(await resultPromise, buffer1.toString());
        assert.deepEqual(
          await restoreResultPromise,
          [buffer3.toString(), buffer2.toString()].join(''),
        );
      });
    });
  });
});

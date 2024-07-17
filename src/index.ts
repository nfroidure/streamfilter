'use strict';

import { Transform, Duplex, Readable, type Writable } from 'node:stream';
import { YError } from 'yerror';

export type StreamFilterCallback<O extends Partial<StreamFilterOptions>, T> =
  | ((
      item: StreamFilterItem<O, T>,
      encoding: Parameters<Transform['_transform']>[1] | undefined,
      cb: (filtered: boolean) => void,
    ) => void)
  | ((
      item: StreamFilterItem<O, T>,
      encoding?: Parameters<Transform['_transform']>[1],
    ) => Promise<boolean>);
export type StreamFilterOptions = {
  passthrough: boolean;
  restore: boolean;
  objectMode: boolean;
};
export type StreamFilterRestore<O extends Partial<StreamFilterOptions>> =
  O extends {
    passthrough: true;
  }
    ? Duplex
    : O extends {
          restore: true;
        }
      ? Readable
      : null;
export type StreamFilterItem<
  O extends Partial<StreamFilterOptions>,
  T,
> = O extends {
  objectMode: true;
}
  ? T
  : Buffer;

const DEFAULT_OPTIONS: StreamFilterOptions = {
  restore: false,
  objectMode: false,
  passthrough: false,
};

/** Filter piped in streams according to the given `filterCallback`. */
class StreamFilter<
  T,
  O extends Partial<StreamFilterOptions>,
> extends Transform {
  restore: StreamFilterRestore<O>;

  private _filterCallback: StreamFilterCallback<O, T>;
  private _options: StreamFilterOptions = DEFAULT_OPTIONS;
  private _filterStreamEnded = false;
  private _restoreStreamCallback: null | (() => void) = null;
  private _restoreManager: RestoreManager<T> | null;
  /**
   * Options are passed in as is in the various stream instances spawned by this
   *  module. So, to use the objectMode, simply pass in the `options.objectMode`
   *  value set to `true`.
   * @param {Function} filterCallback    Callback applying the filters
   * @param {Object} options           Filtering options
   * @param {boolean} options.passthrough
   * Set to `true`, this option changes the restore stream nature from a readable
   *  stream to a passthrough one, allowing you to reuse the filtered chunks in an
   *  existing pipeline.
   * @param {boolean} options.restore
   * Set to `true`, this option create a readable stream allowing you to use the
   *  filtered chunks elsewhere. The restore stream is exposed in the `FilterStream`
   *  instance as a `restore` named property.
   * @return {StreamFilter}                 The filtering stream
   */
  constructor(
    filterCallback: StreamFilterCallback<O, T>,
    options: O = DEFAULT_OPTIONS as O,
  ) {
    super({
      objectMode: !!options.objectMode,
    });

    this._options = {
      ...DEFAULT_OPTIONS,
      ...options,
      passthrough: (options.restore && options.passthrough) || false,
    };

    // filter callback is required
    if (!(filterCallback instanceof Function)) {
      throw new YError('E_BAD_FILTER_CALLBACK', typeof filterCallback);
    }
    this._filterCallback = filterCallback;

    // Creating the restored stream if necessary
    if (options.passthrough === true) {
      this.restore = new Duplex({
        objectMode: this._options.objectMode,
        write: (chunk, encoding, done) => {
          this._restoreManager?.programPush(chunk, encoding, done);
        },
      }) as StreamFilterRestore<O>;
      this._restoreManager = createReadStreamBackpressureManager<T>(
        this.restore as Readable,
      );

      (this.restore as unknown as Duplex).on('finish', () => {
        this._restoreStreamCallback = () => {
          this._restoreManager?.programPush(null, undefined, () => {});
        };
        if (this._filterStreamEnded) {
          this._restoreStreamCallback();
        }
      });
    } else if (options.restore === true) {
      this.restore = new Readable(options) as StreamFilterRestore<O>;
      this._restoreManager = createReadStreamBackpressureManager(
        this.restore as Readable,
      );
    } else {
      this.restore = null as StreamFilterRestore<O>;
      this._restoreManager = null;
    }
  }

  async _transform(
    chunk: StreamFilterItem<O, T>,
    encoding: Parameters<Writable['write']>[1],
    done: () => void,
  ) {
    const cb = (filter: boolean) => {
      if (!filter) {
        this.push(chunk, encoding);
        done();
        return;
      }
      if (this._options.restore) {
        this._restoreManager?.programPush(chunk, encoding, () => {
          done();
        });
        return;
      }
      done();
    };

    const result = this._filterCallback(chunk, encoding, cb);

    if (result instanceof Promise) {
      cb(await result);
    }
  }

  _flush(done: () => void) {
    this._filterStreamEnded = true;
    done();
    if (this._options.restore) {
      if (!this._options.passthrough) {
        this._restoreManager?.programPush(null, undefined, () => {
          done();
        });
      } else if (this._restoreStreamCallback) {
        this._restoreStreamCallback();
      }
    }
  }
}

type ProgammedPush<T> = [
  T | Buffer | null,
  Parameters<Writable['write']>[1] | undefined,
  () => void,
];
type RestoreManager<T> = {
  waitPush: boolean;
  programmedPushs: ProgammedPush<T>[];
  programPush: (
    chunk: ProgammedPush<T>[0],
    encoding: ProgammedPush<T>[1],
    done: ProgammedPush<T>[2],
  ) => void;
  attemptPush: () => void;
};

// Utils to manage readable stream backpressure
function createReadStreamBackpressureManager<T>(
  readableStream: Readable,
): RestoreManager<T> {
  const manager: RestoreManager<T> = {
    waitPush: true,
    programmedPushs: [] as ProgammedPush<T>[],
    programPush: function programPush(
      chunk: ProgammedPush<T>[0],
      encoding: ProgammedPush<T>[1],
      done: ProgammedPush<T>[2],
    ) {
      // Store the current write
      manager.programmedPushs.push([chunk, encoding, done]);
      // Need to be async to avoid nested push attempts
      // Program a push attempt
      setImmediate(manager.attemptPush);
      // Let's say we're ready for a read
      readableStream.emit('readable');
      readableStream.emit('drain');
    },
    attemptPush: function attemptPush() {
      let nextPush: ProgammedPush<T>;

      if (manager.waitPush) {
        if (manager.programmedPushs.length) {
          nextPush = manager.programmedPushs.shift() as ProgammedPush<T>;
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

/**
 * Utility function if you prefer a functional way of using this lib
 * @param filterCallback
 * @param options
 * @returns Stream
 */
export function filterStream<O extends Partial<StreamFilterOptions>, T>(
  filterCallback: StreamFilterCallback<O, T>,
  options: O = DEFAULT_OPTIONS as O,
) {
  return new StreamFilter<T, O>(filterCallback, options);
}

export { StreamFilter };

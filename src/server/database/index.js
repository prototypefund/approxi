import EventEmitter from 'events';
import r from 'rethinkdb';
import debug from 'debug';

const log = debug('server:database');

export default class Database extends EventEmitter {
  #connection = null;
  options;

  constructor(options) {
    super();
    this.options = { ...options };
  }

  async connect() {
    if (!this.#connection || !this.#connection.isOpen()) {
      this.#connection = await r.connect(this.options);
      log('connected');
      this.#connection.use(this.options.db);
      for (const event of ['close', 'timeout', 'error']) {
        this.#connection.on(event, this._droppedConnectionHandler(event));
      }
      log('setup');
      try {
        this.createDatabase(this.options.db);
      } catch (error) {
        log('setup error');
        await this.disconnect();
        throw error;
      }
      this.emit('connect');
    }
  }

  // https://github.com/babel/babel-eslint/issues/749
  // #droppedConnectionHandler(event) {
  _droppedConnectionHandler(event) {
    return async () => {
      log(`connection ${event}`);
      await this.disconnect();
    };
  }

  async disconnect() {
    if (this.#connection && this.#connection.isOpen()) {
      await this.#connection.close();
      this.emit('disconnect');
    }
    this.#connection = null;
  }

  // https://github.com/babel/babel-eslint/issues/749
  // #throwResultError(result) {
  _throwResultError(result) {
    if (result.errors) {
      throw result.first_error;
    }
  }

  async createDatabase(name) {
    log('createDatabase', name);
    await this.connect();
    try {
      return await r.dbCreate(name).run(this.#connection);
    } catch (error) {
      if (error instanceof r.Error.ReqlRuntimeError) {
        log(`database ${name} exists`);
      } else {
        throw error;
      }
    }
  }

  async createTable(name) {
    log('createTable', name);
    await this.connect();
    try {
      return await r.tableCreate(name).run(this.#connection);
    } catch (error) {
      if (error instanceof r.Error.ReqlOpFailedError) {
        log(`table ${name} exists`);
      } else {
        throw error;
      }
    }
  }

  async getDoc(tableName, docId, excludedProperties) {
    log('getDoc', tableName, docId, excludedProperties);
    await this.connect();
    let cmd = r.table(tableName).get(docId).default(null);
    if (excludedProperties) {
      cmd = cmd.without(excludedProperties);
    }
    return cmd.run(this.#connection);
  }

  async insertDoc(tableName, data) {
    log('insertDoc', tableName, data);
    await this.connect();
    const result = await r.table(tableName).insert(data).run(this.#connection);
    this._throwResultError(result);
    log('inserted', result);
    return data.id || result.generated_keys[0];
  }

  async deleteDoc(tableName, docId) {
    log('deleteDoc', tableName, docId);
    await this.connect();
    const result = await r.table(tableName).get(docId).delete().run(this.#connection);
    this._throwResultError(result);
    log('deleted', result);
  }

  async updateDocOptimistically(tableName, docId, updateCallback, lockProperty = '_lock', excludedProperties = []) {
    log('updateDoc', tableName, docId);
    await this.connect();
    const withoutProps = [lockProperty, ...excludedProperties];
    let doc;
    let updateResult;
    do {
      doc = await this.getDoc(tableName, docId);
      if (!doc) {
        return null;
      }
      doc = updateCallback(doc);
      const lock = doc[lockProperty] || 0;
      const cas = latestDoc => {
        return r.branch(latestDoc(lockProperty).default(0).eq(lock),
          r(doc).merge({
            [lockProperty]: lock === Number.MAX_SAFE_INTEGER ? 0 : lock + 1
          }),
          {}
        );
      };
      const cmd = r.table(tableName).get(docId).update(cas);
      updateResult = await cmd.run(this.#connection);
    } while (updateResult.unchanged);
    this._throwResultError(updateResult);
    for (const prop of withoutProps) {
      delete doc[prop];
    }
    return doc;
  }

  async subscribeToTableChanges(tableName, callback, excludedProperties) {
    await this.connect();
    const query = r.table(tableName).without(excludedProperties);
    const cursor = await query.changes().run(this.#connection);
    log(`changefeed subscription started for table ${tableName}`);
    cursor.on('data', callback);
    cursor.on('error', error => {
      log('subscription cursor error', error);
    });
    this.once('connect', () => {
      log(`resubscribe to changefeed for table ${tableName}`);
      this.subscribeToTableChanges(tableName, callback, excludedProperties);
    });
  }
};

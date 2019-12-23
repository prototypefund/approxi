import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import Database from '.';

export default class Model {
  #db;
  #tableName;
  lockProperty = '_lock';
  hiddenProperties = [this.lockProperty];
  #schema;

  constructor(db, tableName, schema) {
    if (!(db instanceof Database)) {
      throw new TypeError('Database required');
    }
    this.#db = db;
    if (typeof tableName !== 'string') {
      throw new TypeError('Table name required');
    }
    this.#tableName = tableName;
    if (typeof schema !== 'object') {
      throw new TypeError('Schema required');
    }
    this.#schema = schema;
    this._setUp();
  }

  // https://github.com/babel/babel-eslint/issues/749
  // async #setUp() {
  async _setUp() {
    await this.#db.createTable(this.#tableName);
  }

  get defaultDoc() {
    return mapValues(pick(this.#schema.properties, this.#schema.required), ({ default: d }) => d);
  }

  get(id) {
    return this.#db.getDoc(this.#tableName, id, this.hiddenProperties);
  }

  insert(data) {
    return this.#db.insertDoc(this.#tableName, { ...this.defaultDoc, ...data });
  }

  delete(id) {
    this.#db.deleteDoc(this.#tableName, id);
  }

  update(id, callback) {
    return this.#db.updateDocOptimistically(this.#tableName, id, callback, this.lockProperty, [...this.hiddenProperties]);
  }

  subscribe(callback) {
    return this.#db.subscribeToTableChanges(this.#tableName, callback, [...this.hiddenProperties]);
  }
}

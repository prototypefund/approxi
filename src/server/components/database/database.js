import Database from '../../database';

export default () => {
  let db;

  return {
    async start({ config }) {
      db = new Database(config);
      await db.connect();
      return db;
    },
    async stop() {
      if (db) {
        await db.disconnect();
        db = null;
      }
    }
  };
};

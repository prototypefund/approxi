import express from 'express';

export default () => ({
  async start({ config }) {
    const app = express();
    for (const [key, value] of Object.entries(config)) {
      app.set(key, value);
    }
    return app;
  }
});

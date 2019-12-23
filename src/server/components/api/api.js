import router from '../../routes/api';

export default () => ({
  async start({ app }) {
    return router(app);
  }
});

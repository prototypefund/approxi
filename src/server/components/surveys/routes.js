import router from '../../routes/api/surveys';

export default () => ({
  async start({
    routes: {
      api
    },
    services: {
      surveys
    }
  }) {
    return router(api, surveys);
  }
});

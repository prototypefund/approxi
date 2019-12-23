import changeStream from '../../streams/changes';

export default () => ({
  async start({
    server: {
      ws
    },
    services: {
      surveys
    }
  }) {
    return changeStream(ws.of('/surveys/stats'), surveys, 'stats');
  }
});

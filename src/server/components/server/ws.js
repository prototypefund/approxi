import io from 'socket.io';
import debug from 'debug';

export default () => {
  let socket;

  async function start({ server: { http }, config }) {
    socket = io(http, config);
    return socket;
  }

  async function stop() {
    return new Promise((resolve, reject) => {
      if (socket) {
        socket.close(() => {
          socket = null;
          resolve();
        });
      }
    });
  }

  return {
    start,
    stop
  };
};

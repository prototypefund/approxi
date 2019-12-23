import http from 'http';
import debug from 'debug';

const log = debug('server:http');

function normalizePort(val) {
  const port = Number.parseInt(val, 10);
  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

export default () => {
  let port;
  let server;

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        log(bind + ' requires elevated privileges');
        process.exit(1);
        // break;
      case 'EADDRINUSE':
        log(bind + ' is already in use');
        process.exit(1);
        // break;
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    log('Listening on ' + bind);
  }

  async function start({ config, app }) {
    return new Promise((resolve, reject) => {
      port = normalizePort(config.port);
      app.set('port', port);
      server = http.createServer(app);
      server.on('listening', onListening);
      server.once('listening', () => resolve(server));
      server.on('error', onError);
      server.once('error', error => reject(error));
      server.listen(port);
    });
  }

  async function stop() {
    return new Promise((resolve, reject) => {
      if (server) {
        server.close(error => {
          if (error) {
            reject(error);
          } else {
            server = null;
            resolve();
          }
        });
      }
    });
  }

  return {
    start,
    stop
  };
};

import 'dotenv/config';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import runner from 'systemic-service-runner';
import debug from 'debug';
import system from './system';

const log = debug('server');

runner(system(), {
  logger: {
    error: log,
    info: log
  }
}).start((error, components) => {
  if (error) {
    throw error;
  }
  log('started');
});

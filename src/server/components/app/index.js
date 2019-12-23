import systemic from 'systemic';
import app from './app';
import middleware from './default-middleware';

export default () => systemic({ name: 'app' })
  .add('app', app()).dependsOn('config')
  .add('middleware', middleware()).dependsOn('config', 'app');

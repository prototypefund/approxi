import systemic from 'systemic';
import http from './http';
import ws from './ws';

export default () => systemic({ name: 'server' })
  .add('server.http', http()).dependsOn('config', 'app')
  .add('server.ws', ws()).dependsOn('config', 'server.http');

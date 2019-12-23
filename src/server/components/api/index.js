import systemic from 'systemic';
import api from './api';

export default () => systemic({ name: 'api' })
  .add('routes.api', api()).dependsOn('app');

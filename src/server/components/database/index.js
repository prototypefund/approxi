import systemic from 'systemic';
import database from './database';

export default () => systemic({ name: 'database' })
  .add('database', database()).dependsOn('config');
